"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

function checkSuperAdmin(session: any) {
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }
}

export async function getNotificationSettings() {
  const session = await auth();
  checkSuperAdmin(session);
  
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }
  
  return {
    waAdminProvider: settings.waAdminProvider || "FONNTE",
    waAdminApiKey: settings.waAdminApiKey || "",
    waAdminWelcomeTemplate: settings.waAdminWelcomeTemplate || "Halo {{NAMA}},\n\nTerima kasih telah mendaftar di Tata Warga! Pendaftaran akun Anda untuk paket *{{PRODUK}}* telah kami terima.\n\nNomor Invoice: *{{INVOICE}}*\nTotal Tagihan: *Rp {{HARGA}}*\n\nSilakan transfer ke salah satu rekening berikut:\n{{BANK}}\n\nMohon segera selesaikan pembayaran agar akun Anda dapat diaktifkan. Terima kasih!",
    waAdminTemplate: settings.waAdminTemplate || "Halo, pesanan paket Tata Warga Anda sudah aktif!\nNo Invoice: {{invoice}}\nEmail: {{email}}\nPassword: {{password}}\nNo. Bot WA: {{bot_wa}}\nSilakan masuk ke: {{link_login}}\n\nJika ada pertanyaan silakan balas pesan ini.",
    waAdminInvoiceTemplate: settings.waAdminInvoiceTemplate || "Halo Kak! Pesanan Tata Warga Anda telah kami terima.\nNo Invoice: {{invoice}}\nPaket: {{paket}}\nTotal: Rp {{harga}}\n\nSilakan transfer ke rekening BCA 123456 a.n. Tata Warga, lalu balas pesan ini dengan menyertakan bukti transfer agar akun segera diaktifkan.",
    waAdminTopupTemplate: settings.waAdminTopupTemplate || "Terima kasih Kak {{NAMA}}, pembayaran Anda di Tata Warga telah berhasil 🥳\nRincian Pembayaran:\nNo. Invoice: {{invoice}}\nTanggal Invoice: {{tanggal}}\nProduk: {{PRODUK}}\nJumlah Pembayaran: Rp {{HARGA}}\nLink Login: {{link_login}}\n\nTerima kasih telah memilih Tata Warga! Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.",
    waAdminExpired7DaysTemplate: settings.waAdminExpired7DaysTemplate || "Peringatan! Paket {{paket}} Anda akan kedaluwarsa dalam 7 hari pada {{tanggal}}. Segera lakukan perpanjangan agar sistem tetap berjalan.",
    waAdminExpiredTodayTemplate: settings.waAdminExpiredTodayTemplate || "Perhatian! Paket {{paket}} Anda telah KEDALUWARSA hari ini. Sistem telah dinonaktifkan sementara. Segera lakukan perpanjangan.",
  };
}

export async function saveNotificationSettings(data: {
  waAdminProvider: string;
  waAdminApiKey: string;
  waAdminWelcomeTemplate: string;
  waAdminTemplate: string;
  waAdminInvoiceTemplate: string;
  waAdminTopupTemplate?: string;
  waAdminExpired7DaysTemplate: string;
  waAdminExpiredTodayTemplate: string;
}) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    let settings = await prisma.siteSettings.findFirst();
    
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          waAdminProvider: data.waAdminProvider,
          waAdminApiKey: data.waAdminApiKey,
          waAdminWelcomeTemplate: data.waAdminWelcomeTemplate,
          waAdminTemplate: data.waAdminTemplate,
          waAdminInvoiceTemplate: data.waAdminInvoiceTemplate,
          waAdminTopupTemplate: data.waAdminTopupTemplate,
          waAdminExpired7DaysTemplate: data.waAdminExpired7DaysTemplate,
          waAdminExpiredTodayTemplate: data.waAdminExpiredTodayTemplate,
        }
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          waAdminProvider: data.waAdminProvider,
          waAdminApiKey: data.waAdminApiKey,
          waAdminWelcomeTemplate: data.waAdminWelcomeTemplate,
          waAdminTemplate: data.waAdminTemplate,
          waAdminInvoiceTemplate: data.waAdminInvoiceTemplate,
          waAdminTopupTemplate: data.waAdminTopupTemplate,
          waAdminExpired7DaysTemplate: data.waAdminExpired7DaysTemplate,
          waAdminExpiredTodayTemplate: data.waAdminExpiredTodayTemplate,
        }
      });
    }

    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save Notification Settings:", error);
    return { success: false, error: error.message || "Gagal menyimpan konfigurasi notifikasi." };
  }
}
