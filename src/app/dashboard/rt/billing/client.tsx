"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download, Eye, RefreshCw, ArrowUp, PlusCircle, Crown, Info } from "lucide-react";
import { createCheckoutInvoice } from "@/app/actions/billing";
import Link from "next/link";
import { PaymentMethodDialog } from "@/components/payment-dialog";

export function BillingClient({ initialData }: { initialData: any }) {
  const { tenant, currentProduct, usage, invoices } = initialData;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Sembunyikan tombol Perpanjang jika paket TRIAL
  const isTrial = (tenant.subscriptionPlan || "").toUpperCase() === "TRIAL";
  const isPlatinum = (tenant.subscriptionPlan || "").toUpperCase() === "PLATINUM";

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleRenewClick = () => {
    if (!currentProduct) return toast.error("Tidak ada produk aktif untuk diperpanjang.");
    setIsPaymentDialogOpen(true);
  };

  const confirmRenew = async (paymentMethod: string) => {
    setIsLoading("RENEW");
    const res = await createCheckoutInvoice(currentProduct.id, "RENEW", paymentMethod);
    if (res.success) {
      router.push(`/dashboard/rt/billing/checkout/${res.invoiceId}`);
    } else {
      toast.error(res.error);
      setIsLoading(null);
      setIsPaymentDialogOpen(false);
    }
  };

  const maxSurat = currentProduct?.maxSurat === -1 ? 999999 : currentProduct?.maxSurat || 0;
  const maxAi = currentProduct?.maxAiToken === -1 ? 999999 : currentProduct?.maxAiToken || 0;
  
  const totalMaxSurat = maxSurat + tenant.addonMaxSurat;
  const totalMaxAi = maxAi + tenant.addonMaxAiToken;
  
  const suratPercent = totalMaxSurat > 0 ? Math.min(100, (usage.surat / totalMaxSurat) * 100) : 100;
  const aiPercent = totalMaxAi > 0 ? Math.min(100, (usage.aiToken / totalMaxAi) * 100) : 100;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleExport = () => {
    const headers = ["Tanggal", "Invoice", "Paket", "Nominal", "Status"];
    const rows = invoices.map((inv: any) => [
      new Date(inv.date).toLocaleDateString('id-ID'),
      inv.invoiceNumber,
      inv.product?.name || "-",
      inv.amount,
      inv.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((e: any) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "riwayat_tagihan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">Manajemen Langganan</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Kelola paket layanan, pantau kuota penggunaan, dan riwayat tagihan</p>
        </div>
        <Button variant="outline" className="text-foreground hover:bg-accent bg-card" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export Riwayat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Kiri: Paket Saat Ini */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start gap-3 md:gap-4 relative z-10 w-full">
            <div className="p-2 md:p-3 bg-primary/20 rounded-xl shrink-0">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium tracking-wide uppercase mb-1">Paket Saat Ini</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">{currentProduct?.name || tenant.subscriptionPlan || "Free"}</h2>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border border-primary/20 shrink-0">
                  {tenant.daysRemaining > 0 ? "AKTIF" : "NONAKTIF"}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Biaya Bulanan</p>
                  <p className="text-xl font-bold text-foreground">{currentProduct ? formatRp(currentProduct.price) : "Rp 0"}<span className="text-sm font-normal text-muted-foreground">/bln</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Tagihan Berikutnya</p>
                  <p className="text-xl font-bold text-foreground">
                    {tenant.activeUntil ? new Date(tenant.activeUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-10 relative z-10">
            {!isTrial && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleRenewClick} disabled={isLoading === "RENEW"}>
                {isLoading === "RENEW" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Perpanjang
              </Button>
            )}
            {!isPlatinum && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => router.push('/dashboard/rt/billing/upgrade')}>
                <ArrowUp className="w-4 h-4 mr-2" /> Upgrade
              </Button>
            )}
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => router.push('/dashboard/rt/billing/topup')}>
              <PlusCircle className="w-4 h-4 mr-2" /> Topup Kuota
            </Button>
          </div>
        </div>

        {/* Card Kanan: Penggunaan Kuota */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Penggunaan Kuota</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Kuota Surat</span>
                  <span className="text-primary font-bold">{usage.surat} / {totalMaxSurat === 999999 ? "∞" : totalMaxSurat}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: suratPercent + "%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Kuota Token AI</span>
                  <span className="text-primary font-bold">{usage.aiToken >= 1000 ? (usage.aiToken/1000).toFixed(1)+'k' : usage.aiToken} / {totalMaxAi === 999999 ? "∞" : totalMaxAi >= 1000 ? (totalMaxAi/1000).toFixed(1)+'k' : totalMaxAi}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: aiPercent + "%" }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 mt-8 text-muted-foreground text-xs italic">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500" />
            <p>Kuota akan diperbarui setiap perpanjang langganan.</p>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Tagihan */}
      <div className="bg-card border border-border rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-border">
          <h3 className="text-xl font-bold text-foreground">Riwayat Tagihan</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs uppercase bg-muted text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Paket</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Nominal</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada riwayat tagihan.</td>
                </tr>
              ) : (
                paginatedInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-accent transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {new Date(inv.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{inv.product?.name || "-"}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{formatRp(inv.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${inv.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : inv.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {inv.status === 'COMPLETED' ? 'Selesai' : inv.status === 'CANCELLED' ? 'Batal' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/rt/billing/checkout/${inv.id}`}>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-[#1a938e] hover:bg-primary/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {inv.status === 'COMPLETED' && (
                          <Button variant="ghost" size="icon" className="text-primary hover:text-[#1a938e] hover:bg-primary/10" onClick={() => window.open(`/api/invoice/${inv.id}/download?download=1`, '_blank')}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <PaymentMethodDialog 
        isOpen={isPaymentDialogOpen} 
        onClose={() => setIsPaymentDialogOpen(false)} 
        onConfirm={confirmRenew} 
        isLoading={isLoading === "RENEW"} 
      />
    </div>
  );
}
