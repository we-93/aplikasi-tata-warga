"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// 1. UPDATE SUPER ADMIN PROFILE
export async function updateSuperAdminProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const dataToUpdate: any = {};
    if (email) dataToUpdate.email = email;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: dataToUpdate
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. UPDATE SYSTEM SETTINGS (Favicon, Maintenance, Upload Size, Session Expiry)
export async function updateSystemSettings(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };

    const faviconUrl = formData.get("faviconUrl") as string;
    const maintenanceMode = formData.get("maintenanceMode") === "true";
    const maxUploadSizeMb = formData.get("maxUploadSizeMb") ? parseInt(formData.get("maxUploadSizeMb") as string) : undefined;
    const sessionExpiryDays = formData.get("sessionExpiryDays") ? parseInt(formData.get("sessionExpiryDays") as string) : undefined;

    const existing = await prisma.siteSettings.findFirst({ where: { tenant_id: null } });

    const data = {
      ...(faviconUrl && { faviconUrl }),
      maintenanceMode,
      ...(maxUploadSizeMb && { maxUploadSizeMb }),
      ...(sessionExpiryDays && { sessionExpiryDays })
    };

    if (existing) {
      await prisma.siteSettings.update({ where: { id: existing.id }, data });
    } else {
      await prisma.siteSettings.create({ data });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/"); // revalidate root to apply favicon/maintenance
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. ADMIN TEAM MANAGEMENT
export async function addSuperAdmin(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;

    if (!email || !name || !password) return { success: false, error: "Semua field harus diisi." };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "Email sudah digunakan." };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "SUPER_ADMIN"
      }
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeSuperAdmin(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };
    
    // Prevent deleting oneself
    if (session.user.id === id) {
      return { success: false, error: "Tidak dapat menghapus akun Anda sendiri." };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
