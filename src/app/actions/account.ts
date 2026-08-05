"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function updateAccountSettings(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const tenantId = session.user.tenantId;

    if (!name || !email || !phone) {
      throw new Error("Nama, email, dan nomor WA wajib diisi");
    }

    // Check if email is used by another user
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingEmail && existingEmail.id !== userId) {
      throw new Error("Email sudah digunakan oleh akun lain");
    }

    // Base update data for User
    let userUpdateData: any = {
      name,
      email,
      phone,
    };

    // If password is provided, hash and update it
    if (password && password.trim() !== "") {
      if (password.length < 8) {
        throw new Error("Password harus minimal 8 karakter");
      }
      const hashedPassword = await hash(password, 10);
      userUpdateData.password = hashedPassword;
      userUpdateData.plainPassword = password; // For WA notifications compatibility
    }

    // Perform updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      });

      // Update Tenant's noHpRt for backward compatibility and system notifications
      if (tenantId) {
        await tx.tenant.update({
          where: { id: tenantId },
          data: { noHpRt: phone }
        });
      }
    });

    revalidatePath("/dashboard/rt/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui profil" };
  }
}
