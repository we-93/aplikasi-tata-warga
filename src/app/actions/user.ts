"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/lib/s3";

export async function updateUserAvatar(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return { success: false, error: "Unauthorized: Please log in again." };
    }
    
    const imageUrl = formData.get("imageUrl") as string | null;
    
    if (!imageUrl) {
      return { success: false, error: "Pilih foto terlebih dahulu." };
    }

    const user = await prisma.user.findFirst({ 
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string } 
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userId = user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl }
    });

    revalidatePath("/dashboard/rt/settings");
    return { success: true, url: imageUrl };
  } catch (error: any) {
    console.error("Failed to update avatar:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}
