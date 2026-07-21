"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { updateUserAvatar } from "@/app/actions/user";

export function AvatarUpload({ currentImage }: { currentImage?: string | null }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "avatar");
      if (currentImage) uploadData.append("oldUrl", currentImage);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await uploadRes.json();

      if (data.success && data.url) {
        const formData = new FormData();
        formData.append("imageUrl", data.url);
        
        const res = await updateUserAvatar(formData);
        if (res.success) {
          toast.success("Foto profil berhasil diperbarui!");
          window.location.reload();
        } else {
          toast.error(res.error || "Gagal menyimpan foto profil.");
        }
      } else {
        toast.error(data.error || "Gagal mengunggah foto.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengunggah.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Profil Pengguna</h3>
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full border-2 border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
          {currentImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={currentImage} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-slate-400">?</span>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Foto Profil (Avatar)</p>
          <p className="text-xs text-muted-foreground mb-2">Upload foto terbaik Anda (Maks 2MB, JPG/PNG).</p>
          <div className="relative inline-block">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <Button type="button" variant="outline" disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {isUploading ? "Mengunggah..." : "Pilih Foto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
