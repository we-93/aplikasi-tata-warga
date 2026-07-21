"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function deleteSuratArsipAdmin(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const arsip = await prisma.suratArsip.findUnique({ where: { id } });
    if (!arsip) {
      return { success: false, error: "Surat tidak ditemukan." };
    }

    await prisma.suratArsip.delete({ where: { id } });
    revalidatePath("/admin/surat-arsip");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete surat arsip (admin):", error);
    return { success: false, error: "Gagal menghapus riwayat surat." };
  }
}
