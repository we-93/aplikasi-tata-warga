"use client";

import { Button } from "@/components/ui/button";
import { Download, Share2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function SuratDetailClient({ arsip }: { arsip: any }) {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (!arsip || !arsip.template) return;
    const { template, warga, tenant } = arsip;
    
    let content = template.content;
    const nomorSuratFinal = arsip.nomorSurat && arsip.nomorSurat.trim() !== '' ? arsip.nomorSurat : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    const toTitleCase = (str: string | null) => str ? str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '-';
    
    let kodeSurat = arsip.kodeSurat;
    const replacements: Record<string, string> = {
      'tw_nomor_surat': nomorSuratFinal,
      'tw_kode_surat': kodeSurat,
      'tw_tanggal_surat': new Date(arsip.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      'tw_rt': tenant.rt || '-',
      'tw_rw': tenant.rw || '-',
      'tw_desa': toTitleCase(tenant.village),
      'tw_kecamatan': toTitleCase(tenant.district),
      'tw_kabupaten': toTitleCase(tenant.city),
      'tw_provinsi': toTitleCase(tenant.province),
      'tw_ketua_rt': toTitleCase(tenant.ketuaName),
      'tw_ketua_rw': tenant.namaRw || '-',
      'tw_no_hp_rt': tenant.noHpRt || '-',
      'tw_sekretariat': tenant.address || '-',
      'tw_kode_pos': tenant.kodePos || '-',
      // No logos here for preview to keep it simple and clean on mobile, unless we pass b64
      'tw_logo_rt': '',
      'tw_ttd_rt': '',
      'tw_stempel_rt': '',
    };

    if (warga) {
      Object.assign(replacements, {
        'tw_nik': warga.nik,
        'tw_no_kk': warga.noKk,
        'tw_nama_lengkap': warga.namaLengkap,
        'tw_nama_panggilan': warga.namaPanggilan || '-',
        'tw_tempat_lahir': warga.tempatLahir || '-',
        'tw_tanggal_lahir': warga.tanggalLahir ? new Date(warga.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
        'tw_jenis_kelamin': warga.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
        'tw_agama': warga.agama || '-',
        'tw_alamat': warga.alamat || '-',
        'tw_status_perkawinan': warga.statusNikah || '-',
        'tw_pekerjaan': warga.pekerjaan || '-',
        'tw_pendidikan': warga.pendidikan || '-',
        'tw_golongan_darah': warga.golonganDarah || '-',
        'tw_no_hp': warga.noHp || '-',
        'tw_email': warga.email || '-',
      });
    }

    if (arsip.customData && typeof arsip.customData === 'object') {
      const customVars = arsip.customData as Record<string, string>;
      Object.keys(customVars).forEach(key => {
        replacements[key] = customVars[key] || '';
      });
    }

    if (arsip.kodeSurat === '') {
      content = content.replace(/\{\{tw_nomor_surat\}\}\/\{\{tw_kode_surat\}\}/g, nomorSuratFinal);
      content = content.replace(/\{\{tw_nomor_surat\}\} \/ \{\{tw_kode_surat\}\}/g, nomorSuratFinal);
    }

    Object.keys(replacements).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, replacements[key]);
    });

    setHtmlContent(content);
  }, [arsip]);

  const handleOpenPdf = async (url: string) => {
    try {
      const isCapacitor = typeof (window as any).Capacitor !== "undefined" || navigator.userAgent.includes("capacitor");
      if (isCapacitor) {
        const absoluteUrl = new URL(url, window.location.href).href;
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: absoluteUrl });
      } else {
        window.open(url, "_blank");
      }
    } catch (e) {
      console.error("Error opening PDF:", e);
      window.open(url, "_blank");
    }
  };

  const handleShare = async () => {
    const isCapacitor = typeof (window as any).Capacitor !== "undefined" || navigator.userAgent.includes("capacitor");
    const downloadUrl = new URL(`/api/surat/${arsip.id}/download`, window.location.href).href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surat ${arsip.template?.name}`,
          text: `Berikut adalah tautan untuk melihat Surat ${arsip.template?.name} atas nama ${arsip.warga?.namaLengkap || 'Warga'}.`,
          url: downloadUrl
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      // Fallback for desktop browsers without Web Share API
      navigator.clipboard.writeText(downloadUrl);
      toast.success("Tautan surat berhasil disalin ke clipboard!");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">
            Detail Surat
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {arsip.warga?.namaLengkap || 'Warga Dihapus'} - {arsip.template?.name}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-8">
        <div className="w-full max-w-[800px] mx-auto overflow-x-auto">
          <div 
            className="min-w-[600px] bg-white text-black p-8 rounded-lg shadow-sm border border-slate-100 prose prose-sm max-w-none prose-p:my-1 prose-h1:mb-2 prose-h2:mb-2 prose-td:border-none prose-th:border-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 z-10 md:left-[260px] md:pl-10 lg:pl-[4.5rem]">
        <div className="max-w-[800px] mx-auto flex gap-3">
          <Button 
            className="flex-1 bg-[#6419c1] hover:bg-[#7735d4] text-white shadow-md shadow-[#6419c1]/20 h-12 rounded-xl text-base"
            onClick={() => handleOpenPdf(`/api/surat/${arsip.id}/download?download=1`)}
          >
            <Download className="w-5 h-5 mr-2" />
            Unduh PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl text-base border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 mr-2 text-[#6419c1]" />
            Bagikan
          </Button>
        </div>
      </div>
    </div>
  );
}
