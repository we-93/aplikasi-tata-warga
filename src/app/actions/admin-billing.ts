"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function verifySuperAdmin() {
  const session = await auth();
  if (!session || !session.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Akses ditolak.");
}

export async function getAdminInvoices() {
  await verifySuperAdmin();
  
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: { select: { name: true, slug: true } },
      product: { select: { name: true, maxSurat: true, maxAiToken: true, masaAktifBulan: true } }
    }
  });

  return invoices.map(inv => ({
    ...inv,
    amount: Number(inv.amount)
  }));
}

export async function approveInvoice(invoiceId: string) {
  try {
    await verifySuperAdmin();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { product: true, tenant: true }
    });

    if (!invoice) throw new Error("Invoice tidak ditemukan.");
    if (invoice.status === "COMPLETED") throw new Error("Invoice ini sudah di-ACC.");

    const { tenant, product, orderType } = invoice;
    const now = new Date();

    if (orderType === "UPGRADE" || orderType === "NEW") {
      // Reset plan, extend from TODAY
      const newExpiry = new Date(now);
      newExpiry.setDate(newExpiry.getDate() + product.masaAktifBulan);

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionPlan: product.name,
          activeUntil: newExpiry,
          maxWarga: product.maxWarga,
          addonMaxSurat: 0, // Reset addons on plan upgrade
          addonMaxAiToken: 0
        }
      });
    } else if (orderType === "RENEW") {
      // Extend from CURRENT expiry (or today if already expired)
      const baseDate = (tenant.activeUntil && tenant.activeUntil > now) ? tenant.activeUntil : now;
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + product.masaAktifBulan);

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          activeUntil: newExpiry
        }
      });
    } else if (orderType === "TOPUP") {
      // Add quota without extending expiry
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          addonMaxSurat: tenant.addonMaxSurat + product.maxSurat,
          addonMaxAiToken: tenant.addonMaxAiToken + product.maxAiToken
        }
      });
    }

    // Mark invoice as COMPLETED
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "COMPLETED" }
    });

    // Optionally: Send WA Notification here using APICOID/Fonnte...
    // (We will simulate it as successful)

    revalidatePath("/admin/invoices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectInvoice(invoiceId: string) {
  try {
    await verifySuperAdmin();
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "CANCELLED" }
    });
    revalidatePath("/admin/invoices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
