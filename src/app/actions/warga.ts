"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createWarga(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { success: false, error: "Unauthorized: No tenant ID found." };
    }
    const tenantId = session.user.tenantId;

    const data = {
      tenantId,
      nik: formData.get("nik") as string,
      noKk: formData.get("noKk") as string,
      namaLengkap: formData.get("namaLengkap") as string,
      namaPanggilan: formData.get("namaPanggilan") as string | null,
      tempatLahir: formData.get("tempatLahir") as string | null,
      tanggalLahir: formData.get("tanggalLahir") ? new Date(formData.get("tanggalLahir") as string) : null,
      jenisKelamin: (formData.get("jenisKelamin") as any) || "LAKI_LAKI",
      agama: formData.get("agama") as string | null,
      alamat: formData.get("alamat") as string | null,
      statusNikah: formData.get("statusNikah") as string | null,
      pekerjaan: formData.get("pekerjaan") as string | null,
      pendidikan: formData.get("pendidikan") as string | null,
      golonganDarah: formData.get("golonganDarah") as string | null,
      noHp: formData.get("noHp") as string | null,
      email: formData.get("email") as string | null,
      statusWarga: (formData.get("statusWarga") as any) || "AKTIF",
    };

    if (!data.nik || !data.namaLengkap) {
      return { success: false, error: "NIK dan Nama Lengkap wajib diisi." };
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) return { success: false, error: "Akun Tidak Ditemukan, Segera Hubungi Admin." };
    if (tenant.status === "PENDING") return { success: false, error: "Akun sedang dalam peninjauan, Segera Hubungi Admin." };
    if (tenant.status === "NONAKTIF" || tenant.status === "INACTIVE") return { success: false, error: "Akun Tidak Aktif, Segera Hubungi Admin." };
    if (tenant.status === "KADALUARSA" || tenant.status === "EXPIRED") return { success: false, error: "Paket Langganan Sudah Kadaluarsa, Segera Hubungi Admin." };

    // Check Quota Limit
    if (tenant.maxWarga !== -1) {
      const currentWargaCount = await prisma.warga.count({ where: { tenantId } });
      if (currentWargaCount >= tenant.maxWarga) {
        return { success: false, error: "Kuota maksimal Warga Anda telah habis. Silakan Upgrade Paket Langganan untuk menambah kapasitas." };
      }
    }

    await prisma.warga.create({
      data,
    });

    revalidatePath("/dashboard/rt/warga");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create warga:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "NIK warga sudah terdaftar di sistem ini." };
    }
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function updateWarga(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await prisma.warga.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== session.user.tenantId) {
      return { success: false, error: "Data warga tidak ditemukan atau akses ditolak." };
    }
    
    const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } });
    if (!tenant) return { success: false, error: "Akun Tidak Ditemukan, Segera Hubungi Admin." };
    if (tenant.status === "PENDING") return { success: false, error: "Akun sedang dalam peninjauan, Segera Hubungi Admin." };
    if (tenant.status === "NONAKTIF" || tenant.status === "INACTIVE") return { success: false, error: "Akun Tidak Aktif, Segera Hubungi Admin." };
    if (tenant.status === "KADALUARSA" || tenant.status === "EXPIRED") return { success: false, error: "Paket Langganan Sudah Kadaluarsa, Segera Hubungi Admin." };

    const data = {
      nik: formData.get("nik") as string,
      noKk: formData.get("noKk") as string,
      namaLengkap: formData.get("namaLengkap") as string,
      namaPanggilan: formData.get("namaPanggilan") as string | null,
      tempatLahir: formData.get("tempatLahir") as string | null,
      tanggalLahir: formData.get("tanggalLahir") ? new Date(formData.get("tanggalLahir") as string) : null,
      jenisKelamin: (formData.get("jenisKelamin") as any) || "LAKI_LAKI",
      agama: formData.get("agama") as string | null,
      alamat: formData.get("alamat") as string | null,
      statusNikah: formData.get("statusNikah") as string | null,
      pekerjaan: formData.get("pekerjaan") as string | null,
      pendidikan: formData.get("pendidikan") as string | null,
      golonganDarah: formData.get("golonganDarah") as string | null,
      noHp: formData.get("noHp") as string | null,
      email: formData.get("email") as string | null,
      statusWarga: (formData.get("statusWarga") as any) || "AKTIF",
    };

    await prisma.warga.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/rt/warga");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update warga:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "NIK warga sudah terdaftar di sistem ini." };
    }
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function deleteWarga(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await prisma.warga.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== session.user.tenantId) {
      return { success: false, error: "Akses ditolak." };
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } });
    if (!tenant) return { success: false, error: "Akun Tidak Ditemukan, Segera Hubungi Admin." };
    if (tenant.status === "PENDING") return { success: false, error: "Akun sedang dalam peninjauan, Segera Hubungi Admin." };
    if (tenant.status === "NONAKTIF" || tenant.status === "INACTIVE") return { success: false, error: "Akun Tidak Aktif, Segera Hubungi Admin." };
    if (tenant.status === "KADALUARSA" || tenant.status === "EXPIRED") return { success: false, error: "Paket Langganan Sudah Kadaluarsa, Segera Hubungi Admin." };

    await prisma.warga.delete({ where: { id } });

    revalidatePath("/dashboard/rt/warga");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete warga:", error);
    return { success: false, error: "Gagal menghapus warga." };
  }
}
