"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTenantProfile, updateTenantMediaField } from "@/app/actions/tenant";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [signatureUrl, setSignatureUrl] = useState(initialData?.signatureUrl || "");
  const [stampUrl, setStampUrl] = useState(initialData?.stampUrl || "");
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingTtd, setUploadingTtd] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ttd' | 'stamp', oldUrl: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "tenant");
    if (oldUrl) formData.append("oldUrl", oldUrl);

    if (type === 'logo') setUploadingLogo(true);
    if (type === 'ttd') setUploadingTtd(true);
    if (type === 'stamp') setUploadingStamp(true);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.success && data.url) {
        let fieldName: 'logoUrl' | 'signatureUrl' | 'stampUrl' = 'logoUrl';
        if (type === 'logo') { setLogoUrl(data.url); fieldName = 'logoUrl'; }
        if (type === 'ttd') { setSignatureUrl(data.url); fieldName = 'signatureUrl'; }
        if (type === 'stamp') { setStampUrl(data.url); fieldName = 'stampUrl'; }
        
        toast.success("Gambar berhasil diunggah! Jangan lupa klik Simpan Pengaturan.");
      } else {
        toast.error(data.error || "Gagal mengunggah gambar");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengunggah gambar");
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'ttd') setUploadingTtd(false);
      if (type === 'stamp') setUploadingStamp(false);
    }
  };

  const handleDeleteMedia = async (type: 'logo' | 'ttd' | 'stamp', oldUrl: string) => {
    if (!confirm("Hapus gambar ini?")) return;
    
    if (type === 'logo') setUploadingLogo(true);
    if (type === 'ttd') setUploadingTtd(true);
    if (type === 'stamp') setUploadingStamp(true);

    try {
      const formData = new FormData();
      formData.append("oldUrl", oldUrl);
      // We send an empty file to trigger only deletion
      formData.append("file", new Blob([]), "empty"); 
      formData.append("folder", "tenant");

      await fetch("/api/upload", { method: "POST", body: formData });
      
      let fieldName: 'logoUrl' | 'signatureUrl' | 'stampUrl' = 'logoUrl';
      if (type === 'logo') { setLogoUrl(""); fieldName = 'logoUrl'; }
      if (type === 'ttd') { setSignatureUrl(""); fieldName = 'signatureUrl'; }
      if (type === 'stamp') { setStampUrl(""); fieldName = 'stampUrl'; }
      
      toast.success("Gambar dihapus. Jangan lupa klik Simpan Pengaturan.");
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus gambar");
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'ttd') setUploadingTtd(false);
      if (type === 'stamp') setUploadingStamp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    if (!logoUrl) {
      toast.error("Logo / Kop Surat wajib diunggah.");
      setIsPending(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const res = await updateTenantProfile(formData);

    if (res.success) {
      toast.success("Profil Kepengurusan RT berhasil diperbarui!");
    } else {
      toast.error(res.error || "Terjadi kesalahan.");
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-card p-6 rounded-lg border space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Identitas Kepengurusan</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Alias Organisasi <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" defaultValue={initialData?.name || ""} placeholder="Misal: RT 01 RW 09 Sukamaju" required />
            <p className="text-xs text-muted-foreground">Digunakan untuk tampilan di aplikasi.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ketuaName">Nama Ketua RT <span className="text-red-500">*</span></Label>
            <Input id="ketuaName" name="ketuaName" defaultValue={initialData?.ketuaName || ""} placeholder="Misal: Bapak Budi" required />
            <p className="text-xs text-muted-foreground">Tampil di kolom penandatangan surat.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rt">Nomor RT <span className="text-red-500">*</span></Label>
            <Input id="rt" name="rt" defaultValue={initialData?.rt || ""} placeholder="Misal: 001" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rw">Nomor RW <span className="text-red-500">*</span></Label>
            <Input id="rw" name="rw" defaultValue={initialData?.rw || ""} placeholder="Misal: 009" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaRw">Nama Ketua RW <span className="text-red-500">*</span></Label>
            <Input id="namaRw" name="namaRw" defaultValue={initialData?.namaRw || ""} placeholder="Misal: Bapak Hermawan" required />
            <p className="text-xs text-muted-foreground">Tampil di kop surat bagian pengurus RW.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="noHpRt">Nomor HP RT</Label>
            <Input id="noHpRt" name="noHpRt" defaultValue={initialData?.noHpRt || ""} placeholder="Misal: 081234567890" />
          </div>
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Data Wilayah Administrasi</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="village">Desa / Kelurahan <span className="text-red-500">*</span></Label>
            <Input id="village" name="village" defaultValue={initialData?.village || ""} placeholder="Misal: Desa Sukamaju atau Kel. Sukaasih" required />
            <p className="text-[11px] text-muted-foreground">Ketik lengkap dengan awalan "Desa" atau "Kelurahan" agar tercetak rapi di kop surat.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">Kecamatan <span className="text-red-500">*</span></Label>
            <Input id="district" name="district" defaultValue={initialData?.district || ""} placeholder="Misal: Solear" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kabupaten / Kota <span className="text-red-500">*</span></Label>
            <Input id="city" name="city" defaultValue={initialData?.city || ""} placeholder="Misal: Kab. Tangerang atau Kota Tangerang" required />
            <p className="text-[11px] text-muted-foreground">Ketik lengkap dengan awalan "Kabupaten" atau "Kota".</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi <span className="text-red-500">*</span></Label>
            <Input id="province" name="province" defaultValue={initialData?.province || ""} placeholder="Misal: Banten" required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="address">Alamat <span className="text-red-500">*</span></Label>
            <Textarea id="address" name="address" defaultValue={initialData?.address || ""} placeholder="Misal: Perumahan Kirana Surya Blok A1 No. 10" className="h-[80px]" required />
            <p className="text-xs text-muted-foreground">Tampil di Kop Surat (Kop bagian bawah).</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kodePos">Kode Pos (Opsional)</Label>
            <Input id="kodePos" name="kodePos" defaultValue={initialData?.kodePos || ""} placeholder="Misal: 15730" />
          </div>
        </div>
        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Media & Berkas (Untuk Cetak Surat)</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Logo / Kop Surat <span className="text-red-500">*</span></Label>
            <input type="hidden" name="logoUrl" value={logoUrl} />
            <div className="flex flex-col items-start gap-4">
              {logoUrl ? (
                <div className="relative rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white p-4 inline-block group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="object-contain max-h-32" />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteMedia('logo', logoUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Hapus Logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex items-center justify-center text-xs text-slate-400">
                  Kosong
                </div>
              )}
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'logo', logoUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Button type="button" variant="outline" size="sm" disabled={uploadingLogo}>
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {uploadingLogo ? "Mengunggah..." : "Pilih Logo"}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tanda Tangan Ketua RT (Opsional)</Label>
            <input type="hidden" name="signatureUrl" value={signatureUrl} />
            <div className="flex flex-col items-start gap-4">
              {signatureUrl ? (
                <div className="relative rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white p-4 inline-block group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureUrl} alt="Tanda Tangan" className="object-contain max-h-32" />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteMedia('ttd', signatureUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Hapus Tanda Tangan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex items-center justify-center text-xs text-slate-400">
                  Kosong
                </div>
              )}
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'ttd', signatureUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Button type="button" variant="outline" size="sm" disabled={uploadingTtd}>
                  {uploadingTtd ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {uploadingTtd ? "Mengunggah..." : "Pilih TTD"}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Stempel RT (Opsional)</Label>
            <input type="hidden" name="stampUrl" value={stampUrl} />
            <div className="flex flex-col items-start gap-4">
              {stampUrl ? (
                <div className="relative rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white p-4 inline-block group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stampUrl} alt="Stempel" className="object-contain max-h-32" />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteMedia('stamp', stampUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Hapus Stempel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex items-center justify-center text-xs text-slate-400">
                  Kosong
                </div>
              )}
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'stamp', stampUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Button type="button" variant="outline" size="sm" disabled={uploadingStamp}>
                  {uploadingStamp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {uploadingStamp ? "Mengunggah..." : "Pilih Stempel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-[#1b264f] hover:bg-[#1b264f]/90 text-white min-w-[150px]">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}
