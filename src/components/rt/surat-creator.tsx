"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createSuratArsip } from "@/app/actions/surat";
import { toast } from "sonner";
import { Loader2, FileText, ArrowRight, Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STANDARD_TAGS = [
  'tw_nomor_surat', 'tw_kode_surat', 'tw_tanggal_surat', 'tw_rt', 'tw_rw', 'tw_desa', 
  'tw_kecamatan', 'tw_kabupaten', 'tw_provinsi', 'tw_ketua_rt', 'tw_ketua_rw', 
  'tw_sekretariat', 'tw_kode_pos', 'tw_logo_rt', 'tw_ttd_rt', 'tw_stempel_rt', 
  'tw_nik', 'tw_no_kk', 'tw_nama_lengkap', 'tw_nama_panggilan', 'tw_tempat_lahir', 
  'tw_tanggal_lahir', 'tw_jenis_kelamin', 'tw_agama', 'tw_alamat', 'tw_status_perkawinan', 
  'tw_pekerjaan', 'tw_pendidikan', 'tw_golongan_darah', 'tw_no_hp', 'tw_email'
];

export function SuratCreator({ templates, wargas, tenant }: { templates: any[]; wargas: any[]; tenant: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [wargaId, setWargaId] = useState("");
  const [openWarga, setOpenWarga] = useState(false);
  
  // Form States
  const [nomorSurat, setNomorSurat] = useState("");
  const [kodeSurat, setKodeSurat] = useState("");
  const [wargaData, setWargaData] = useState<Record<string, any>>({});
  
  // Custom Dynamic Fields States
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<string[]>([]);

  const selectedTemplate = templates.find(t => t.id === templateId);
  const selectedWarga = wargas.find(w => w.id === wargaId);

  // Auto-fill default kode surat when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const date = new Date();
      const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      const rt = tenant?.rt || '000';
      const rw = tenant?.rw || '000';
      setKodeSurat(`${selectedTemplate.code}/RT${rt}-RW${rw}/${romanMonths[date.getMonth()]}/${date.getFullYear()}`);
    }
  }, [selectedTemplate, tenant]);

  // Parse HTML for custom variables whenever template changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.contentHtml) {
      const regex = /{{(tw_[a-zA-Z0-9_]+)}}/g;
      const matches = Array.from(selectedTemplate.contentHtml.matchAll(regex));
      const tags = matches.map((m: any) => m[1]);
      const uniqueTags = Array.from(new Set(tags));
      
      const custom = uniqueTags.filter(tag => !STANDARD_TAGS.includes(tag as string));
      setCustomFields(custom as string[]);
      
      // Reset custom data
      const initialData: Record<string, string> = {};
      custom.forEach(tag => initialData[tag as string] = "");
      setCustomData(initialData);
    } else {
      setCustomFields([]);
      setCustomData({});
    }
  }, [templateId, templates, selectedTemplate]);

  useEffect(() => {
    if (wargaId) {
      const selected = wargas.find(w => w.id === wargaId);
      if (selected) {
        setWargaData({ ...selected });
      }
    } else {
      setWargaData({});
    }
  }, [wargaId, wargas]);

  const handleGenerate = async () => {
    if (!templateId || !wargaId) {
      toast.error("Silakan pilih jenis surat dan warga terlebih dahulu.");
      return;
    }

    // Validate required custom fields (all of them are required to prevent broken PDFs)
    for (const field of customFields) {
      if (!customData[field]) {
        toast.error(`Harap isi field khusus: ${field.replace('tw_', '').replace(/_/g, ' ')}`);
        return;
      }
    }

    setIsPending(true);
    
    // Convert tanggalLahir string back to Date object if it was modified
    let parsedDate = undefined;
    if (wargaData.tanggalLahirStr) {
      try {
        parsedDate = new Date(wargaData.tanggalLahirStr);
      } catch (e) {}
    }

    const dataToUpdate = {
      namaLengkap: wargaData.namaLengkap,
      nik: wargaData.nik,
      tempatLahir: wargaData.tempatLahir,
      jenisKelamin: wargaData.jenisKelamin,
      agama: wargaData.agama,
      pekerjaan: wargaData.pekerjaan,
      alamat: wargaData.alamat,
      ...(parsedDate ? { tanggalLahir: parsedDate } : {})
    };

    const res = await createSuratArsip(templateId, wargaId, nomorSurat, dataToUpdate, customData, kodeSurat);

    if (res.success) {
      toast.success("Surat berhasil di-generate!");
      
      const a = document.createElement("a");
      a.href = `/api/surat/${res.arsipId}/download?download=1`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      router.push("/dashboard/rt/surat");
    } else {
      toast.error(res.error);
      setIsPending(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border max-w-4xl mx-auto space-y-8 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-lg">1. Pilih Jenis Surat</Label>
          <Select onValueChange={(val: any) => setTemplateId(val?.value ? val.value[0] : (val || ''))} value={templateId}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="-- Pilih Template Surat --" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </SelectItem>
              ))}
              {templates.length === 0 && (
                <SelectItem value="empty" disabled>Belum ada master template surat.</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {templateId && (
          <div className="space-y-2 pt-4">
            <Label className="text-lg">2. Pilih Warga Pemohon</Label>
            <Popover open={openWarga} onOpenChange={setOpenWarga}>
              <PopoverTrigger className={buttonVariants({ variant: "outline", className: "w-full justify-between font-normal h-12" })}>
                  {selectedWarga ? `${selectedWarga.nik} - ${selectedWarga.namaLengkap}` : "-- Cari Nama atau NIK Warga --"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Ketik NIK atau Nama..." className="h-11" />
                  <CommandList>
                    <CommandEmpty>Data warga tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {wargas.map((w) => (
                        <CommandItem
                          key={w.id}
                          value={`${w.nik} ${w.namaLengkap}`} // Search by both
                          onSelect={() => {
                            setWargaId(w.id);
                            setOpenWarga(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              wargaId === w.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {w.nik} - {w.namaLengkap}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* TAHAP 3: FORM EDIT LIVE */}
      {wargaId && (
        <div className="pt-8 mt-8 border-t border-dashed space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Label className="text-lg block mb-4">3. Konfirmasi Data Surat & Warga</Label>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-md border space-y-6">
            
            {/* ROW 0: DYNAMIC CUSTOM FIELDS */}
            {customFields.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <Label className="text-md font-bold text-indigo-600 block">Form Isian Khusus ({selectedTemplate?.name})</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-md border border-indigo-200 dark:border-indigo-900 shadow-sm">
                  {customFields.map(field => {
                    // Prettify label (tw_nama_usaha -> Nama Usaha)
                    const label = field.replace('tw_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={field} className="space-y-2">
                        <Label>{label}</Label>
                        <Input 
                          value={customData[field] || ''} 
                          onChange={(e) => setCustomData({...customData, [field]: e.target.value})} 
                          className="bg-white dark:bg-black border-indigo-200 focus-visible:ring-indigo-500"
                          placeholder={`Ketik ${label.toLowerCase()}...`}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="border-t my-6 border-dashed border-slate-300"></div>
              </>
            )}

            {/* ROW 1: NOMOR SURAT & KODE SURAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nomorSurat" className="text-primary font-semibold">Nomor Surat (Manual)</Label>
                <Input 
                  id="nomorSurat" 
                  value={nomorSurat} 
                  onChange={(e) => setNomorSurat(e.target.value)} 
                  placeholder="Kosongkan jika tidak perlu"
                  className="bg-white dark:bg-black"
                />
                <p className="text-xs text-muted-foreground">Diisi angka (misal: 015) atau dikosongkan untuk ditulis tangan.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kodeSurat" className="text-primary font-semibold">Format Kode Surat</Label>
                <Input 
                  id="kodeSurat" 
                  value={kodeSurat} 
                  onChange={(e) => setKodeSurat(e.target.value)}
                  className="bg-white dark:bg-black font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Silakan edit jika RT Anda memiliki struktur kode surat yang berbeda.</p>
              </div>
            </div>

            <div className="border-t my-4"></div>

            {/* ROW 2: DATA WARGA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input 
                  value={wargaData.namaLengkap || ''} 
                  onChange={(e) => setWargaData({...wargaData, namaLengkap: e.target.value})} 
                  className="bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-2">
                <Label>NIK</Label>
                <Input 
                  value={wargaData.nik || ''} 
                  onChange={(e) => setWargaData({...wargaData, nik: e.target.value})} 
                  className="bg-white dark:bg-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tempat Lahir</Label>
                <Input 
                  value={wargaData.tempatLahir || ''} 
                  onChange={(e) => setWargaData({...wargaData, tempatLahir: e.target.value})} 
                  className="bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <Input 
                  type="date"
                  value={wargaData.tanggalLahir ? new Date(wargaData.tanggalLahir).toISOString().split('T')[0] : (wargaData.tanggalLahirStr || '')} 
                  onChange={(e) => setWargaData({...wargaData, tanggalLahirStr: e.target.value, tanggalLahir: null})} 
                  className="bg-white dark:bg-black"
                />
              </div>

              <div className="space-y-2">
                <Label>Agama</Label>
                <Input 
                  value={wargaData.agama || ''} 
                  onChange={(e) => setWargaData({...wargaData, agama: e.target.value})} 
                  className="bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-2">
                <Label>Pekerjaan</Label>
                <Input 
                  value={wargaData.pekerjaan || ''} 
                  onChange={(e) => setWargaData({...wargaData, pekerjaan: e.target.value})} 
                  className="bg-white dark:bg-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <Input 
                value={wargaData.alamat || ''} 
                onChange={(e) => setWargaData({...wargaData, alamat: e.target.value})} 
                className="bg-white dark:bg-black"
              />
            </div>

            <p className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200 dark:border-amber-900">
              <strong>Info:</strong> Perubahan form biodata di atas akan otomatis memperbarui database Warga Anda.
            </p>
          </div>
        </div>
      )}

      <div className="pt-6 border-t flex justify-end">
        <Button 
          onClick={handleGenerate} 
          disabled={isPending || !templateId || !wargaId}
          className="bg-[#6419c1] hover:bg-[#6419c1]/90 text-white h-10 px-6 text-sm"
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Buat & Unduh Surat
          {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
