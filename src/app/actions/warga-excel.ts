"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function importWargaBulk(data: any[]) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.tenantId) {
      throw new Error("Unauthorized");
    }
    const tenantId = session.user.tenantId;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Data kosong atau format salah.");
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error("Tenant tidak ditemukan");

    // Check Quota Limit
    if (tenant.maxWarga !== -1) {
      const existingWargas = await prisma.warga.findMany({ where: { tenantId }, select: { nik: true } });
      const existingNiks = new Set(existingWargas.map(w => w.nik));
      
      let newWargaCount = 0;
      const uniqueIncomingNiks = new Set();
      
      for (const row of data) {
        if (!row.nik || !row.namaLengkap) continue;
        const nik = String(row.nik).trim();
        if (!existingNiks.has(nik) && !uniqueIncomingNiks.has(nik)) {
          uniqueIncomingNiks.add(nik);
          newWargaCount++;
        }
      }

      if (existingWargas.length + newWargaCount > tenant.maxWarga) {
        throw new Error(`Gagal Import: Kuota maksimal Warga Anda adalah ${tenant.maxWarga}. Anda mencoba memasukkan ${newWargaCount} warga baru (Total: ${existingWargas.length + newWargaCount}). Silakan Upgrade Paket Langganan.`);
      }
    }

    let successCount = 0;

    for (const row of data) {
      // Validate minimum required fields
      if (!row.nik || !row.namaLengkap) continue;

      // Clean NIK
      const nik = String(row.nik).trim();
      const noKk = row.noKk ? String(row.noKk).trim() : "";
      const namaLengkap = String(row.namaLengkap).trim();
      
      let jenisKelamin: "LAKI_LAKI" | "PEREMPUAN" = "LAKI_LAKI";
      const rawJk = String(row.jenisKelamin || "").toLowerCase();
      if (rawJk.includes("perempuan") || rawJk === "p") {
        jenisKelamin = "PEREMPUAN";
      }

      const tempatLahir = row.tempatLahir ? String(row.tempatLahir) : null;
      
      let tanggalLahir = null;
      if (row.tanggalLahir) {
        // Excel might send JS date or string. Try parse.
        const parsedDate = new Date(row.tanggalLahir);
        if (!isNaN(parsedDate.getTime())) {
          tanggalLahir = parsedDate;
        }
      }

      const agama = row.agama ? String(row.agama) : null;
      const noHp = row.noHp ? String(row.noHp) : null;
      
      let statusWarga: "AKTIF" | "PINDAH" | "MENINGGAL" = "AKTIF";
      const rawStatus = String(row.statusWarga || "").toUpperCase();
      if (rawStatus === "PINDAH") statusWarga = "PINDAH";
      if (rawStatus === "MENINGGAL") statusWarga = "MENINGGAL";

      const alamat = row.alamat ? String(row.alamat) : null;

      // Upsert: Create or Update based on unique NIK per tenant
      await prisma.warga.upsert({
        where: {
          tenantId_nik: {
            tenantId,
            nik,
          }
        },
        update: {
          noKk,
          namaLengkap,
          tempatLahir,
          tanggalLahir,
          jenisKelamin,
          agama,
          noHp,
          statusWarga,
          alamat
        },
        create: {
          tenantId,
          nik,
          noKk,
          namaLengkap,
          tempatLahir,
          tanggalLahir,
          jenisKelamin,
          agama,
          noHp,
          statusWarga,
          alamat
        }
      });

      successCount++;
    }

    revalidatePath("/dashboard/rt/warga");
    return { success: true, message: `Berhasil mengimpor/memperbarui ${successCount} data warga.` };
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return { success: false, error: error.message || "Gagal mengimpor data." };
  }
}
