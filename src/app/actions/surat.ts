"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createSuratArsip(
  templateId: string, 
  wargaId: string, 
  userNomorSurat?: string,
  wargaData?: Record<string, any>,
  customData?: Record<string, string>,
  userKodeSurat?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { success: false, error: "Unauthorized" };
    }
    const tenantId = session.user.tenantId;

    // Check Surat Quota Limit
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return { success: false, error: "Tenant tidak ditemukan" };

    const currentProduct = await prisma.product.findFirst({ where: { name: tenant.subscriptionPlan } });
    const baseSurat = currentProduct?.maxSurat === -1 ? 9999999 : (currentProduct?.maxSurat || 0);
    const totalSuratLimit = baseSurat + (tenant.addonMaxSurat || 0);

    if (totalSuratLimit !== 9999999) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const suratCount = await prisma.suratArsip.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth }
        }
      });

      if (suratCount >= totalSuratLimit) {
        return { success: false, error: "Kuota Pembuatan Surat Anda bulan ini telah habis. Silakan Upgrade Paket atau Topup Kuota Surat." };
      }
    }

    // Update Warga data if provided from the live form
    if (wargaData && Object.keys(wargaData).length > 0) {
      await prisma.warga.update({
        where: { id: wargaId },
        data: wargaData
      });
    }

    const arsip = await prisma.suratArsip.create({
      data: {
        tenantId,
        templateId,
        wargaId,
        nomorSurat: userNomorSurat || '',
        kodeSurat: userKodeSurat || null,
        customData: customData || undefined,
        // pdfUrl will be handled dynamically via API route for MVP to avoid disk IO
        pdfUrl: null 
      }
    });

    // Update pdfUrl to point to the dynamic download route
    await prisma.suratArsip.update({
      where: { id: arsip.id },
      data: { pdfUrl: `/api/surat/${arsip.id}/download` }
    });

    revalidatePath("/dashboard/rt/surat");
    return { success: true, arsipId: arsip.id };
  } catch (error: any) {
    console.error("Failed to create surat arsip:", error);
    return { success: false, error: "Error: " + (error.message || String(error)) };
  }
}

export async function deleteSuratArsip(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return { success: false, error: "Unauthorized" };

    const arsip = await prisma.suratArsip.findUnique({ where: { id } });
    if (!arsip || arsip.tenantId !== session.user.tenantId) {
      return { success: false, error: "Surat tidak ditemukan atau tidak ada akses." };
    }

    await prisma.suratArsip.delete({ where: { id } });
    revalidatePath("/dashboard/rt/surat");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete surat arsip:", error);
    return { success: false, error: "Gagal menghapus riwayat surat." };
  }
}
