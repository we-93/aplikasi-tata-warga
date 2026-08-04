"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchWargaGlobal, deleteWargaGlobal } from "@/app/actions/customer";
import { updateTenantByAdmin, deleteTenantByAdmin } from "@/app/actions/tenant";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users, Search, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";

export function DataClient({ initialTenants, waDevices = [] }: { initialTenants: any[], waDevices?: any[] }) {
  const [activeTab, setActiveTab] = useState("tenants");
  const [currentTenantPage, setCurrentTenantPage] = useState(1);
  const itemsPerPage = 20;
  const [filterPaket, setFilterPaket] = useState("SEMUA");
  const [searchTenantQuery, setSearchTenantQuery] = useState("");

  const filteredTenants = initialTenants.filter(t => {
    if (filterPaket !== "SEMUA") {
      const plan = (t.subscriptionPlan || "Trial").toUpperCase();
      if (plan !== filterPaket.toUpperCase()) return false;
    }
    
    if (searchTenantQuery) {
      const q = searchTenantQuery.toLowerCase();
      const namaRt = (t.name || "").toLowerCase();
      const ketuaName = (t.ketuaName || "").toLowerCase();
      const tenantAdmin = t.users?.find((u: any) => u.role === "TENANT_ADMIN");
      const email = (tenantAdmin?.email || "").toLowerCase();
      
      if (!namaRt.includes(q) && !ketuaName.includes(q) && !email.includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  const totalTenantPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const currentTenants = filteredTenants.slice((currentTenantPage - 1) * itemsPerPage, currentTenantPage * itemsPerPage);

  const handleTenantPageChange = (page: number) => {
    if (page >= 1 && page <= totalTenantPages) {
      setCurrentTenantPage(page);
    }
  };
  
  // TENANT EDIT STATE
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [editForm, setEditForm] = useState({ 
    name: "", province: "", city: "", district: "", village: "", rt: "", rw: "", address: "", kodePos: "", ketuaName: "", ketuaNik: "", namaRw: "", noHpRt: "", whatsappGroupId: "", waDeviceId: "", status: "AKTIF" 
  });
  const [isUpdatingTenant, setIsUpdatingTenant] = useState(false);
  
  // WARGA SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      toast.error("Masukkan minimal 3 karakter NIK atau Nama");
      return;
    }
    setIsSearching(true);
    const res = await searchWargaGlobal(searchQuery);
    setSearchResults(res);
    setIsSearching(false);
  };

  const handleDeleteWarga = async (id: string) => {
    if (confirm("Perhatian! Menghapus warga oleh Admin adalah tindakan final. Yakin lanjutkan?")) {
      const res = await deleteWargaGlobal(id);
      if (res.success) {
        toast.success("Warga berhasil dihapus dari sistem");
        setSearchResults(searchResults.filter(w => w.id !== id));
      } else {
        toast.error(res.error);
      }
    }
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;
    setIsUpdatingTenant(true);
    const res = await updateTenantByAdmin(editingTenant.id, {
      name: editForm.name,
      province: editForm.province,
      city: editForm.city,
      district: editForm.district,
      village: editForm.village,
      rt: editForm.rt,
      rw: editForm.rw,
      address: editForm.address,
      kodePos: editForm.kodePos,
      ketuaName: editForm.ketuaName,
      ketuaNik: editForm.ketuaNik,
      namaRw: editForm.namaRw,
      noHpRt: editForm.noHpRt,
      whatsappGroupId: editForm.whatsappGroupId,
      waDeviceId: editForm.waDeviceId || null,
      status: editForm.status
    });
    if (res.success) {
      toast.success("Konfigurasi RT berhasil diupdate");
      setEditingTenant(null);
    } else {
      toast.error(res.error);
    }
    setIsUpdatingTenant(false);
  };

  const handleDeleteTenant = async (id: string) => {
    if (confirm("Yakin ingin menghapus seluruh data RT ini? (Data warga, surat, kas akan hilang)")) {
      const res = await deleteTenantByAdmin(id);
      if (res.success) {
        toast.success("Data RT berhasil dihapus");
      } else {
        toast.error(res.error);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manajemen Data</h2>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Kelola data RT terdaftar dan telusuri warga lintas tenant.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full md:w-max overflow-x-auto gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl justify-start">
          <TabsTrigger 
            value="tenants" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Users className="w-4 h-4 shrink-0" /> Daftar RT
          </TabsTrigger>
          <TabsTrigger 
            value="warga" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Search className="w-4 h-4 shrink-0" /> Cari Warga
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DAFTAR RT */}
        <TabsContent value="tenants" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h4 className="text-lg font-bold">Daftar RT</h4>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative group flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/40" />
                  <input 
                    className="w-full sm:w-[250px] pl-9 pr-4 py-1.5 h-8 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-[#6419c1] focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30" 
                    placeholder="Cari RT / Admin / Email..." 
                    type="text" 
                    value={searchTenantQuery}
                    onChange={(e) => { setSearchTenantQuery(e.target.value); setCurrentTenantPage(1); }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-slate-500 hidden sm:block">Paket:</Label>
                  <Select value={filterPaket} onValueChange={(v) => { setFilterPaket(v); setCurrentTenantPage(1); }}>
                    <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs bg-slate-50 dark:bg-black/20">
                      <SelectValue placeholder="Pilih Paket" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMUA">Semua Paket</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="PLATINUM">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto w-full pb-2">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NO</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">ADMIN / EMAIL</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NAMA RT</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">PAKET</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">FASILITAS</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {currentTenants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-white/40 text-sm">
                        Belum ada RT yang mendaftar.
                      </td>
                    </tr>
                  ) : currentTenants.map((t, index) => {
                    const sub = t.subscriptions?.[0];
                    const tenantAdmin = t.users?.find((u: any) => u.role === "TENANT_ADMIN");
                    return (
                      <tr key={t.id} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                          {(currentTenantPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.ketuaName || "Belum diset"}</span>
                            <span className="text-xs text-slate-500 dark:text-white/50">{tenantAdmin?.email || "Tidak ada email"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#6419c1]/10 dark:bg-[#6419c1]/20 flex items-center justify-center text-[#6419c1] dark:text-[#a064fa] font-bold text-xs uppercase shrink-0">
                              {t.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#6419c1] dark:text-[#a064fa]">
                          {t.subscriptionPlan || "Free"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-1.5 text-slate-600 dark:text-white/70">
                            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Bot: {t.waDevice?.name || t.whatsappBotNo || "Belum ada"} {t.waDevice?.phoneNumber ? `(${t.waDevice.phoneNumber})` : ""}</p>
                            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Surat: {sub?.product.maxSurat === 0 ? "Unlimited" : (sub?.product.maxSurat || 0)}</p>
                            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> AI: {sub?.product.maxAiToken === 0 ? "Unlimited" : (sub?.product.maxAiToken || 0)} Token</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {t.status === "AKTIF" ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/20">Aktif</span>
                          ) : t.status === "PENDING" ? (
                            <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold border border-orange-200 dark:border-orange-500/20">Pending</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-200 dark:border-red-500/20">Suspended</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingTenant(t);
                                setEditForm({
                                  name: t.name || "",
                                  province: t.province || "",
                                  city: t.city || "",
                                  district: t.district || "",
                                  village: t.village || "",
                                  rt: t.rt || "",
                                  rw: t.rw || "",
                                  address: t.address || "",
                                  kodePos: t.kodePos || "",
                                  ketuaName: t.ketuaName || "",
                                  ketuaNik: t.ketuaNik || "",
                                  namaRw: t.namaRw || "",
                                  noHpRt: t.noHpRt || "",
                                  whatsappGroupId: t.whatsappGroupId || "",
                                  waDeviceId: t.waDeviceId || "",
                                  status: t.status || "AKTIF"
                                });
                              }}
                              className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Edit Pengaturan RT"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTenant(t.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Hapus RT"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalTenantPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <p className="text-xs text-muted-foreground font-medium">
                Menampilkan <span className="text-foreground">{(currentTenantPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentTenantPage * itemsPerPage, filteredTenants.length)}</span> dari <span className="text-foreground">{filteredTenants.length}</span> RT
              </p>
              <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTenantPageChange(currentTenantPage - 1)}
                  disabled={currentTenantPage === 1}
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center px-1">
                  {Array.from({ length: totalTenantPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 || 
                      page === totalTenantPages || 
                      (page >= currentTenantPage - 1 && page <= currentTenantPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentTenantPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleTenantPageChange(page)}
                          className={`h-8 w-8 p-0 rounded-lg font-medium text-xs transition-all ${
                            currentTenantPage === page 
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentTenantPage - 2 ||
                      page === currentTenantPage + 2
                    ) {
                      return <span key={page} className="px-1.5 text-muted-foreground text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTenantPageChange(currentTenantPage + 1)}
                  disabled={currentTenantPage === totalTenantPages}
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <Dialog open={!!editingTenant} onOpenChange={(o) => !o && setEditingTenant(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Edit Pengaturan RT ({editingTenant?.name})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 md:space-y-6 py-2 md:py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Nama Organisasi / RT</Label>
                  <Input placeholder="RT 01 / RW 02" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Nama Ketua RT</Label>
                  <Input placeholder="Budi Santoso" value={editForm.ketuaName} onChange={e => setEditForm({...editForm, ketuaName: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">NIK Ketua RT</Label>
                  <Input placeholder="3201..." value={editForm.ketuaNik} onChange={e => setEditForm({...editForm, ketuaNik: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Nomor HP RT</Label>
                  <Input placeholder="0812..." value={editForm.noHpRt} onChange={e => setEditForm({...editForm, noHpRt: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">RT</Label>
                  <Input placeholder="001" value={editForm.rt} onChange={e => setEditForm({...editForm, rt: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">RW</Label>
                  <Input placeholder="002" value={editForm.rw} onChange={e => setEditForm({...editForm, rw: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Nama Ketua RW</Label>
                  <Input placeholder="Agus" value={editForm.namaRw} onChange={e => setEditForm({...editForm, namaRw: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Desa / Kelurahan</Label>
                  <Input placeholder="Sukamaju" value={editForm.village} onChange={e => setEditForm({...editForm, village: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Kecamatan</Label>
                  <Input placeholder="Cilodong" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Kota / Kabupaten</Label>
                  <Input placeholder="Depok" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Provinsi</Label>
                  <Input placeholder="Jawa Barat" value={editForm.province} onChange={e => setEditForm({...editForm, province: e.target.value})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs md:text-sm">Kode Pos</Label>
                  <Input placeholder="16415" value={editForm.kodePos} onChange={e => setEditForm({...editForm, kodePos: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-xs md:text-sm">Alamat Lengkap</Label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm dark:bg-black/20 dark:border-white/10 dark:text-white"
                  rows={2} 
                  placeholder="Jl. Raya Bogor KM 39..." 
                  value={editForm.address} 
                  onChange={e => setEditForm({...editForm, address: e.target.value})} 
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3 md:space-y-4">
                <h4 className="font-semibold text-sm md:text-base">Konfigurasi Integrasi & Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm">ID Grup WhatsApp</Label>
                    <Input placeholder="Misal: 120363xxx@g.us" value={editForm.whatsappGroupId} onChange={e => setEditForm({...editForm, whatsappGroupId: e.target.value})} />
                    <p className="text-[10px] text-slate-500">ID webhook grup untuk notifikasi.</p>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm">Pilih Bot WhatsApp</Label>
                    <Select value={editForm.waDeviceId || "NONE"} onValueChange={v => setEditForm({...editForm, waDeviceId: v === "NONE" ? "" : (v || "")})}>
                      <SelectTrigger><SelectValue placeholder="Pilih Bot..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Tidak Ada Bot</SelectItem>
                        {waDevices.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>{d.name} ({d.provider})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm">Status RT</Label>
                    <Select value={editForm.status} onValueChange={v => setEditForm({...editForm, status: v || "AKTIF"})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AKTIF">Aktif</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="NONAKTIF">Nonaktif / Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleUpdateTenant} disabled={isUpdatingTenant} className="w-full bg-[#6419c1] hover:bg-[#7735d4] text-white">
                {isUpdatingTenant ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* TAB 2: PENCARIAN WARGA GLOBAL */}
        <TabsContent value="warga" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#6419c1]/10 dark:bg-[#6419c1]/20 flex items-center justify-center text-[#6419c1] dark:text-[#a064fa] mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Pencarian Warga Lintas RT</h2>
            <p className="text-slate-500 dark:text-white/50 text-sm mb-8 text-center max-w-xl">
              Pencarian dilakukan melintasi batas database antar tenant/RT. Gunakan NIK atau Nama Lengkap untuk mencari data warga secara global.
            </p>
            
            <div className="flex w-full max-w-2xl gap-3">
              <input 
                type="text"
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white shadow-sm"
                placeholder="Masukkan minimal 3 karakter NIK atau Nama Lengkap..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="flex items-center justify-center gap-2 bg-[#6419c1] text-white px-6 py-3 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">Cari Data</span>
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                <h4 className="text-lg font-bold">Hasil Pencarian: {searchResults.length} Warga</h4>
              </div>
              <div className="overflow-x-auto w-full pb-2">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NIK</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NAMA LENGKAP</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">ASAL RT (TENANT)</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {searchResults.map(w => (
                      <tr key={w.id} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-white/70">{w.nik}</td>
                        <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-white">{w.namaLengkap}</td>
                        <td className="px-6 py-4 text-sm text-[#6419c1] dark:text-[#a064fa]">{w.tenant?.name || "Tidak Diketahui"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${w.statusWarga === 'AKTIF' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                            {w.statusWarga}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteWarga(w.id)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Hapus Warga"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
