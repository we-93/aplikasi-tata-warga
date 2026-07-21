import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CheckoutPublicClient } from "./client";

export const dynamic = 'force-dynamic';

export default async function CheckoutPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find the product by slug
  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    hargaPendaftaran: Number(product.hargaPendaftaran),
    hargaPerpanjangan: Number(product.hargaPerpanjangan)
  };

  // Pass it to the client component
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <CheckoutPublicClient product={serializedProduct} />
      </div>
    </div>
  );
}
