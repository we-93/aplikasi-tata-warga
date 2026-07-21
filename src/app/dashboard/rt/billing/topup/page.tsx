import { Metadata } from "next";
import { getBillingDashboard } from "@/app/actions/billing";
import { TopupClient } from "./client";

export const metadata: Metadata = {
  title: "Topup Kuota - Tata Warga",
};

export default async function TopupPage() {
  const data = await getBillingDashboard();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">Topup Kuota (Ekstra)</h1>
        <p className="text-muted-foreground mt-1">Beli kuota tambahan untuk Surat atau AI Token tanpa harus mengupgrade paket utama Anda.</p>
      </div>

      <TopupClient initialData={data} />
    </div>
  );
}
