"use server";

import prisma from "@/lib/prisma";
import { sendMessage, formatWhatsAppNumber } from "@/lib/whatsapp";
import bcrypt from "bcryptjs";

// Helper to find user by email or tenant phone
async function findUserByIdentity(identity: string) {
  // First try email
  let user = await prisma.user.findUnique({
    where: { email: identity },
    include: { tenant: true }
  });

  // If not found, try phone number via Tenant
  if (!user) {
    const formattedIdentity = formatWhatsAppNumber(identity);
    const tenant = await prisma.tenant.findFirst({
      where: { noHpRt: formattedIdentity || identity },
      include: {
        users: {
          where: { role: "TENANT_ADMIN" }
        }
      }
    });

    if (tenant && tenant.users.length > 0) {
      user = { ...tenant.users[0], tenant } as any;
    }
  }

  return user;
}

export async function requestPasswordReset(identity: string) {
  try {
    const user = await findUserByIdentity(identity);
    
    if (!user) {
      return { success: false, error: "Akun dengan email atau nomor HP tersebut tidak ditemukan." };
    }

    // @ts-ignore
    const noHpRt = user.tenant?.noHpRt;
    
    if (!noHpRt) {
      return { success: false, error: "Akun ini tidak memiliki nomor WhatsApp yang terdaftar. Silakan hubungi Admin." };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiry
      }
    });

    // Mask phone number for security
    const maskedPhone = noHpRt.substring(0, 4) + "****" + noHpRt.substring(noHpRt.length - 3);

    return { success: true, maskedPhone };

  } catch (error: any) {
    console.error("Error requesting reset password:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function verifyOtp(identity: string, otp: string) {
  try {
    const user = await findUserByIdentity(identity);
    
    if (!user) {
      return { success: false, error: "Akun tidak ditemukan." };
    }

    if (!user.resetToken || user.resetToken !== otp) {
      return { success: false, error: "Kode OTP salah." };
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { success: false, error: "Kode OTP sudah kadaluarsa." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function resetPassword(identity: string, otp: string, newPassword: string) {
  try {
    const user = await findUserByIdentity(identity);
    
    if (!user) {
      return { success: false, error: "Akun tidak ditemukan." };
    }

    if (!user.resetToken || user.resetToken !== otp) {
      return { success: false, error: "Kode OTP salah atau tidak valid." };
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { success: false, error: "Kode OTP sudah kadaluarsa." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}
