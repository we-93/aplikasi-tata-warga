import { RegisterClient } from "./client";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  let logoUrl = null;
  let products: any[] = [];
  
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { tenant_id: null },
      select: { logoUrl: true, logoUrlDark: true }
    });
    
    // Use dark mode logo if available, since page is dark mode
    logoUrl = settings?.logoUrlDark || settings?.logoUrl || null;
  } catch (error) {
    console.error("Failed to fetch settings for register page", error);
  }

  try {
    const dbProducts = await prisma.product.findMany({ 
      where: { isActive: true, type: 'NEW' },
      orderBy: { price: 'asc' }
    });

    products = dbProducts.map(p => ({
      ...p,
      price: Number(p.price),
      hargaPendaftaran: Number(p.hargaPendaftaran),
      hargaPerpanjangan: Number(p.hargaPerpanjangan)
    }));
  } catch (error) {
    console.error("Failed to fetch products for register page", error);
  }

  return <RegisterClient logoUrl={logoUrl} products={products} />;
}
