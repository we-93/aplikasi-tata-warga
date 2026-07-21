"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft, Building2, CreditCard, Send } from "lucide-react";
import Link from "next/link";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CheckoutClient({ initialData }: { initialData: any }) {
  const { invoice, adminWa, invoiceTemplate, bankInstructions: rawBankInstructions } = initialData;
  const bankInstructions = typeof rawBankInstructions === 'string' ? JSON.parse(rawBankInstructions) : rawBankInstructions;

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'NEW': return "Registrasi Baru";
      case 'UPGRADE': return "Upgrade Paket";
      case 'RENEW': return "Perpanjang Paket";
      case 'TOPUP': return "Tambah Kuota (Add-on)";
      default: return "Pesanan";
    }
  };

  const handleWA = () => {
    const msg = `Halo Admin, saya dari ${invoice.tenant.name}.\n\nSaya ingin mengonfirmasi pembayaran untuk pesanan:\nNomor Invoice: *${invoice.invoiceNumber}*\nProduk: *${invoice.product.name}*\nTotal Transfer: *${formatRp(invoice.amount)}*\n\nBerikut saya lampirkan bukti transfernya. Terima kasih.`;

    const url = `https://wa.me/${adminWa}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };



  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/rt/billing"><ChevronLeft className="w-4 h-4 mr-2" /> Kembali</Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rincian Pesanan */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 dark:border-white/10">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Rincian Invoice</span>
                <div className="flex items-center gap-3">
                  <span className="text-primary">{invoice.invoiceNumber}</span>
                  {invoice.status === 'COMPLETED' && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Lunas</span>}
                  {invoice.status === 'PENDING' && <span className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Pending</span>}
                  {invoice.status === 'CANCELLED' && <span className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Batal</span>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between pb-4 border-b">
                <div className="text-muted-foreground">Tipe Pesanan</div>
                <div className="font-semibold">{getTypeLabel(invoice.orderType)}</div>
              </div>
              <div className="flex justify-between pb-4 border-b">
                <div className="text-muted-foreground">Tenant (RT)</div>
                <div className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> {invoice.tenant.name}</div>
              </div>
              <div className="flex justify-between pb-4 border-b">
                <div className="text-muted-foreground">Item / Produk</div>
                <div className="font-semibold text-lg">{invoice.product.name}</div>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div className="text-muted-foreground">Total Pembayaran</div>
                <div className="text-3xl font-bold text-primary">{formatRp(invoice.amount)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="w-5 h-5" /> Instruksi Pembayaran Manual</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-sm leading-relaxed">
              <p>Silakan lakukan pembayaran tepat sebesar <strong className="text-lg">{formatRp(invoice.amount)}</strong> menggunakan metode <strong>{initialData.paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank'}</strong>.</p>
              
              <div className="bg-muted border rounded-lg p-6 font-mono text-base space-y-4 flex flex-col items-center justify-center text-foreground">
                
                {initialData.paymentMethod === 'qris' ? (
                  initialData.qrisUrl ? (
                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                      <img src={initialData.qrisUrl} alt="QRIS Payment" className="max-w-[250px] rounded-lg shadow-sm bg-white p-2" />
                      <p className="text-sm font-sans text-muted-foreground mt-4">Scan kode QRIS di atas menggunakan aplikasi e-wallet atau m-banking Anda.</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm font-sans">
                      QRIS belum dikonfigurasi oleh Admin. Silakan hubungi Admin Pusat.
                    </div>
                  )
                ) : (
                  <div className="w-full">
                    {bankInstructions && Array.isArray(bankInstructions) && bankInstructions.length > 0 ? (
                      bankInstructions.map((bank: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center border-b border-border/50 pb-4 last:border-0 last:pb-0 pt-4 first:pt-0">
                          <div className="font-sans font-bold">{bank.bank}</div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{bank.account}</div>
                            <div className="text-sm text-muted-foreground font-sans">a.n {bank.name}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center border-b border-border/50 pb-4 pt-4 first:pt-0">
                          <div className="font-sans font-bold">BCA</div>
                          <div className="text-right">
                            <div className="font-bold text-lg">1234 567 890</div>
                            <div className="text-sm text-muted-foreground font-sans">a.n PT Tata Warga Digital</div>
                          </div>
                        </div>
                      </>
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
        <div>
          {invoice.status === "COMPLETED" ? (
            <Card className="sticky top-6 border-emerald-500/30 shadow-md bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20">
                <CardTitle className="text-lg text-center text-emerald-600 dark:text-emerald-400">Status Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-emerald-700 dark:text-emerald-400">Telah Lunas</h3>
                <p className="text-sm text-muted-foreground">Pembayaran untuk invoice ini telah dikonfirmasi dan layanan sudah aktif.</p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/rt/billing">Kembali ke Langganan</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="sticky top-6 border-slate-200 dark:border-white/10 shadow-md">
              <CardHeader className="border-b border-slate-100 dark:border-white/10">
                <CardTitle className="text-lg text-center text-primary">Langkah Terakhir</CardTitle>
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
          )}
        </div>
      </div>
    </div>
  );
}
