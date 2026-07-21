import { Metadata } from "next";
import { getBillingDashboard } from "@/app/actions/billing";
import { UpgradeClient } from "./client";

export const metadata: Metadata = {
  title: "Upgrade Paket - Tata Warga",
};

export default async function UpgradePage() {
  const data = await getBillingDashboard();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">Upgrade Paket Langganan</h1>
        <p className="text-muted-foreground mt-1">Pilih paket dengan kuota yang lebih besar untuk mendukung aktivitas administrasi RT Anda.</p>
      </div>

      <UpgradeClient initialData={data} />
    </div>
  );
}
