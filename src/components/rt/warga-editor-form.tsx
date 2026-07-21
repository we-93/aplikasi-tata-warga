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
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function WargaEditorForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    const isEdit = !!initialData?.id;
    const res = isEdit 
      ? await updateWarga(initialData.id, formData)
      : await createWarga(formData);

    if (res.success) {
      toast.success(isEdit ? "Data warga diperbarui!" : "Warga baru ditambahkan!");
      router.push("/dashboard/rt/warga");
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
            <Input id="noKk" name="noKk" defaultValue={initialData?.noKk} maxLength={16} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="namaLengkap" name="namaLengkap" defaultValue={initialData?.namaLengkap} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaPanggilan">Nama Panggilan</Label>
            <Input id="namaPanggilan" name="namaPanggilan" defaultValue={initialData?.namaPanggilan} />
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
            <Select name="golonganDarah" defaultValue={initialData?.golonganDarah || ""}>
              <SelectTrigger><SelectValue placeholder="Pilih Golongan Darah" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="AB">AB</SelectItem>
                <SelectItem value="O">O</SelectItem>
              </SelectContent>
            </Select>
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
            <Select name="statusNikah" defaultValue={initialData?.statusNikah || ""}>
              <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                <SelectItem value="Kawin">Kawin</SelectItem>
                <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pekerjaan">Pekerjaan</Label>
            <Input id="pekerjaan" name="pekerjaan" defaultValue={initialData?.pekerjaan} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
            <Input id="pendidikan" name="pendidikan" defaultValue={initialData?.pendidikan} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noHp">Nomor HP / WhatsApp</Label>
            <Input id="noHp" name="noHp" defaultValue={initialData?.noHp} placeholder="08..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusWarga">Status Warga di RT</Label>
            <Select name="statusWarga" defaultValue={initialData?.statusWarga || "AKTIF"}>
              <SelectTrigger><SelectValue placeholder="Status Warga" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="PINDAH">Pindah Domisili</SelectItem>
                <SelectItem value="MENINGGAL">Meninggal Dunia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="alamat">Alamat Lengkap</Label>
          <Textarea id="alamat" name="alamat" defaultValue={initialData?.alamat} placeholder="Nama Jalan, Blok, Nomor Rumah..." />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/rt/warga">Batal</Link>
        </Button>
        <Button type="submit" disabled={isPending} className="bg-[#21b7b1] hover:bg-[#21b7b1]/90 text-white min-w-[150px]">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Simpan Data Warga
        </Button>
      </div>
    </form>
  );
}
