"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeLog } from "./logs";

function checkSuperAdmin(session: any) {
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }
}

// -----------------------------------------------------------------------------
// TAB 1: TENANTS (RT)
// -----------------------------------------------------------------------------
export async function getTenants() {
  const session = await auth();
  checkSuperAdmin(session);
  const tenants = await prisma.tenant.findMany({
    include: {
      subscriptions: {
        include: { product: true },
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1
      },
      waDevice: true
    },
    orderBy: { createdAt: "desc" }
  });

  return tenants.map(t => ({
    ...t,
    subscriptions: t.subscriptions.map(s => ({
      ...s,
      product: {
        ...s.product,
        price: Number(s.product.price),
        hargaPendaftaran: Number(s.product.hargaPendaftaran),
        hargaPerpanjangan: Number(s.product.hargaPerpanjangan)
      }
    }))
  }));
}

// -----------------------------------------------------------------------------
// TAB 2: PRODUCTS (PAKET)
// -----------------------------------------------------------------------------
export async function getProducts() {
  const session = await auth();
  checkSuperAdmin(session);
  const products = await prisma.product.findMany({ orderBy: { hargaPendaftaran: "asc" } });
  return products.map(p => ({
    ...p,
    price: Number(p.price),
    hargaPendaftaran: Number(p.hargaPendaftaran),
    hargaPerpanjangan: Number(p.hargaPerpanjangan)
  }));
}

export async function upsertProduct(data: {
  id?: string;
  name: string;
  price: number;
  billingPeriod: string;
  type: string;
  masaAktifBulan: number;
  hargaPendaftaran: number;
  hargaPerpanjangan: number;
  maxWarga: number;
  maxSurat: number;
  maxAiChat: number;
  maxAiToken: number;
  isActive: boolean;
}) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    // Auto-generate slug if new
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (data.id) {
      await prisma.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          price: data.hargaPendaftaran, // Sync price field with hargaPendaftaran
          billingPeriod: data.billingPeriod,
          type: data.type,
          masaAktifBulan: data.masaAktifBulan,
          hargaPendaftaran: data.hargaPendaftaran,
          hargaPerpanjangan: data.hargaPerpanjangan,
          maxWarga: data.maxWarga,
          maxSurat: data.maxSurat,
          maxAiChat: data.maxAiChat,
          maxAiToken: data.maxAiToken,
          isActive: data.isActive
        }
      });
    } else {
      await prisma.product.create({
        data: {
          name: data.name,
          slug,
          price: data.hargaPendaftaran, // Sync price field with hargaPendaftaran
          billingPeriod: data.billingPeriod,
          type: data.type,
          masaAktifBulan: data.masaAktifBulan,
          hargaPendaftaran: data.hargaPendaftaran,
          hargaPerpanjangan: data.hargaPerpanjangan,
          maxWarga: data.maxWarga,
          maxSurat: data.maxSurat,
          maxAiChat: data.maxAiChat,
          maxAiToken: data.maxAiToken,
          isActive: data.isActive
        }
      });
    }
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/customer");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus produk. Mungkin produk ini sudah digunakan oleh pelanggan." };
  }
}

