"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGlobalTemplate, updateGlobalTemplate } from "@/app/actions/letter";
import { toast } from "sonner";
import { Loader2, Code2, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import Editor from "@monaco-editor/react";

type TemplateData = {
  id?: string;
  name: string;
  code: string;
  contentHtml?: string | null;
  paperSize?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
};

const DEFAULT_TEMPLATE = `<div style="padding: 0; margin: 0;">
  <!-- KOP SURAT (2 Kolom) -->
  <!-- Menggunakan 2 kolom agar area teks (85%) lebih luas dan tidak terpotong (wrap) ke baris baru -->
  <table style="width: 100%; border-bottom: 3px solid black; margin-bottom: 2px;">
    <tr>
      <td style="width: 15%; text-align: center; vertical-align: middle; padding-bottom: 10px;">
        {{tw_logo_rt}}
      </td>
      <td style="width: 85%; text-align: center; vertical-align: middle; padding-bottom: 10px;">
        <div style="margin: 0; font-size: 18pt; font-weight: bold; text-transform: uppercase; color: #000; line-height: 1.1;">PENGURUS RT {{tw_rt}} RW {{tw_rw}}</div>
        <div style="margin: 0; font-size: 14pt; font-weight: bold; color: #000; line-height: 1.1;">{{tw_desa}}, Kecamatan {{tw_kecamatan}}, {{tw_kabupaten}}</div>
        <div style="margin: 0; font-size: 12pt; font-style: italic; color: #000; line-height: 1.5; margin-top: 2px;">Sekretariat: {{tw_sekretariat}}, Kode Pos {{tw_kode_pos}}</div>
      </td>
    </tr>
  </table>
  <div style="border-top: 1px solid black; margin-bottom: 20px;"></div>

  <!-- JUDUL SURAT -->
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 0; font-size: 14pt; text-decoration: underline; text-transform: uppercase;">SURAT KETERANGAN</h3>
    <p style="margin: 0;">Nomor: {{tw_nomor_surat}}/{{tw_kode_surat}}</p>
  </div>

  <!-- ISI SURAT -->
  <p style="text-align: justify; text-indent: 40px;">
    Yang bertanda tangan di bawah ini, Ketua RT {{tw_rt}} RW {{tw_rw}}, {{tw_desa}}, menerangkan dengan sebenarnya bahwa:
  </p>

  <table style="width: 90%; margin: 15px auto;">
    <tr>
      <td style="width: 30%;">Nama Lengkap</td>
      <td style="width: 5%;">:</td>
      <td style="width: 65%;"><strong>{{tw_nama_lengkap}}</strong></td>
    </tr>
    <tr>
      <td>NIK</td>
      <td>:</td>
      <td>{{tw_nik}}</td>
    </tr>
    <tr>
      <td>Tempat, Tanggal Lahir</td>
      <td>:</td>
      <td>{{tw_tempat_lahir}}, {{tw_tanggal_lahir}}</td>
    </tr>
    <tr>
      <td>Jenis Kelamin</td>
      <td>:</td>
      <td>{{tw_jenis_kelamin}}</td>
    </tr>
    <tr>
      <td>Agama</td>
      <td>:</td>
      <td>{{tw_agama}}</td>
    </tr>
    <tr>
      <td>Pekerjaan</td>
      <td>:</td>
      <td>{{tw_pekerjaan}}</td>
    </tr>
    <tr>
      <td>Alamat</td>
      <td>:</td>
      <td>{{tw_alamat}}</td>
    </tr>
  </table>

  <p style="text-align: justify; text-indent: 40px;">
    Orang tersebut di atas adalah benar-benar warga yang berdomisili di RT {{tw_rt}} RW {{tw_rw}} {{tw_desa}}. Surat keterangan ini diberikan untuk keperluan <strong>[Tulis Keperluan Disini]</strong>.
  </p>

  <p style="text-align: justify; text-indent: 40px;">
    Demikian surat keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya.
  </p>

  <!-- TANGGAL SURAT -->
  <div style="text-align: right; margin-bottom: 20px;">
    {{tw_desa}}, {{tw_tanggal_surat}}
  </div>

  <!-- TANDA TANGAN -->
  <table style="width: 100%; margin-top: 30px;">
    <tr>
      <td style="width: 40%; text-align: center; vertical-align: bottom;">
        <div style="margin: 0; margin-bottom: 5px;">Yang Bersangkutan</div>
        <div style="height: 80px;"></div>
        <div style="margin: 0;">{{tw_nama_lengkap}}</div>
      </td>
      <td style="width: 20%;"></td>
      <td style="width: 40%; text-align: center; vertical-align: bottom;">
        <div style="margin: 0; margin-bottom: 5px; white-space: nowrap;">{{tw_desa}}, {{tw_tanggal_surat}}</div>
        <div style="margin: 0;">Ketua RT {{tw_rt}}/{{tw_rw}}</div>
        <div style="height: 80px; position: relative;">
          <!-- Stempel di belakang tanda tangan -->
          <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">{{tw_stempel_rt}}</div>
          <div style="position: relative; z-index: 10; height: 100%; display: flex; align-items: center; justify-content: center;">{{tw_ttd_rt}}</div>
        </div>
        <div style="margin: 0;">{{tw_ketua_rt}}</div>
      </td>
    </tr>
  </table>
</div>`;

export function LetterEditorForm({ initialData }: { initialData?: TemplateData }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [contentHtml, setContentHtml] = useState(initialData?.contentHtml || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contentHtml) {
      toast.error("Kode HTML tidak boleh kosong.");
      return;
    }

    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("contentHtml", contentHtml);

    const isEdit = !!initialData?.id;
    const res = isEdit 
      ? await updateGlobalTemplate(initialData.id!, formData)
      : await createGlobalTemplate(formData);

    if (res.success) {
      toast.success(isEdit ? "Template berhasil diperbarui!" : "Template berhasil disimpan!");
      router.push("/admin/letters");
    } else {
      toast.error(res.error || "Gagal menyimpan template");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6 bg-card p-6 rounded-lg border">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Surat</Label>
          <Input id="name" name="name" defaultValue={initialData?.name} placeholder="Misal: Surat Keterangan Domisili" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Kode Surat</Label>
          <Input id="code" name="code" defaultValue={initialData?.code} placeholder="Misal: SKD" required />
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <Label className="text-lg font-semibold">HTML Code Editor</Label>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              if (window.confirm("Kode saat ini akan ditimpa dengan kerangka standar. Lanjutkan?")) {
                setContentHtml(DEFAULT_TEMPLATE);
              }
            }}
            className="text-primary"
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Gunakan Kerangka Standar
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden h-[600px]">
          <Editor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={contentHtml}
            onChange={(val) => setContentHtml(val || "")}
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              formatOnPaste: true,
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Gunakan tag <code>{"{{tw_logo_rt}}"}</code> untuk menampilkan logo RT otomatis, dan variabel seperti <code>{"{{tw_nama_lengkap}}"}</code> untuk data warga.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border space-y-6">
        <h3 className="text-lg font-semibold">Pengaturan Cetak (PDF)</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="paperSize">Ukuran Kertas</Label>
            <Select name="paperSize" defaultValue={initialData?.paperSize || "A4"}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ukuran kertas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="FOLIO">F4 / Folio (215 x 330 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marginTop">Margin Atas (cm)</Label>
            <Input id="marginTop" name="marginTop" type="number" step="0.1" defaultValue={initialData?.marginTop ?? 2.54} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marginBottom">Margin Bawah (cm)</Label>
            <Input id="marginBottom" name="marginBottom" type="number" step="0.1" defaultValue={initialData?.marginBottom ?? 2.54} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marginLeft">Margin Kiri (cm)</Label>
            <Input id="marginLeft" name="marginLeft" type="number" step="0.1" defaultValue={initialData?.marginLeft ?? 2.54} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marginRight">Margin Kanan (cm)</Label>
            <Input id="marginRight" name="marginRight" type="number" step="0.1" defaultValue={initialData?.marginRight ?? 2.54} required />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/letters">Batal</Link>
        </Button>
        <Button type="submit" disabled={isPending} className="bg-[#1b264f] hover:bg-[#1b264f]/90 text-white min-w-[150px]">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Simpan Template
        </Button>
      </div>
    </form>
  );
}
