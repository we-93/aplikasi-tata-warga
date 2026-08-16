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

    // No quota limit for Warga

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
      
      let statusWarga: "TETAP" | "KONTRAK_KOST" | "PINDAH" | "MENINGGAL" = "TETAP";
      const rawStatus = String(row.statusWarga || "").toUpperCase();
      if (rawStatus === "KONTRAK_KOST") statusWarga = "KONTRAK_KOST";
      if (rawStatus === "PINDAH") statusWarga = "PINDAH";
      if (rawStatus === "MENINGGAL") statusWarga = "MENINGGAL";

      const alamat = row.alamat ? String(row.alamat) : null;

      let hubunganKeluarga: any = "LAINNYA";
      const rawHub = String(row.hubunganKeluarga || "").toUpperCase().replace(/\s+/g, '_');
      const validHubungan = [
        "KEPALA_KELUARGA", "ISTRI", "SUAMI", "ANAK", "MENANTU", 
        "CUCU", "ORANG_TUA", "MERTUA", "FAMILI_LAIN", "PEMBANTU", "LAINNYA"
      ];
      if (validHubungan.includes(rawHub)) {
        hubunganKeluarga = rawHub;
      } else if (rawHub.includes("KEPALA")) {
        hubunganKeluarga = "KEPALA_KELUARGA";
      } else if (rawHub.includes("FAMILI")) {
        hubunganKeluarga = "FAMILI_LAIN";
      } else if (rawHub.includes("ORANG")) {
        hubunganKeluarga = "ORANG_TUA";
      }

      const pendidikan = row.pendidikan ? String(row.pendidikan) : null;
      const pekerjaan = row.pekerjaan ? String(row.pekerjaan) : null;
      const statusNikah = row.statusNikah ? String(row.statusNikah) : null;
      const golonganDarah = row.golonganDarah ? String(row.golonganDarah) : null;

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
          hubunganKeluarga,
          tempatLahir,
          tanggalLahir,
          jenisKelamin,
          agama,
          pendidikan,
          pekerjaan,
          statusNikah,
          golonganDarah,
          noHp,
          statusWarga,
          alamat
        },
        create: {
          tenantId,
          nik,
          noKk,
          namaLengkap,
          hubunganKeluarga,
          tempatLahir,
          tanggalLahir,
          jenisKelamin,
          agama,
          pendidikan,
          pekerjaan,
          statusNikah,
          golonganDarah,
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
