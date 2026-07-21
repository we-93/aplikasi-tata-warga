import { Metadata } from "next";
import { getInvoiceDetails } from "@/app/actions/billing";
import { CheckoutClient } from "./client";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Checkout - Tata Warga",
};

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getInvoiceDetails(resolvedParams.id);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CheckoutClient initialData={data} />
    </div>
  );
}
