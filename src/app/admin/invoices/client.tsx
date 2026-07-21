"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { approveInvoice, rejectInvoice } from "@/app/actions/admin-billing";

export function AdminInvoicesClient({ initialInvoices }: { initialInvoices: any[] }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'NEW': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">BARU</Badge>;
      case 'UPGRADE': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">UPGRADE</Badge>;
      case 'RENEW': return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">PERPANJANG</Badge>;
      case 'TOPUP': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">TOP-UP</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1"/> Menunggu</Badge>;
      case 'COMPLETED': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Selesai</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1"/> Batal</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    
    const res = await approveInvoice(selectedInvoice.id);
    if (res.success) {
      toast.success("Invoice berhasil di-ACC! Paket/Kuota otomatis ditambahkan ke Tenant.");
      setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'COMPLETED' } : inv));
      setIsApproveOpen(false);
    } else {
      toast.error(res.error);
    }
    
    setIsProcessing(false);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Yakin ingin menolak dan membatalkan pesanan ini?")) return;
    const res = await rejectInvoice(id);
    if (res.success) {
      toast.success("Invoice dibatalkan.");
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'CANCELLED' } : inv));
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4">Invoice / Tgl</th>
              <th className="px-6 py-4">Tenant (RT)</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Belum ada pesanan masuk.</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-[#1b264f]">{inv.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleString('id-ID')}</div>
                </td>
                <td className="px-6 py-4 font-medium">{inv.tenant.name}</td>
                <td className="px-6 py-4">{getTypeLabel(inv.orderType)}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{inv.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {inv.orderType === 'TOPUP' 
                      ? `+${inv.product.maxSurat > 0 ? inv.product.maxSurat + ' Srt' : inv.product.maxAiToken + ' Tkn'}` 
                      : `${inv.product.masaAktifBulan} Bln`}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-[#21b7b1]">{formatRp(inv.amount)}</td>
                <td className="px-6 py-4 text-center">{getStatusBadge(inv.status)}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  {inv.status === 'PENDING' ? (
                    <>
                      <Button size="sm" className="bg-[#25D366] hover:bg-[#1EBE5D] text-white" onClick={() => {
                        setSelectedInvoice(inv);
                        setIsApproveOpen(true);
                      }}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> ACC
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleReject(inv.id)}>
                        Tolak
                      </Button>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Selesai</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Persetujuan Pembayaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui pesanan {selectedInvoice?.invoiceNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 border-y my-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">RT Pemesan:</span>
              <span className="font-semibold">{selectedInvoice?.tenant?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produk:</span>
              <span className="font-semibold">{selectedInvoice?.product?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nominal Transfer:</span>
              <span className="font-bold text-[#21b7b1]">{selectedInvoice && formatRp(selectedInvoice.amount)}</span>
            </div>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md mt-4 text-xs">
              <strong>Info:</strong> Menekan ACC akan mengubah status Invoice menjadi Lunas dan secara otomatis memproses pesanan ini (Reset siklus jika Upgrade, Tambah Hari jika Renew, Tambah Kuota jika Top-up).
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={isProcessing}>Batal</Button>
            <Button className="bg-[#25D366] hover:bg-[#1EBE5D] text-white" onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Ya, ACC & Aktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
