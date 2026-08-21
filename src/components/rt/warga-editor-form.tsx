"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createWarga, updateWarga } from "@/app/actions/warga";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";

export function WargaEditorForm({ initialData, isKkLocked = false }: { initialData?: any; isKkLocked?: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const pekerjaanOptions = ["Karyawan", "Mengurus Rumah Tangga", "Pegawai Swasta", "PNS", "Pekerja Lepas", "Buruh Harian", "Petani", "Nelayan", "Belum Bekerja"];
  const isPekerjaanManual = initialData?.pekerjaan && !pekerjaanOptions.includes(initialData.pekerjaan);
  const [pekerjaanType, setPekerjaanType] = useState(isPekerjaanManual ? "Lainnya" : (initialData?.pekerjaan || ""));
  const [pekerjaanManual, setPekerjaanManual] = useState(isPekerjaanManual ? initialData.pekerjaan : "");

  const pendidikanOptions = ["Tidak/Belum Sekolah", "SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3"];
  const isPendidikanManual = initialData?.pendidikan && !pendidikanOptions.includes(initialData.pendidikan);
  const [pendidikanType, setPendidikanType] = useState(isPendidikanManual ? "Lainnya" : (initialData?.pendidikan || ""));
  const [pendidikanManual, setPendidikanManual] = useState(isPendidikanManual ? initialData.pendidikan : "");

  const statusNikahOptions = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];
  const isStatusNikahManual = initialData?.statusNikah && !statusNikahOptions.includes(initialData.statusNikah);
  const [statusNikahType, setStatusNikahType] = useState(isStatusNikahManual ? "Lainnya" : (initialData?.statusNikah || ""));
  const [statusNikahManual, setStatusNikahManual] = useState(isStatusNikahManual ? initialData.statusNikah : "");

  const golonganDarahOptions = ["A", "B", "AB", "O"];
  const isGolonganDarahManual = initialData?.golonganDarah && !golonganDarahOptions.includes(initialData.golonganDarah);
  const [golonganDarahType, setGolonganDarahType] = useState(isGolonganDarahManual ? "Lainnya" : (initialData?.golonganDarah || ""));
  const [golonganDarahManual, setGolonganDarahManual] = useState(isGolonganDarahManual ? initialData.golonganDarah : "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const submitAction = (e.nativeEvent as any).submitter?.value;
    
    // Override custom fields if Lainnya
    if (pekerjaanType === "Lainnya" && pekerjaanManual) formData.set("pekerjaan", pekerjaanManual);
    else if (pekerjaanType && pekerjaanType !== "Lainnya") formData.set("pekerjaan", pekerjaanType);

    if (pendidikanType === "Lainnya" && pendidikanManual) formData.set("pendidikan", pendidikanManual);
    else if (pendidikanType && pendidikanType !== "Lainnya") formData.set("pendidikan", pendidikanType);

    if (statusNikahType === "Lainnya" && statusNikahManual) formData.set("statusNikah", statusNikahManual);
    else if (statusNikahType && statusNikahType !== "Lainnya") formData.set("statusNikah", statusNikahType);

    if (golonganDarahType === "Lainnya" && golonganDarahManual) formData.set("golonganDarah", golonganDarahManual);
    else if (golonganDarahType && golonganDarahType !== "Lainnya") formData.set("golonganDarah", golonganDarahType);
    
    const isEdit = !!initialData?.id;
    const res = isEdit 
      ? await updateWarga(initialData.id, formData)
      : await createWarga(formData);

    if (res.success) {
      toast.success(isEdit ? "Data warga diperbarui!" : "Warga baru ditambahkan!");
      router.push(`/dashboard/rt/warga/kk/${formData.get("noKk")}`);
    } else {
      toast.error(res.error || "Terjadi kesalahan.");
      setIsPending(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card p-6 rounded-lg border space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Informasi Utama</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nik">NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span></Label>
            <Input id="nik" name="nik" defaultValue={initialData?.nik} maxLength={16} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noKk">Nomor Kartu Keluarga (KK)</Label>
            <Input id="noKk" name="noKk" defaultValue={initialData?.noKk} maxLength={16} readOnly={isKkLocked} className={isKkLocked ? "bg-muted" : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hubunganKeluarga">Hubungan Keluarga <span className="text-red-500">*</span></Label>
            <Select name="hubunganKeluarga" defaultValue={initialData?.hubunganKeluarga || "KEPALA_KELUARGA"} disabled={isKkLocked && initialData?.hubunganKeluarga === "KEPALA_KELUARGA"}>
              <SelectTrigger className={isKkLocked && initialData?.hubunganKeluarga === "KEPALA_KELUARGA" ? "bg-muted" : ""}><SelectValue placeholder="Pilih Hubungan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="KEPALA_KELUARGA">Kepala Keluarga</SelectItem>
                <SelectItem value="ISTRI">Istri</SelectItem>
                <SelectItem value="SUAMI">Suami</SelectItem>
                <SelectItem value="ANAK">Anak</SelectItem>
                <SelectItem value="MENANTU">Menantu</SelectItem>
                <SelectItem value="CUCU">Cucu</SelectItem>
                <SelectItem value="ORANG_TUA">Orang Tua</SelectItem>
                <SelectItem value="MERTUA">Mertua</SelectItem>
                <SelectItem value="FAMILI_LAIN">Famili Lain</SelectItem>
                <SelectItem value="PEMBANTU">Pembantu</SelectItem>
                <SelectItem value="LAINNYA">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            {isKkLocked && initialData?.hubunganKeluarga === "KEPALA_KELUARGA" && (
               <input type="hidden" name="hubunganKeluarga" value="KEPALA_KELUARGA" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="namaLengkap" name="namaLengkap" defaultValue={initialData?.namaLengkap} required />
          </div>
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Data Kelahiran & Biologis</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tempatLahir">Tempat Lahir</Label>
            <Input id="tempatLahir" name="tempatLahir" defaultValue={initialData?.tempatLahir} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
            <Input id="tanggalLahir" name="tanggalLahir" type="date" defaultValue={formatDate(initialData?.tanggalLahir)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
            <Select name="jenisKelamin" defaultValue={initialData?.jenisKelamin || "LAKI_LAKI"}>
              <SelectTrigger><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="golonganDarah">Golongan Darah</Label>
            <Select onValueChange={(v) => setGolonganDarahType(v)} value={golonganDarahType || undefined}>
              <SelectTrigger><SelectValue placeholder="Pilih Golongan Darah" /></SelectTrigger>
              <SelectContent>
                {golonganDarahOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                <SelectItem value="Lainnya">Lainnya (Ketik Manual)</SelectItem>
              </SelectContent>
            </Select>
            {golonganDarahType === "Lainnya" && (
              <Input 
                placeholder="Ketik Golongan Darah..." 
                value={golonganDarahManual}
                onChange={(e) => setGolonganDarahManual(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Administrasi & Kontak</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="agama">Agama</Label>
            <Select name="agama" defaultValue={initialData?.agama || ""}>
              <SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Islam">Islam</SelectItem>
                <SelectItem value="Kristen">Kristen Protestan</SelectItem>
                <SelectItem value="Katolik">Kristen Katolik</SelectItem>
                <SelectItem value="Hindu">Hindu</SelectItem>
                <SelectItem value="Buddha">Buddha</SelectItem>
                <SelectItem value="Konghucu">Konghucu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusNikah">Status Perkawinan</Label>
            <Select onValueChange={(v) => setStatusNikahType(v)} value={statusNikahType || undefined}>
              <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
              <SelectContent>
                {statusNikahOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                <SelectItem value="Lainnya">Lainnya (Ketik Manual)</SelectItem>
              </SelectContent>
            </Select>
            {statusNikahType === "Lainnya" && (
              <Input 
                placeholder="Ketik Status Perkawinan..." 
                value={statusNikahManual}
                onChange={(e) => setStatusNikahManual(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pekerjaan">Pekerjaan</Label>
            <Select onValueChange={(v) => setPekerjaanType(v)} value={pekerjaanType || undefined}>
              <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
              <SelectContent>
                {pekerjaanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                <SelectItem value="Lainnya">Lainnya (Ketik Manual)</SelectItem>
              </SelectContent>
            </Select>
            {pekerjaanType === "Lainnya" && (
              <Input 
                placeholder="Ketik pekerjaan..." 
                value={pekerjaanManual}
                onChange={(e) => setPekerjaanManual(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
            <Select onValueChange={(v) => setPendidikanType(v)} value={pendidikanType || undefined}>
              <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
              <SelectContent>
                {pendidikanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                <SelectItem value="Lainnya">Lainnya (Ketik Manual)</SelectItem>
              </SelectContent>
            </Select>
            {pendidikanType === "Lainnya" && (
              <Input 
                placeholder="Ketik Pendidikan..." 
                value={pendidikanManual}
                onChange={(e) => setPendidikanManual(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="noHp">Nomor HP / WhatsApp</Label>
            <Input id="noHp" name="noHp" defaultValue={initialData?.noHp} placeholder="08..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusWarga">Status Warga di RT</Label>
            <Select name="statusWarga" defaultValue={initialData?.statusWarga || "TETAP"}>
              <SelectTrigger><SelectValue placeholder="Status Warga" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TETAP">Tetap</SelectItem>
                <SelectItem value="KONTRAK_KOST">Kontrak/Kost</SelectItem>
                <SelectItem value="PINDAH">Pindah Domisili</SelectItem>
                <SelectItem value="MENINGGAL">Meninggal Dunia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="alamat">Alamat Lengkap</Label>
          <Textarea id="alamat" name="alamat" defaultValue={initialData?.alamat} placeholder="Nama Jalan, Blok, Nomor Rumah..." readOnly={isKkLocked && initialData?.hubunganKeluarga !== "KEPALA_KELUARGA"} className={isKkLocked && initialData?.hubunganKeluarga !== "KEPALA_KELUARGA" ? "bg-muted" : ""} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10 mt-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/rt/warga">Batal</Link>
        </Button>
        <Button type="submit" name="submitAction" value="save_only" disabled={isPending} className="bg-[#6419c1] hover:bg-[#6419c1]/90 text-white min-w-[150px]">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Data
        </Button>
      </div>
    </form>
  );
}
