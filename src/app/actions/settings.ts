"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateSiteSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }

  const logoUrl = formData.get("logoUrl") as string;
  const logoUrlDark = formData.get("logoUrlDark") as string;
  const faviconUrl = formData.get("faviconUrl") as string;
  const heroTitle = formData.get("heroTitle") as string;
  const heroSubtitle = formData.get("heroSubtitle") as string;
  const heroImage = formData.get("heroImage") as string;
  const footerText = formData.get("footerText") as string;
  
  const parseJson = (key: string) => {
    const val = formData.get(key) as string;
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch (e) {
      return null;
    }
  };

  const features = parseJson("features");
  const pricing = parseJson("pricing");
  const testimonials = parseJson("testimonials");
  const faq = parseJson("faq");
  const howItWorks = parseJson("howItWorks");

  const dataToSave = {
    logoUrl,
    logoUrlDark,
    faviconUrl,
    heroTitle,
    heroSubtitle,
    heroImage,
    footerText,
    ...(features && { features }),
    ...(pricing && { pricing }),
    ...(testimonials && { testimonials }),
    ...(faq && { faq }),
    ...(howItWorks && { howItWorks }),
  };

  try {
    const existingSettings = await prisma.siteSettings.findFirst({
      where: { tenant_id: null },
    });

    if (existingSettings) {
      await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: dataToSave,
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          tenant_id: null,
          ...dataToSave,
        },
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}


