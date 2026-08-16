"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createGlobalTemplate(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const contentHtml = formData.get("contentHtml") as string;
    const paperSize = formData.get("paperSize") as string || "A4";
    const marginTop = parseFloat(formData.get("marginTop") as string || "2.54");
    const marginBottom = parseFloat(formData.get("marginBottom") as string || "2.54");
    const marginLeft = parseFloat(formData.get("marginLeft") as string || "2.54");
    const marginRight = parseFloat(formData.get("marginRight") as string || "2.54");

    if (!name || !code || !contentHtml) {
      return { success: false, error: "Semua kolom wajib diisi." };
    }

    await prisma.suratTemplate.create({
      data: {
        name,
        code: code.toUpperCase().replace(/\s+/g, "_"),
        contentHtml,
        paperSize,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        tenantId: null, // Null means it's a global template
      }
    });

    revalidatePath("/admin/letters");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create template:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function updateGlobalTemplate(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const contentHtml = formData.get("contentHtml") as string;
    const paperSize = formData.get("paperSize") as string || "A4";
    const marginTop = parseFloat(formData.get("marginTop") as string || "2.54");
    const marginBottom = parseFloat(formData.get("marginBottom") as string || "2.54");
    const marginLeft = parseFloat(formData.get("marginLeft") as string || "2.54");
    const marginRight = parseFloat(formData.get("marginRight") as string || "2.54");

    if (!name || !code || !contentHtml) {
      return { success: false, error: "Semua kolom wajib diisi." };
    }

    await prisma.suratTemplate.update({
      where: { id },
      data: {
        name,
        code: code.toUpperCase().replace(/\s+/g, "_"),
        contentHtml,
        paperSize,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
      }
    });

    revalidatePath("/admin/letters");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update template:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.suratTemplate.delete({
      where: { id }
    });

    revalidatePath("/admin/letters");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return { success: false, error: "Gagal menghapus template." };
  }
}

export async function duplicateGlobalTemplate(id: string) {
  try {
    const existing = await prisma.suratTemplate.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Template tidak ditemukan." };

    await prisma.suratTemplate.create({
      data: {
        name: existing.name + " (Copy)",
        code: existing.code + "_COPY",
        contentHtml: existing.contentHtml,
        paperSize: existing.paperSize,
        marginTop: existing.marginTop,
        marginBottom: existing.marginBottom,
        marginLeft: existing.marginLeft,
        marginRight: existing.marginRight,
        tenantId: null,
      }
    });

    revalidatePath("/admin/letters");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to duplicate template:", error);
    return { success: false, error: "Gagal menduplikasi template." };
  }
}

// ============================================================================
// RT TENANT SPECIFIC ACTIONS
// ============================================================================

export async function createRtTemplate(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const contentHtml = formData.get("contentHtml") as string;
    const paperSize = formData.get("paperSize") as string || "A4";
    const marginTop = parseFloat(formData.get("marginTop") as string || "2.54");
    const marginBottom = parseFloat(formData.get("marginBottom") as string || "2.54");
    const marginLeft = parseFloat(formData.get("marginLeft") as string || "2.54");
    const marginRight = parseFloat(formData.get("marginRight") as string || "2.54");

    if (!name || !code || !contentHtml) {
      return { success: false, error: "Semua kolom wajib diisi." };
    }

    await prisma.suratTemplate.create({
      data: {
        name,
        code: code.toUpperCase().replace(/\s+/g, "_"),
        contentHtml,
        paperSize,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        tenantId: session.user.tenantId, // Belongs to RT
      }
    });

    revalidatePath("/dashboard/rt/surat");
    revalidatePath("/dashboard/rt/surat/template");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create RT template:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function updateRtTemplate(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return { success: false, error: "Unauthorized" };

    // Verify ownership
    const existing = await prisma.suratTemplate.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== session.user.tenantId) {
       return { success: false, error: "Template tidak ditemukan atau bukan milik Anda." };
    }

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const contentHtml = formData.get("contentHtml") as string;
    const paperSize = formData.get("paperSize") as string || "A4";
    const marginTop = parseFloat(formData.get("marginTop") as string || "2.54");
    const marginBottom = parseFloat(formData.get("marginBottom") as string || "2.54");
    const marginLeft = parseFloat(formData.get("marginLeft") as string || "2.54");
    const marginRight = parseFloat(formData.get("marginRight") as string || "2.54");

    if (!name || !code || !contentHtml) {
      return { success: false, error: "Semua kolom wajib diisi." };
    }

    await prisma.suratTemplate.update({
      where: { id },
      data: {
        name,
        code: code.toUpperCase().replace(/\s+/g, "_"),
        contentHtml,
        paperSize,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
      }
    });

    revalidatePath("/dashboard/rt/surat");
    revalidatePath("/dashboard/rt/surat/template");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update RT template:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function deleteRtTemplate(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return { success: false, error: "Unauthorized" };

    // Verify ownership
    const existing = await prisma.suratTemplate.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== session.user.tenantId) {
       return { success: false, error: "Template tidak ditemukan atau bukan milik Anda." };
    }

    await prisma.suratTemplate.delete({
      where: { id }
    });

    revalidatePath("/dashboard/rt/surat");
    revalidatePath("/dashboard/rt/surat/template");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete RT template:", error);
    return { success: false, error: "Gagal menghapus template." };
  }
}
