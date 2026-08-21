"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { createWargaBatch } from "@/app/actions/warga";

export function WargaKkForm({ noKk }: { noKk: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [alamat, setAlamat] = useState("");

  const pekerjaanOptions = ["Karyawan", "Mengurus Rumah Tangga", "Pegawai Swasta", "PNS", "Pekerja Lepas", "Buruh Harian", "Petani", "Nelayan", "Belum Bekerja"];

  const [members, setMembers] = useState<any[]>([
    { 
      id: Date.now().toString(),
      hubunganKeluarga: "KEPALA_KELUARGA",
      nik: "",
      namaLengkap: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "LAKI_LAKI",
      agama: "",
      statusNikah: "",
      pekerjaanType: "",
      pekerjaanManual: "",
      pendidikan: "",
      golonganDarah: "",
      noHp: "",
      statusWarga: "TETAP",
    }
  ]);

  const addMember = () => {
    setMembers([...members, {
      id: Date.now().toString(),
      hubunganKeluarga: "ISTRI", // Default for second member
      nik: "",
      namaLengkap: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "PEREMPUAN",
      agama: "",
      statusNikah: "",
      pekerjaanType: "",
      pekerjaanManual: "",
      pendidikan: "",
      golonganDarah: "",
      noHp: "",
      statusWarga: "TETAP",
    }]);
  };

  const removeMember = (id: string) => {
    if (members.length === 1) return;
    setMembers(members.filter(m => m.id !== id));
  };

  const updateMember = (id: string, field: string, value: any) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // Validate NIK
    const niks = members.map(m => m.nik);
    const hasDuplicateNik = new Set(niks).size !== niks.length;
    if (hasDuplicateNik) {
      toast.error("Terdapat NIK yang sama dalam formulir ini.");
      setIsPending(false);
      return;
    }

    const payload = members.map(m => ({
      noKk,
      alamat,
      hubunganKeluarga: m.hubunganKeluarga,
      nik: m.nik,
      namaLengkap: m.namaLengkap,
      tempatLahir: m.tempatLahir || null,
      tanggalLahir: m.tanggalLahir ? new Date(m.tanggalLahir) : null,
      jenisKelamin: m.jenisKelamin,
      agama: m.agama || null,
      statusNikah: m.statusNikah || null,
      pekerjaan: m.pekerjaanType === "Lainnya" ? m.pekerjaanManual : m.pekerjaanType || null,
      pendidikan: m.pendidikan || null,
      golonganDarah: m.golonganDarah || null,
      noHp: m.noHp || null,
      statusWarga: m.statusWarga,
    }));

    const res = await createWargaBatch(payload);

    if (res.success) {
      toast.success("Kartu Keluarga dan seluruh anggotanya berhasil ditambahkan!");
      router.push(`/dashboard/rt/warga/kk/${noKk}`);
    } else {
      toast.error(res.error || "Gagal menyimpan data.");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Alamat KK (Global) */}
      <div className="bg-card border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Informasi Kartu Keluarga</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nomor Kartu Keluarga (KK)</Label>
            <Input value={noKk} readOnly className="bg-muted font-medium tracking-wide" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat Lengkap <span className="text-red-500">*</span></Label>
            <Textarea 
              id="alamat" 
              value={alamat} 
              onChange={(e) => setAlamat(e.target.value)} 
              placeholder="Nama Jalan, Blok, Nomor Rumah..." 
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {members.map((member, index) => (
          <div key={member.id} className="bg-card border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm relative">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <h4 className="font-semibold text-[#6419c1] dark:text-[#8b3ced]">
                Anggota #{index + 1} {index === 0 ? "(Kepala Keluarga)" : ""}
              </h4>
              {index > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(member.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </Button>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hubungan Keluarga <span className="text-red-500">*</span></Label>
                  <Select value={member.hubunganKeluarga} onValueChange={(v) => updateMember(member.id, "hubunganKeluarga", v)} disabled={index === 0}>
                    <SelectTrigger className={index === 0 ? "bg-muted" : ""}><SelectValue /></SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label>Status Warga di RT <span className="text-red-500">*</span></Label>
                  <Select value={member.statusWarga} onValueChange={(v) => updateMember(member.id, "statusWarga", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TETAP">Tetap</SelectItem>
                      <SelectItem value="KONTRAK_KOST">Kontrak/Kost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>NIK <span className="text-red-500">*</span></Label>
                  <Input value={member.nik} onChange={(e) => updateMember(member.id, "nik", e.target.value.replace(/[^0-9]/g, '').slice(0, 16))} required maxLength={16} />
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                  <Input value={member.namaLengkap} onChange={(e) => updateMember(member.id, "namaLengkap", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
                  <Select value={member.jenisKelamin} onValueChange={(v) => updateMember(member.id, "jenisKelamin", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                      <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tempat Lahir</Label>
                  <Input value={member.tempatLahir} onChange={(e) => updateMember(member.id, "tempatLahir", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <Input type="date" value={member.tanggalLahir} onChange={(e) => updateMember(member.id, "tanggalLahir", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Agama</Label>
                  <Select value={member.agama || undefined} onValueChange={(v) => updateMember(member.id, "agama", v)}>
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
                  <Label>Status Perkawinan</Label>
                  <Select value={member.statusNikah || undefined} onValueChange={(v) => updateMember(member.id, "statusNikah", v)}>
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
                  <Label>Golongan Darah</Label>
                  <Select value={member.golonganDarah || undefined} onValueChange={(v) => updateMember(member.id, "golonganDarah", v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Gol. Darah" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pekerjaan</Label>
                  <Select value={member.pekerjaanType || undefined} onValueChange={(v) => updateMember(member.id, "pekerjaanType", v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
                    <SelectContent>
                      {pekerjaanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      <SelectItem value="Lainnya">Lainnya (Ketik Manual)</SelectItem>
                    </SelectContent>
                  </Select>
                  {member.pekerjaanType === "Lainnya" && (
                    <Input 
                      placeholder="Ketik pekerjaan..." 
                      value={member.pekerjaanManual}
                      onChange={(e) => updateMember(member.id, "pekerjaanManual", e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Pendidikan Terakhir</Label>
                  <Select value={member.pendidikan || undefined} onValueChange={(v) => updateMember(member.id, "pendidikan", v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</SelectItem>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                      <SelectItem value="S3">S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nomor HP / WhatsApp</Label>
                  <Input value={member.noHp} onChange={(e) => updateMember(member.id, "noHp", e.target.value)} placeholder="08..." />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-4">
          <Button type="button" onClick={addMember} variant="outline" className="border-dashed border-2 border-[#6419c1]/30 text-[#6419c1] hover:bg-[#6419c1]/5 hover:border-[#6419c1] w-full py-6">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Anggota Keluarga Lainnya
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
        <Button type="button" variant="ghost" onClick={() => window.location.reload()}>Batal</Button>
        <Button type="submit" disabled={isPending} className="bg-[#6419c1] hover:bg-[#6419c1]/90 text-white px-6 h-10 text-sm">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Data Warga
        </Button>
      </div>

    </form>
  );
}
