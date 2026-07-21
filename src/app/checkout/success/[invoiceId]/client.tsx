"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Building2, CreditCard, Send, LogIn } from "lucide-react";
import Link from "next/link";

export function CheckoutSuccessClient({ initialData }: { initialData: any }) {
  const { invoice, adminWa, invoiceTemplate } = initialData;

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleWA = () => {
    // Replace variables in template
    let msg = invoiceTemplate
      .replace("{{INVOICE_NO}}", invoice.invoiceNumber)
      .replace("{{NAMA_RT}}", invoice.tenant.name)
      .replace("{{NAMA_PRODUK}}", invoice.product.name)
      .replace("{{TOTAL}}", formatRp(invoice.amount));
    
    // Fallback if template is not configured right
    if (!msg.includes(invoice.invoiceNumber)) {
      msg = `Halo Admin, saya pengguna baru dari ${invoice.tenant.name}.\n\nSaya ingin mengonfirmasi pendaftaran akun dan pembayaran untuk pesanan:\nNomor Invoice: *${invoice.invoiceNumber}*\nProduk: *${invoice.product.name}*\nTotal Transfer: *${formatRp(invoice.amount)}*\n\nBerikut saya lampirkan bukti transfernya. Terima kasih.`;
    }

    const url = `https://wa.me/${adminWa}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (invoice.status === "COMPLETED") {
    return (
      <Card className="text-center py-12 px-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pembayaran Dikonfirmasi</h2>
        <p className="text-muted-foreground mb-8">Invoice {invoice.invoiceNumber} telah lunas dan akun Anda sudah aktif.</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/rt">Masuk ke Dashboard <LogIn className="w-4 h-4 ml-2" /></Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pendaftaran Berhasil!</h1>
        <p className="text-muted-foreground">Akun Anda telah berhasil dibuat. Silakan selesaikan pembayaran untuk mengaktifkan paket Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rincian Pesanan */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg flex justify-between">
                <span>Rincian Invoice</span>
                <span className="text-primary">{invoice.invoiceNumber}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between pb-4 border-b">
                <div className="text-muted-foreground">Tenant / Grup</div>
                <div className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> {invoice.tenant.name}</div>
              </div>
              <div className="flex justify-between pb-4 border-b">
                <div className="text-muted-foreground">Item / Produk</div>
                <div className="font-semibold text-lg">{invoice.product.name}</div>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div className="text-muted-foreground">Total Pembayaran</div>
                <div className="text-3xl font-bold text-[#7c3aed]">{formatRp(invoice.amount)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="w-5 h-5" /> Instruksi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-sm leading-relaxed">
              <p>Silakan lakukan pembayaran tepat sebesar <strong className="text-lg">{formatRp(invoice.amount)}</strong> menggunakan metode <strong>{initialData.paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank'}</strong>.</p>
              
              <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-6 font-mono text-base space-y-4 flex flex-col items-center justify-center">
                
                {initialData.paymentMethod === 'qris' ? (
                  initialData.qrisUrl ? (
                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                      <img src={initialData.qrisUrl} alt="QRIS Payment" className="max-w-[250px] rounded-lg shadow-sm" />
                      <p className="text-sm font-sans text-muted-foreground mt-4">Scan kode QRIS di atas menggunakan aplikasi e-wallet atau m-banking Anda.</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm font-sans">
                      QRIS belum dikonfigurasi oleh Admin. Silakan hubungi Admin.
                    </div>
                  )
                ) : (
                  <div className="w-full">
                    {initialData.bankInstructions && typeof initialData.bankInstructions === 'string' ? JSON.parse(initialData.bankInstructions).map((b: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0 pt-4 first:pt-0">
                        <div className="font-sans font-bold">{b.bank}</div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{b.account}</div>
                          <div className="text-sm text-muted-foreground font-sans">a.n {b.name}</div>
                        </div>
                      </div>
                    )) : initialData.bankInstructions && Array.isArray(initialData.bankInstructions) ? initialData.bankInstructions.map((b: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0 pt-4 first:pt-0">
                        <div className="font-sans font-bold">{b.bank}</div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{b.account}</div>
                          <div className="text-sm text-muted-foreground font-sans">a.n {b.name}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center font-sans text-muted-foreground text-sm">
                        Instruksi transfer belum diatur oleh admin pusat.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-muted-foreground italic">
                * Simpan struk/bukti transfer Anda, lalu klik tombol Konfirmasi di sebelah kanan untuk mengirimkannya ke Admin Pusat via WhatsApp.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Panel Aksi */}
        <div className="space-y-6">
          <Card className="border-primary/30 shadow-md">
            <CardHeader className="bg-primary/10 border-b border-primary/20">
              <CardTitle className="text-lg text-center text-[#7c3aed]">Langkah Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 ml-1" />
              </div>
              <h3 className="font-bold text-xl">Kirim Bukti Transfer</h3>
              <p className="text-sm text-muted-foreground">Setelah mentransfer {formatRp(invoice.amount)}, hubungi Admin kami untuk verifikasi instan.</p>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0">
              <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-lg" onClick={handleWA}>
                Konfirmasi via WhatsApp
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Ingin melihat dasbor Anda sekarang? (Fitur penuh akan aktif setelah pembayaran dikonfirmasi)</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/rt">Masuk ke Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