// -----------------------------------------------------------------------------
// SITE SETTINGS
// -----------------------------------------------------------------------------
export async function saveBankInstructions(bankInstructions: any) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    // Assuming siteSettings has id "1" or we findFirst
    const existing = await prisma.siteSettings.findFirst();
    if (existing) {
      await prisma.siteSettings.update({
        where: { id: existing.id },
        data: { bankInstructions }
      });
    } else {
      await prisma.siteSettings.create({
        data: { bankInstructions }
      });
    }
    revalidatePath("/admin/billing");
    revalidatePath("/checkout/success/[invoiceId]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveQrisUrl(qrisUrl: string | null) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    const existing = await prisma.siteSettings.findFirst();
    if (existing) {
      await prisma.siteSettings.update({
        where: { id: existing.id },
        data: { qrisUrl }
      });
    } else {
      await prisma.siteSettings.create({
        data: { qrisUrl }
      });
    }
    revalidatePath("/admin/billing");
    revalidatePath("/checkout/success/[invoiceId]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// TAB 3: INVOICES
// -----------------------------------------------------------------------------
export async function getInvoices() {
  const session = await auth();
  checkSuperAdmin(session);
  const invoices = await prisma.invoice.findMany({
    include: {
      tenant: true,
      product: true
    },
    orderBy: { createdAt: "desc" }
  });

  return invoices.map(inv => ({
    ...inv,
    amount: Number(inv.amount),
    product: inv.product ? {
      ...inv.product,
      price: Number(inv.product.price),
      hargaPendaftaran: Number(inv.product.hargaPendaftaran),
      hargaPerpanjangan: Number(inv.product.hargaPerpanjangan)
    } : null
  }));
}

export async function cancelInvoice(id: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { tenant: true } });
    if (!invoice) throw new Error("Invoice tidak ditemukan");

    await prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    // Send WhatsApp Cancellation Notification
    try {
      const settings = await prisma.siteSettings.findFirst();
      if (settings?.waAdminApiKey) {
        const phone = invoice.tenant?.noHpRt;
        if (phone) {
          const cancelMessage = `Mohon maaf, pembayaran untuk pesanan Anda (Invoice: *${invoice.invoiceNumber}*) belum dapat kami verifikasi atau telah ditolak oleh sistem.\n\nSilakan hubungi Admin jika Anda merasa ini adalah kesalahan. Terima kasih.`;
          const { sendMessage } = await import("@/lib/whatsapp");
          sendMessage(
            settings.waAdminApiKey,
            phone,
            cancelMessage,
            settings.waAdminProvider || "FONNTE"
          ).catch(e => console.error("Error sending WA cancel notification:", e));
        }
      }
    } catch (e) {
      console.error("Failed to send cancellation WA", e);
    }

    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveInvoice(id: string, waDeviceId: string, status: string = "AKTIF") {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    const invoice = await prisma.invoice.findUnique({ 
      where: { id }, 
      include: { tenant: true, product: true } 
    });
    if (!invoice) throw new Error("Invoice tidak ditemukan");

    const settings = await prisma.siteSettings.findFirst({ where: { tenant_id: null } });
    let finalWaDeviceId = invoice.tenant.waDeviceId || waDeviceId;
    let finalGroupId = invoice.tenant.whatsappGroupId;
    let finalBotNo = invoice.tenant.whatsappBotNo;

    if (!finalGroupId) {
      const waDevice = await prisma.waDevice.findUnique({ 
        where: { id: finalWaDeviceId },
        include: { groups: true }
      });
      
      if (!waDevice) throw new Error("Perangkat WA tidak ditemukan");
      
      const availableGroup = waDevice.groups.find((g: any) => !g.tenantId);
      
      if (!availableGroup) {
        throw new Error("Gagal ACC: Grup pada Bot habis, silakan tambah grup RT baru di pengaturan perangkat (Integrasi)");
      }

      finalGroupId = availableGroup.groupId;
      finalBotNo = waDevice.phoneNumber || "000000000";

      // 2.5 Update WaGroup untuk menandai bahwa grup ini sudah terpakai
      await prisma.waGroup.update({
        where: { id: availableGroup.id },
        data: { tenantId: invoice.tenantId }
      });
    }

    // Hitung Expires At berdasarkan masaAktifBulan
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + invoice.product.masaAktifBulan);

    // 2. Update Tenant Status and Integrations and Quotas
    const tenantUpdateData: any = {
      status: status,
      waDeviceId: finalWaDeviceId,
      whatsappGroupId: finalGroupId,
      whatsappBotNo: finalBotNo
    };

    if (invoice.product.type === "ADDON") {
      tenantUpdateData.addonMaxSurat = (invoice.tenant.addonMaxSurat || 0) + (invoice.product.maxSurat || 0);
      tenantUpdateData.addonMaxAiToken = (invoice.tenant.addonMaxAiToken || 0) + (invoice.product.maxAiToken || 0);
    } else {
      tenantUpdateData.subscriptionPlan = invoice.product.name;
      tenantUpdateData.activeUntil = expiresAt;
      tenantUpdateData.maxWarga = invoice.product.maxWarga;
    }

    await prisma.tenant.update({
      where: { id: invoice.tenantId },
      data: tenantUpdateData
    });

    // 1. Update Invoice Status
    await prisma.invoice.update({
      where: { id },
      data: { status: "COMPLETED" }
    });

    // 3. Create or Update Subscription
    // Check if subscription exists
    const existingSub = await prisma.subscription.findFirst({
      where: { tenantId: invoice.tenantId }
    });

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          productId: invoice.productId,
          status: "ACTIVE",
          expiresAt
        }
      });
    } else {
      await prisma.subscription.create({
        data: {
          tenantId: invoice.tenantId,
          productId: invoice.productId,
          status: "ACTIVE",
          expiresAt
        }
      });
    }

    // Ambil data User untuk mendapatkan email & (dummy) password
    const user = await prisma.user.findFirst({
      where: { tenantId: invoice.tenantId, role: "TENANT_ADMIN" }
    });

    // 4. MENGIRIM WA MENGGUNAKAN TEMPLATE
    if (settings?.waAdminApiKey) {
      // Fetch link grup if available
      let groupLink = "-";
      if (finalGroupId) {
        const waGroup = await prisma.waGroup.findFirst({ where: { groupId: finalGroupId } });
        if (waGroup && waGroup.groupInviteLink) {
          groupLink = waGroup.groupInviteLink;
        }
      }

      let template = "";
      if (invoice.orderType === "NEW") {
        template = settings?.waAdminTemplate || "Halo, akun Tata Warga Anda sudah aktif!\nNo Invoice: {{invoice}}\nEmail: {{email}}\nPassword: {{password}}\nNo. Bot WA: {{bot_wa}}\nSilakan masuk ke: {{link_login}}\nGrup WA: {{link_grup}}\n\nJika ada pertanyaan silakan balas pesan ini.";
      } else {
        template = settings?.waAdminTopupTemplate || "Terima kasih Kak {{NAMA}}, pembayaran Anda di Tata Warga telah berhasil 🥳\nRincian Pembayaran:\nNo. Invoice: {{invoice}}\nTanggal Invoice: {{tanggal}}\nProduk: {{PRODUK}}\nJumlah Pembayaran: Rp {{HARGA}}\nLink Login: {{link_login}}\n\nTerima kasih telah memilih Tata Warga! Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.";
      }

      let bankInfo = "BCA 1234567890 a.n PT Tata Warga Digital";
      try {
        if (settings.bankInstructions) {
          const banks = typeof settings.bankInstructions === 'string' ? JSON.parse(settings.bankInstructions) : settings.bankInstructions;
          if (Array.isArray(banks) && banks.length > 0) {
            bankInfo = banks.map(b => `${b.bank} ${b.account} a.n ${b.name}`).join(", ");
          }
        }
      } catch (e) {}

      template = template.replace(/{{invoice}}/gi, invoice.invoiceNumber);
      template = template.replace(/{{email}}/gi, user?.email || "-");
      template = template.replace(/{{password}}/gi, user?.plainPassword || "-"); // Using plainPassword as requested
      template = template.replace(/{{bot_wa}}/gi, finalBotNo || "-");
      template = template.replace(/{{link_login}}/gi, "http://localhost:3000/login");
      template = template.replace(/{{link_grup}}/gi, groupLink);
      
      // Additional variables for topup template
      template = template.replace(/{{nama}}/gi, user?.name || invoice.tenant.name || "-");
      template = template.replace(/{{tanggal}}/gi, new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }));
      template = template.replace(/{{produk}}/gi, invoice.product.name);
      template = template.replace(/{{paket}}/gi, invoice.product.name);
      template = template.replace(/{{harga}}/gi, new Intl.NumberFormat("id-ID").format(Number(invoice.amount)));
      template = template.replace(/{{bank}}/gi, bankInfo);

      const { sendMessage } = await import("@/lib/whatsapp");
      sendMessage(
        settings.waAdminApiKey, 
        invoice.tenant.noHpRt || "", 
        template, 
        settings.waAdminProvider || "FONNTE"
      ).catch(e => console.error("Error sending WA notification:", e));
    }
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve invoice:", error);
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// TAB 3: WARGA (GLOBAL SEARCH)
// -----------------------------------------------------------------------------
export async function searchWargaGlobal(query: string) {
  const session = await auth();
  checkSuperAdmin(session);
  if (!query || query.length < 3) return [];
  
  const wargas = await prisma.warga.findMany({
    where: {
      OR: [
        { nik: { contains: query } },
        { namaLengkap: { contains: query } }
      ]
    },
    include: { tenant: true },
    take: 50
  });
  
  return wargas;
}

export async function deleteWargaGlobal(wargaId: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    await prisma.warga.delete({
      where: { id: wargaId }
    });
    
    revalidatePath("/admin/data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
