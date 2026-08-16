"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getCycleStart } from "@/lib/utils";

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

    // Quota Limit checking has been removed based on new requirements

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
