"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccountSettings } from "@/app/actions/account";
import { toast } from "sonner";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

export function AccountForm({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);

    if (password && password.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      setIsPending(false);
      return;
    }

    const res = await updateAccountSettings(formData);

    if (res.success) {
      toast.success("Profil akun berhasil diperbarui!");
      setPassword(""); // clear password field
    } else {
      toast.error(res.error || "Terjadi kesalahan.");
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-card p-4 md:p-6 rounded-lg border space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Pengaturan Akun Anda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Budi Santoso" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email <span className="text-red-500">*</span></Label>
            <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rt@domain.com" required />
            <p className="text-[11px] text-muted-foreground">Digunakan untuk login.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp <span className="text-red-500">*</span></Label>
            <Input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Misal: 081234567890" required />
            <p className="text-[11px] text-muted-foreground">Digunakan untuk notifikasi sistem & bot WA.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Ubah Password <span className="text-muted-foreground text-[10px] font-normal">(Opsional)</span></Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Biarkan kosong jika tidak ingin diubah" 
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 flex items-center justify-center"
                title={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Minimal 8 karakter.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="bg-[#6519c2] hover:bg-[#6519c2]/90 text-[#fad700] min-w-[150px] w-full md:w-auto">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Profil
        </Button>
      </div>
    </form>
  );
}
