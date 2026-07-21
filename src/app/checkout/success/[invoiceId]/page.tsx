import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CheckoutSuccessClient } from "./client";

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      product: true,
      tenant: true
    }
  });

  if (!invoice) {
    notFound();
  }

  const settings = await prisma.siteSettings.findFirst();
  
  const initialData = {
    invoice: {
      ...invoice,
      amount: Number(invoice.amount),
      product: {
        ...invoice.product,
        price: Number(invoice.product.price),
        hargaPendaftaran: Number(invoice.product.hargaPendaftaran),
        hargaPerpanjangan: Number(invoice.product.hargaPerpanjangan)
      }
    },
    adminWa: settings?.waAdminApiKey || "628000000000",
    invoiceTemplate: settings?.waAdminInvoiceTemplate || "Halo Admin, berikut adalah pembayaran untuk invoice saya.",
    bankInstructions: settings?.bankInstructions || null,
    qrisUrl: settings?.qrisUrl || null,
    paymentMethod: invoice.paymentMethod
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <CheckoutSuccessClient initialData={initialData} />
      </div>
    </div>
  );
}
