"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSiteSettings } from "@/app/actions/settings";
import { Loader2 } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [logoUrlDark, setLogoUrlDark] = useState(initialData?.logoUrlDark || "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  
  // Hero tab states
  const [heroTitle, setHeroTitle] = useState(initialData?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(initialData?.heroSubtitle || "");
  const [heroImage, setHeroImage] = useState(initialData?.heroImage || "");
  const [footerText, setFooterText] = useState(initialData?.footerText || "");

  const [featuresJson, setFeaturesJson] = useState(initialData?.features ? JSON.stringify(initialData.features, null, 2) : "[\n]");
  const [pricingJson, setPricingJson] = useState(initialData?.pricing ? JSON.stringify(initialData.pricing, null, 2) : "[\n]");
  const [faqJson, setFaqJson] = useState(initialData?.faq ? JSON.stringify(initialData.faq, null, 2) : "[\n]");
  const [testimonialsJson, setTestimonialsJson] = useState(initialData?.testimonials ? JSON.stringify(initialData.testimonials, null, 2) : "[\n]");
  const [howItWorksJson, setHowItWorksJson] = useState(initialData?.howItWorks ? JSON.stringify(initialData.howItWorks, null, 2) : "[\n]");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDark: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "landing"); // Folder khusus untuk landing page assets
    
    // Pass oldUrl to delete the old file
    if (isDark && logoUrlDark) formData.append("oldUrl", logoUrlDark);
    if (!isDark && logoUrl) formData.append("oldUrl", logoUrl);

    isDark ? setUploadingLogoDark(true) : setUploadingLogo(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.url) {
        if (isDark) {
          setLogoUrlDark(data.url);
        } else {
          setLogoUrl(data.url);
        }
        toast.success("Gambar berhasil diunggah ke S3!");
      } else {
        toast.error(data.error || "Gagal mengunggah gambar");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengunggah gambar");
    } finally {
      isDark ? setUploadingLogoDark(false) : setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Ensure all fields from state are appended since TabsContent might unmount them
      formData.set("logoUrl", logoUrl);
      formData.set("logoUrlDark", logoUrlDark);
      formData.set("heroTitle", heroTitle);
      formData.set("heroSubtitle", heroSubtitle);
      formData.set("heroImage", heroImage);
      formData.set("footerText", footerText);
      
      // Validate JSONs before submitting
      const jsons = [
        { key: "features", val: featuresJson },
        { key: "pricing", val: pricingJson },
        { key: "faq", val: faqJson },
        { key: "testimonials", val: testimonialsJson },
        { key: "howItWorks", val: howItWorksJson }
      ];

      for (const { key, val } of jsons) {
        if (val.trim()) {
          try {
            JSON.parse(val);
            formData.set(key, val);
          } catch (err) {
             toast.error(`Format JSON tidak valid di bagian ${key}`);
             setIsPending(false);
             return;
          }
        }
      }

      const res = await updateSiteSettings(formData);
      if (res.success) {
        toast.success("Pengaturan berhasil disimpan!");
      } else {
        toast.error("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Landing Page</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Ubah teks dan konten pada halaman depan (Landing Page).</p>
        </div>
        <button 
          type="submit" 
          disabled={isPending}
          className="flex items-center justify-center gap-2 bg-[#6419c1] text-white px-6 py-2.5 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </button>
      </div>

      <Tabs defaultValue="hero" className="w-full bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-4 md:p-8">
        <TabsList className="mb-8 flex flex-wrap justify-start md:justify-center w-full gap-2 h-auto bg-slate-100 dark:bg-black/20 p-1.5 rounded-xl">
          <TabsTrigger value="hero" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#6419c1] data-[state=active]:text-[#6419c1] dark:data-[state=active]:text-white transition-all shadow-none data-[state=active]:shadow-sm text-xs font-semibold">Hero & Footer</TabsTrigger>
          <TabsTrigger value="paket" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#6419c1] data-[state=active]:text-[#6419c1] dark:data-[state=active]:text-white transition-all shadow-none data-[state=active]:shadow-sm text-xs font-semibold">Paket (Pricing)</TabsTrigger>
          <TabsTrigger value="fitur" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#6419c1] data-[state=active]:text-[#6419c1] dark:data-[state=active]:text-white transition-all shadow-none data-[state=active]:shadow-sm text-xs font-semibold">Fitur</TabsTrigger>
          <TabsTrigger value="faq" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#6419c1] data-[state=active]:text-[#6419c1] dark:data-[state=active]:text-white transition-all shadow-none data-[state=active]:shadow-sm text-xs font-semibold">FAQ</TabsTrigger>
          <TabsTrigger value="testimoni" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#6419c1] data-[state=active]:text-[#6419c1] dark:data-[state=active]:text-white transition-all shadow-none data-[state=active]:shadow-sm text-xs font-semibold">Testimoni</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-slate-900 dark:text-white font-semibold">Logo Mode Terang (Opsional)</Label>
              <input type="hidden" name="logoUrl" value={logoUrl} />
              <div className="flex flex-col items-start gap-4">
                {logoUrl ? (
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white p-4 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo Terang" className="object-contain" />
                  </div>
                ) : (
                  <div className="px-6 py-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex items-center justify-center text-xs text-slate-400">
                    Kosong
                  </div>
                )}
                <div className="relative">
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <Button type="button" variant="outline" disabled={uploadingLogo}>
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {uploadingLogo ? "Mengunggah..." : "Ganti Logo"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrlDark" className="text-slate-900 dark:text-white font-semibold">Logo Mode Gelap (Opsional)</Label>
              <input type="hidden" name="logoUrlDark" value={logoUrlDark} />
              <div className="flex flex-col items-start gap-4">
                {logoUrlDark ? (
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-black p-4 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrlDark} alt="Logo Gelap" className="object-contain" />
                  </div>
                ) : (
                  <div className="px-6 py-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex items-center justify-center text-xs text-slate-400">
                    Kosong
                  </div>
                )}
                <div className="relative">
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, true)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <Button type="button" variant="outline" disabled={uploadingLogoDark}>
                    {uploadingLogoDark ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {uploadingLogoDark ? "Mengunggah..." : "Ganti Logo"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroTitle" className="text-slate-900 dark:text-white font-semibold">Judul Hero</Label>
            <input id="heroTitle" name="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Transformasi Digital Manajemen Warga..." className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle" className="text-slate-900 dark:text-white font-semibold">Sub Judul Hero</Label>
            <textarea id="heroSubtitle" name="heroSubtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Fasilitasi komunikasi..." className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroImage" className="text-slate-900 dark:text-white font-semibold">URL Gambar Dashboard (Opsional)</Label>
            <input id="heroImage" name="heroImage" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
            <Label htmlFor="footerText" className="text-slate-900 dark:text-white font-semibold">Teks Footer</Label>
            <input id="footerText" name="footerText" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="© 2026 Tata Warga." className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" />
          </div>
        </TabsContent>

        <TabsContent value="paket" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-slate-500 dark:text-white/50 mb-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">
            Cukup masukkan link produk sebagai array untuk menampilkan produk dari database (misal: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">["/product/premium", "/product/platinum"]</code>). 
            Jika dibiarkan kosong <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">[]</code>, semua produk aktif akan ditampilkan otomatis.
          </p>
          <textarea 
            value={pricingJson} 
            onChange={(e) => setPricingJson(e.target.value)} 
            className="w-full font-mono h-96 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" 
            placeholder='[
  "/product/starter",
  "/product/pro",
  "/product/premium"
]'
          />
        </TabsContent>

        <TabsContent value="fitur" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-slate-500 dark:text-white/50 mb-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">Edit menu fitur navigasi atau fitur unggulan dalam format JSON.</p>
          <textarea 
            value={featuresJson} 
            onChange={(e) => setFeaturesJson(e.target.value)} 
            className="w-full font-mono h-96 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white" 
            placeholder='[
  {
    "title": "Keamanan Data Tinggi",
    "description": "Data warga dan laporan keuangan RT disimpan di server terenkripsi.",
    "icon": "shield",
    "color": "text-blue-500",
    "bg": "bg-blue-500/10"
  }
]'
          />
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-slate-500 dark:text-white/50 mb-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">Edit Pertanyaan Umum (FAQ) dalam format JSON.</p>
          <textarea 
            value={faqJson} 
            onChange={(e) => setFaqJson(e.target.value)} 
            className="w-full font-mono h-96 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" 
            placeholder='[ { "question": "Tanya", "answer": "Jawab" } ]'
          />
        </TabsContent>

        <TabsContent value="testimoni" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-slate-500 dark:text-white/50 mb-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">Edit Testimonial warga dalam format JSON.</p>
          <textarea 
            value={testimonialsJson} 
            onChange={(e) => setTestimonialsJson(e.target.value)} 
            className="w-full font-mono h-96 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white" 
            placeholder='[ { "quote": "Sangat bagus", "name": "Budi", "role": "RT 04", "avatar": "url" } ]'
          />
        </TabsContent>
      </Tabs>
    </form>
  );
}
