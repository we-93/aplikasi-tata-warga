import { Metadata } from "next";
import { getBillingDashboard } from "@/app/actions/billing";
import { BillingClient } from "./client";

export const metadata: Metadata = {
  title: "Langganan & Tagihan - Tata Warga",
};

export default async function BillingPage() {
  const data = await getBillingDashboard();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BillingClient initialData={data} />
    </div>
  );
}
