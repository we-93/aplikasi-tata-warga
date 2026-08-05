"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertProduct, deleteProduct, approveInvoice, cancelInvoice, saveBankInstructions } from "@/app/actions/customer";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, Users, Package, FileText, Building2, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useRef } from "react";

export function BillingClient({ 
  initialProducts, 
  initialInvoices, 
  waDevices,
  settings
}: { 
  initialProducts: any[], 
  initialInvoices: any[],
  waDevices: any[],
  settings: any
}) {
  const [activeTab, setActiveTab] = useState("products");
  const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
  const qrisInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 20;

  const totalInvoicePages = Math.ceil(initialInvoices.length / itemsPerPage);
  const currentInvoices = initialInvoices.slice((currentInvoicePage - 1) * itemsPerPage, currentInvoicePage * itemsPerPage);

  const handleInvoicePageChange = (page: number) => {
    if (page >= 1 && page <= totalInvoicePages) {
      setCurrentInvoicePage(page);
    }
  };

  // PRODUCT STATE
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState<any>({
    id: "",
    name: "",
    price: 0,
    billingPeriod: "MONTHLY",
    masaAktifBulan: 1,
    hargaPendaftaran: 0,
    hargaPerpanjangan: 0,
    maxWarga: 0,
    maxSurat: 0,
    maxAiChat: 0,
    maxAiToken: 2000,
    isActive: true,
    type: "NEW"
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // INVOICE STATE
  const [isAccDialogOpen, setIsAccDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [accForm, setAccForm] = useState({ waDeviceId: "", status: "AKTIF" });
  const [isProcessingAcc, setIsProcessingAcc] = useState(false);

  // BANK SETTINGS STATE
  const defaultBank = [{ bank: "BCA", account: "1234 567 890", name: "PT Tata Warga Digital" }];
  let parsedBank = defaultBank;
  try {
    if (settings?.bankInstructions) {
      parsedBank = typeof settings.bankInstructions === 'string' ? JSON.parse(settings.bankInstructions) : settings.bankInstructions;
    }
  } catch(e) {}
  const [bankInstructions, setBankInstructions] = useState<any[]>(parsedBank);
  const [isSavingBank, setIsSavingBank] = useState(false);

  // PRODUCT HANDLERS
  const handleEditProduct = (prod: any) => {
    setProductForm({ ...prod });
    setIsProductDialogOpen(true);
  };
  
  const handleCreateProduct = () => {
    setProductForm({
      id: "", name: "", price: 0, billingPeriod: "MONTHLY", masaAktifBulan: 1, 
      hargaPendaftaran: 0, hargaPerpanjangan: 0, maxWarga: 0, maxSurat: 0, 
      maxAiChat: 0, maxAiToken: 2000, isActive: true, type: "NEW"
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name) return toast.error("Nama paket wajib diisi!");
    setIsSavingProduct(true);
    const res = await upsertProduct(productForm);
    if (res.success) {
      toast.success("Produk berhasil disimpan");
      setIsProductDialogOpen(false);
    } else {
      toast.error(res.error);
    }
    setIsSavingProduct(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Yakin hapus produk ini?")) {
      const res = await deleteProduct(id);
      if (res.success) toast.success("Terhapus");
      else toast.error(res.error);
    }
  };

  // INVOICE HANDLERS
  const handleDirectAcc = async (inv: any) => {
    if (confirm(`Setujui tagihan ${inv.invoiceNumber} untuk ${inv.product.name}?`)) {
      setIsProcessingAcc(true);
      const res = await approveInvoice(inv.id, "", "AKTIF");
      if (res.success) toast.success("Tagihan disetujui!");
      else toast.error(res.error);
      setIsProcessingAcc(false);
    }
  };

  const handleAcc = async () => {
    if (!accForm.waDeviceId) return toast.error("Pilih Nomor Bot WA terlebih dahulu!");
    setIsProcessingAcc(true);
    const res = await approveInvoice(selectedInvoice.id, accForm.waDeviceId, accForm.status);
    if (res.success) {
      toast.success("Invoice disetujui, akun aktif, & WA telah dikirim!");
      setIsAccDialogOpen(false);
    } else {
      toast.error(res.error);
    }
    setIsProcessingAcc(false);
  };

  const handleCancel = async (id: string) => {
    if (confirm("Yakin menolak pendaftaran ini? Notifikasi pembatalan akan dikirim via WA.")) {
      const res = await cancelInvoice(id);
      if (res.success) toast.success("Dibatalkan");
      else toast.error(res.error);
    }
  };

  // BANK HANDLERS
  const handleAddBank = () => {
    setBankInstructions([...bankInstructions, { bank: "", account: "", name: "" }]);
  };
  const handleRemoveBank = (index: number) => {
    const newB = [...bankInstructions];
    newB.splice(index, 1);
    setBankInstructions(newB);
  };
  const handleUpdateBank = (index: number, field: string, value: string) => {
    const newB = [...bankInstructions];
    newB[index][field] = value;
    setBankInstructions(newB);
  };
  const handleSaveBank = async () => {
    setIsSavingBank(true);
    const res = await saveBankInstructions(bankInstructions);
    if (res.success) toast.success("Instruksi Bank berhasil disimpan!");
    else toast.error(res.error);
    setIsSavingBank(false);
  };

  const handleUploadQris = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSavingBank(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "qris");
      if (settings?.qrisUrl) uploadData.append("oldUrl", settings.qrisUrl);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.success && data.url) {
        const { saveQrisUrl } = await import("@/app/actions/customer");
        await saveQrisUrl(data.url);
        toast.success("Gambar QRIS diperbarui!");
        window.location.reload();
      } else {
        toast.error("Gagal unggah QRIS");
      }
    } catch (err) {
      toast.error("Error upload QRIS");
    }
    setIsSavingBank(false);
  };
  
  const handleRemoveQris = async () => {
    if (!confirm("Hapus QRIS ini?")) return;
    setIsSavingBank(true);
    try {
      if (settings?.qrisUrl) {
        const uploadData = new FormData();
        uploadData.append("oldUrl", settings.qrisUrl); // This triggers deletion in api/upload
        await fetch("/api/upload", { method: "POST", body: uploadData });
      }
      const { saveQrisUrl } = await import("@/app/actions/customer");
      await saveQrisUrl(null);
      toast.success("Gambar QRIS dihapus!");
      window.location.reload();
    } catch (err) {
      toast.error("Error hapus QRIS");
    }
    setIsSavingBank(false);
  };

  // HELPER: Format Rupiah
  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manajemen Produk & Invoice</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Kelola paket langganan SaaS dan verifikasi pembayaran.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full md:w-max overflow-x-auto gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl justify-start">
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Package className="w-4 h-4 shrink-0" /> Produk & Paket
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <FileText className="w-4 h-4 shrink-0" /> Validasi Tagihan
          </TabsTrigger>
          <TabsTrigger 
            value="bank" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Building2 className="w-4 h-4 shrink-0" /> Instruksi Bank
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PRODUCTS */}
        <TabsContent value="products" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-[#141229] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)]">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Produk</h2>
            <button onClick={handleCreateProduct} className="flex items-center justify-center w-full md:w-auto gap-2 bg-[#6419c1] text-white px-5 py-2.5 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold">
              <Plus className="w-4 h-4" /> Buat Paket Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialProducts.map(prod => (
              <div key={prod.id} className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 relative hover:shadow-md transition-shadow">
                {!prod.isActive && <div className="absolute top-4 right-4 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-500/20">Nonaktif</div>}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{prod.name}</h3>
                <p className="text-2xl font-black text-[#6419c1] dark:text-[#a064fa] mb-4">{formatRp(prod.hargaPendaftaran)} <span className="text-sm font-normal text-slate-500 dark:text-white/50">/ {prod.masaAktifBulan} hari</span></p>
                
                <div className="space-y-2.5 text-sm mb-6 text-slate-600 dark:text-white/70">
                  <p className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2"><strong className="text-slate-900 dark:text-white">Perpanjang:</strong> {formatRp(prod.hargaPerpanjangan)}</p>
                  <p className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2"><strong className="text-slate-900 dark:text-white">Surat:</strong> {prod.maxSurat === -1 ? "∞" : prod.maxSurat === 0 ? "x" : `${prod.maxSurat}/bln`}</p>
                  <p className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2"><strong className="text-slate-900 dark:text-white">Warga:</strong> {prod.maxWarga === -1 ? "∞" : prod.maxWarga === 0 ? "x" : prod.maxWarga}</p>
                  <p className="flex justify-between pb-2"><strong className="text-slate-900 dark:text-white">AI Token:</strong> {prod.maxAiToken === -1 ? "∞" : prod.maxAiToken === 0 ? "x" : prod.maxAiToken}</p>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-4 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5 truncate font-mono">
                    /checkout/{prod.slug}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 flex justify-center items-center gap-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium py-2 rounded-xl transition-colors border border-slate-200 dark:border-white/10" onClick={() => handleEditProduct(prod)}>
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-transparent dark:border-white/5" onClick={() => handleDeleteProduct(prod.id)}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{productForm.id ? "Edit Paket" : "Buat Paket Baru"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Kategori Produk</Label>
                  <Select value={productForm.type || "NEW"} onValueChange={(v) => setProductForm({...productForm, type: v || "NEW"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Produk Baru (NEW)</SelectItem>
                      <SelectItem value="UPGRADE">Upgrade Paket (UPGRADE)</SelectItem>
                      <SelectItem value="RENEW">Perpanjang Paket (RENEW)</SelectItem>
                      <SelectItem value="ADDON">Topup (ADDON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nama Produk</Label>
                  <Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Pro / Premium" />
                </div>
                
                {productForm.type !== "ADDON" && (
                  <div className="space-y-2">
                    <Label>Masa Aktif (Hari)</Label>
                    <Input type="number" min={1} value={productForm.masaAktifBulan} onChange={e => setProductForm({...productForm, masaAktifBulan: parseInt(e.target.value)})} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Harga Pendaftaran (Rp)</Label>
                  <Input type="number" value={productForm.hargaPendaftaran} onChange={e => setProductForm({...productForm, hargaPendaftaran: parseInt(e.target.value)})} />
                </div>

                {productForm.type !== "ADDON" && (
                  <div className="space-y-2">
                    <Label>Harga Perpanjangan (Rp)</Label>
                    <Input type="number" value={productForm.hargaPerpanjangan} onChange={e => setProductForm({...productForm, hargaPerpanjangan: parseInt(e.target.value)})} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Kuota Cetak Surat (-1 = unlimited, 0 = tidak ada)</Label>
                  <Input type="number" value={productForm.maxSurat} onChange={e => setProductForm({...productForm, maxSurat: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Kuota Token AI (-1 = unlimited, 0 = tidak ada)</Label>
                  <Input type="number" value={productForm.maxAiToken} onChange={e => setProductForm({...productForm, maxAiToken: parseInt(e.target.value)})} />
                </div>
                
                <div className="space-y-2">
                  <Label>Batas Jumlah Warga (-1 = unlimited, 0 = tidak ada)</Label>
                  <Input type="number" value={productForm.maxWarga} onChange={e => setProductForm({...productForm, maxWarga: parseInt(e.target.value)})} />
                </div>
                
                <div className="col-span-2 flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox"
                    id="isActive" 
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={productForm.isActive} 
                    onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                  />
                  <Label htmlFor="isActive">Paket Aktif (Tersedia untuk dibeli)</Label>
                </div>

                <div className="col-span-2 pt-4">
                  <Button className="w-full" onClick={handleSaveProduct} disabled={isSavingProduct}>
                    {isSavingProduct && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Simpan Produk
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 2: INVOICES / VERIFIKASI */}
        <TabsContent value="invoices" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Tagihan & Pendaftaran</h4>
            </div>
            <div className="overflow-x-auto w-full pb-2">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NO. INVOICE</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">TANGGAL</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">CUSTOMER & RT</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">PRODUK & HARGA</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {currentInvoices.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-white/40 text-sm">Belum ada invoice pendaftaran.</td></tr>
                  ) : currentInvoices.map(inv => (
                    <tr key={inv.id} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-mono font-semibold text-sm text-slate-700 dark:text-white/80">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/60">{new Date(inv.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{inv.customerName}</p>
                        <p className="text-xs text-slate-500 dark:text-white/50">{inv.tenant?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm text-[#6419c1] dark:text-[#a064fa]">{inv.product?.name}</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white/80 mt-1">{formatRp(Number(inv.amount))}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border
                          ${inv.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                            inv.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 
                            'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => window.open(`/api/invoice/${inv.id}/download`, '_blank')} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-colors" title="Lihat"><Eye className="w-4 h-4" /></button>
                          {inv.status === "PENDING" && (
                            <>
                              <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition-colors" onClick={() => {
                                if (inv.tenant?.whatsappGroupId) {
                                  // If already has a bot/group (TOPUP/RENEW/UPGRADE of active tenant)
                                  handleDirectAcc(inv);
                                } else {
                                  // Requires bot assignment
                                  setSelectedInvoice(inv);
                                  setAccForm({ waDeviceId: "", status: "AKTIF" });
                                  setIsAccDialogOpen(true);
                                }
                              }}>Terima</button>
                              <button className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors" onClick={() => handleCancel(inv.id)}>Tolak</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalInvoicePages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <p className="text-xs text-muted-foreground font-medium">
                Menampilkan <span className="text-foreground">{(currentInvoicePage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentInvoicePage * itemsPerPage, initialInvoices.length)}</span> dari <span className="text-foreground">{initialInvoices.length}</span> invoice
              </p>
              <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleInvoicePageChange(currentInvoicePage - 1)}
                  disabled={currentInvoicePage === 1}
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center px-1">
                  {Array.from({ length: totalInvoicePages }).map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 || 
                      page === totalInvoicePages || 
                      (page >= currentInvoicePage - 1 && page <= currentInvoicePage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentInvoicePage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleInvoicePageChange(page)}
                          className={`h-8 w-8 p-0 rounded-lg font-medium text-xs transition-all ${
                            currentInvoicePage === page 
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentInvoicePage - 2 ||
                      page === currentInvoicePage + 2
                    ) {
                      return <span key={page} className="px-1.5 text-muted-foreground text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleInvoicePageChange(currentInvoicePage + 1)}
                  disabled={currentInvoicePage === totalInvoicePages}
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Dialog open={isAccDialogOpen} onOpenChange={setIsAccDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verifikasi & Aktifkan Akun</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg text-sm space-y-2 mb-2">
                  <p><strong>Customer:</strong> {selectedInvoice?.customerName}</p>
                  <p><strong>Invoice:</strong> {selectedInvoice?.invoiceNumber}</p>
                  <p>Aksi ini akan mengaktifkan Tenant dan mengirim WA berisi Email, Password, serta instruksi login ke Customer.</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Pilih Bot WhatsApp (Multi-Device)</Label>
                  <Select value={accForm.waDeviceId || ""} onValueChange={v => setAccForm({...accForm, waDeviceId: v || ""})}>
                    <SelectTrigger><SelectValue placeholder="-- Pilih Perangkat WA --" /></SelectTrigger>
                    <SelectContent>
                      {waDevices.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.provider}) - Grup Terpakai: {d.groups?.filter((g: any) => g.tenantId).length || 0}/{d.groups?.length || 0}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <Label>Status Akun Tenant</Label>
                  <Select value={accForm.status} onValueChange={v => setAccForm({...accForm, status: v || "AKTIF"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AKTIF">Aktif</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="NONAKTIF">Nonaktif / Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full mt-4" onClick={handleAcc} disabled={isProcessingAcc}>
                  {isProcessingAcc && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan & Kirim Akses
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 3: BANK INSTRUCTIONS */}
        <TabsContent value="bank" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6">
            <h2 className="text-xl font-bold mb-4">Pengaturan Instruksi Pembayaran Bank</h2>
            <p className="text-sm text-slate-500 mb-6">Daftar rekening bank ini akan ditampilkan kepada calon pelanggan di halaman *Checkout Success*.</p>
            
            <div className="space-y-4 mb-6">
              {bankInstructions.map((b, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 items-end p-4 border border-slate-100 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/20">
                  <div className="space-y-2 flex-1 w-full">
                    <Label>Nama Bank / E-Wallet</Label>
                    <Input placeholder="BCA / Mandiri / OVO" value={b.bank} onChange={e => handleUpdateBank(i, 'bank', e.target.value)} />
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <Label>Nomor Rekening</Label>
                    <Input placeholder="1234 567 890" value={b.account} onChange={e => handleUpdateBank(i, 'account', e.target.value)} />
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <Label>Atas Nama</Label>
                    <Input placeholder="PT Tata Warga Digital" value={b.name} onChange={e => handleUpdateBank(i, 'name', e.target.value)} />
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveBank(i)} className="mb-0.5">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <hr className="my-8 border-slate-200 dark:border-white/10" />
            
            <h2 className="text-xl font-bold mb-4">Metode Pembayaran QRIS</h2>
            <p className="text-sm text-slate-500 mb-6">Upload gambar barcode QRIS Anda. Jika di-upload, pembeli dapat memilih QRIS pada saat checkout.</p>
            
            <div className="flex flex-col md:flex-row gap-6 items-start mb-8 border border-slate-100 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/20 p-6">
              <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                {settings?.qrisUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border">
                    <img src={settings.qrisUrl} alt="QRIS" className="w-full h-auto object-contain max-h-[300px] bg-white p-2 rounded-xl" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" onClick={handleRemoveQris}>
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-black/40 text-slate-400">
                    <span className="text-sm">Belum ada QRIS</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={qrisInputRef} 
                  onChange={handleUploadQris}
                />
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => qrisInputRef.current?.click()}
                  disabled={isSavingBank}
                >
                  <Upload className="w-4 h-4 mr-2" /> 
                  {settings?.qrisUrl ? "Ganti QRIS" : "Upload QRIS"}
                </Button>
              </div>
              <div className="flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><strong>Tips Upload QRIS:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Gunakan gambar yang jelas dan tidak blur.</li>
                  <li>Pastikan nama merchant QRIS Anda sesuai dengan nama bisnis Anda.</li>
                  <li>Gambar akan otomatis menyesuaikan ukuran pada halaman sukses checkout.</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleAddBank}><Plus className="w-4 h-4 mr-2" /> Tambah Rekening</Button>
              <Button className="bg-[#6419c1] hover:bg-[#7735d4] text-white" onClick={handleSaveBank} disabled={isSavingBank}>
                {isSavingBank && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Pengaturan
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
