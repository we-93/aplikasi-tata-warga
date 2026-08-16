"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKeluargaByNoKk } from "@/app/actions/warga";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { WargaKkForm } from "./warga-kk-form";

export function WargaKkCheck() {
  const router = useRouter();
  const [noKk, setNoKk] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [kkStatus, setKkStatus] = useState<"IDLE" | "FOUND" | "NOT_FOUND">("IDLE");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noKk || noKk.length < 16) {
      toast.error("Nomor KK harus 16 digit.");
      return;
    }

    setIsChecking(true);
    const res = await getKeluargaByNoKk(noKk);
    
    if (res.success) {
      if (res.data && res.data.length > 0) {
        setKkStatus("FOUND");
        setFamilyMembers(res.data);
        toast.success("Kartu Keluarga ditemukan!");
        // Auto redirect after short delay
        setTimeout(() => {
          router.push(`/dashboard/rt/warga/kk/${noKk}`);
        }, 1500);
      } else {
        setKkStatus("NOT_FOUND");
        toast.info("No KK belum terdaftar. Silakan lengkapi data anggota keluarga.");
      }
    } else {
      toast.error(res.error || "Gagal mengecek No KK.");
    }
    setIsChecking(false);
  };

  if (kkStatus === "NOT_FOUND") {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-400">Pendaftaran Keluarga Baru</h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
              No KK <strong>{noKk}</strong> belum terdaftar. Silakan masukkan data seluruh anggota keluarga di bawah ini.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setKkStatus("IDLE")} className="shrink-0">
            Ganti No KK
          </Button>
        </div>
        
        <WargaKkForm noKk={noKk} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-card border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="bg-[#6419c1]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-[#6419c1] w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold">Cek Nomor Kartu Keluarga</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Masukkan 16 digit No KK untuk menambahkan data keluarga baru atau anggota keluarga ke KK yang sudah ada.
          </p>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noKk">Nomor KK <span className="text-red-500">*</span></Label>
            <Input 
              id="noKk" 
              value={noKk} 
              onChange={(e) => setNoKk(e.target.value.replace(/[^0-9]/g, '').slice(0, 16))} 
              placeholder="Contoh: 3171234567890123" 
              maxLength={16}
              className="text-center text-lg tracking-widest font-medium h-12"
              autoFocus
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-[#6419c1] hover:bg-[#6419c1]/90 text-white" 
            disabled={noKk.length < 16 || isChecking || kkStatus === "FOUND"}
          >
            {isChecking ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memeriksa Data...</>
            ) : kkStatus === "FOUND" ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mengalihkan ke Detail KK...</>
            ) : (
              "Cek Nomor KK"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
