"use server";

import { uploadFile, deleteFile } from "@/lib/s3";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateTenantProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { success: false, error: "Unauthorized" };
    }
    const tenantId = session.user.tenantId;

    const existingTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!existingTenant) return { success: false, error: "Tenant not found" };

    const data = {
      name: formData.get("name") as string,
      province: formData.get("province") as string,
      city: formData.get("city") as string,
      district: formData.get("district") as string,
      village: formData.get("village") as string,
      rt: formData.get("rt") as string,
      rw: formData.get("rw") as string,
      address: formData.get("address") as string,
      kodePos: formData.get("kodePos") as string,
      ketuaName: formData.get("ketuaName") as string,
      namaRw: formData.get("namaRw") as string,
      noHpRt: formData.get("noHpRt") as string || null,
      logoUrl: formData.get("logoUrl") as string || null,
      signatureUrl: formData.get("signatureUrl") as string || null,
      stampUrl: formData.get("stampUrl") as string || null,
    };

    if (!data.name || !data.rt || !data.rw || !data.ketuaName || !data.namaRw) {
      return { success: false, error: "Nama Organisasi, Nomor RT/RW, Nama RW, dan Nama Ketua wajib diisi." };
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: data,
    });

    revalidatePath("/dashboard/rt/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update tenant:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function updateTenantMediaField(field: 'logoUrl' | 'signatureUrl' | 'stampUrl', url: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: { [field]: url }
    });
    
    revalidatePath("/dashboard/rt/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update media field:", error);
    return { success: false, error: "Gagal memperbarui database." };
  }
}

export async function createTenant(formData: FormData) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const name = formData.get("name") as string;
    const adminName = formData.get("adminName") as string;
    const email = formData.get("email") as string;
    const productId = formData.get("productId") as string;
    const city = formData.get("city") as string || "";
    const province = formData.get("province") as string || "";

    if (!name || !adminName || !email || !productId) {
      return { success: false, error: "Data tidak lengkap." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, error: "Email sudah digunakan." };

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const hashedPassword = "password123"; // MVP plain text password

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug: slug + "-" + Date.now().toString().slice(-4),
          city,
          province,
        }
      });

      await tx.user.create({
        data: {
          name: adminName,
          email,
          password: hashedPassword,
          role: "TENANT_ADMIN",
          tenantId: tenant.id
        }
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          productId,
          status: "ACTIVE"
        }
      });
    });

    revalidatePath("/admin/tenants");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create tenant:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function updateTenantByAdmin(
  tenantId: string, 
  data: {
    name?: string;
    province?: string;
    city?: string;
    district?: string;
    village?: string;
    rt?: string;
    rw?: string;
    address?: string;
    kodePos?: string;
    ketuaName?: string;
    ketuaNik?: string;
    namaRw?: string;
    noHpRt?: string;
    whatsappGroupId?: string;
    waDeviceId?: string | null;
    status?: string;
  }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    let whatsappBotNo = undefined;
    if (data.waDeviceId) {
      const waDevice = await prisma.waDevice.findUnique({ where: { id: data.waDeviceId } });
      if (waDevice) {
        whatsappBotNo = waDevice.phoneNumber || "000000000";
      }
    } else if (data.waDeviceId === null) {
      whatsappBotNo = null; // Clear if null
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        province: data.province,
        city: data.city,
        district: data.district,
        village: data.village,
        rt: data.rt,
        rw: data.rw,
        address: data.address,
        kodePos: data.kodePos,
        ketuaName: data.ketuaName,
        ketuaNik: data.ketuaNik,
        namaRw: data.namaRw,
        noHpRt: data.noHpRt,
        whatsappGroupId: data.whatsappGroupId,
        waDeviceId: data.waDeviceId || null,
        whatsappBotNo: whatsappBotNo,
        status: data.status,
      },
    });

    revalidatePath("/admin/data");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating tenant:", error);
    return { success: false, error: "Gagal memperbarui data RT" };
  }
}

export async function deleteTenantByAdmin(tenantId: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    revalidatePath("/admin/data");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting tenant:", error);
    return { success: false, error: "Gagal menghapus RT. Pastikan tidak ada data yang terkait." };
  }
}

