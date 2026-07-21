"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function terbitkanPengumuman(data: { title: string; content: string }) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true }
    });
    if (!user?.tenantId) throw new Error("Akses ditolak.");

    if (!data.title || !data.content) {
      throw new Error("Judul dan isi pengumuman wajib diisi.");
    }

    await prisma.pengumuman.create({
      data: {
        tenantId: user.tenantId,
        title: data.title,
        content: data.content
      }
    });

    revalidatePath("/dashboard/rt");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function hapusPengumuman(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true }
    });
    if (!user?.tenantId) throw new Error("Akses ditolak.");

    await prisma.pengumuman.delete({
      where: {
        id,
        tenantId: user.tenantId
      }
    });

    revalidatePath("/dashboard/rt");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
