import { LoginClient } from "./client";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let logoUrl = null;
  
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { tenant_id: null },
      select: { logoUrl: true, logoUrlDark: true }
    });
    
    // Use dark mode logo if available, since login page is dark mode
    logoUrl = settings?.logoUrlDark || settings?.logoUrl || null;
  } catch (error) {
    console.error("Failed to fetch settings for login page", error);
  }

  return <LoginClient logoUrl={logoUrl} />;
}
