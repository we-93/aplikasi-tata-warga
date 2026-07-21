import { Metadata } from "next";
import { getAdminInvoices } from "@/app/actions/admin-billing";
import { AdminInvoicesClient } from "./client";

export const metadata: Metadata = {
  title: "Validasi Pembayaran - Admin Tata Warga",
};

export default async function AdminInvoicesPage() {
  const invoices = await getAdminInvoices();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1b264f] dark:text-white">Validasi Pembayaran (Invoices)</h1>
        <p className="text-muted-foreground mt-1">Kelola pesanan paket dan top-up dari seluruh RT. Klik ACC untuk mengaktifkan paket secara otomatis.</p>
      </div>

      <AdminInvoicesClient initialInvoices={invoices} />
    </div>
  );
}
