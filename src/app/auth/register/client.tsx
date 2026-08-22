"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck, FileText, Bot, Users } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

export function RegisterClient({ logoUrl }: { logoUrl?: string | null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    setIsPending(true);
    try {
      // In a real scenario, this should hit an API to register the user
      // For now we simulate an error if the API is not yet built, or success if there's a simple register endpoint
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Pendaftaran berhasil!");
        
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        router.push(`/dashboard/rt`);
      } else {
        toast.error(data.error || "Terjadi kesalahan saat pendaftaran");
        setIsPending(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pendaftaran");
      setIsPending(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden w-full flex flex-col lg:flex-row bg-[#0c0b21]">
      
      {/* Left Screen (50%) - Info */}
      <div className="hidden lg:flex w-[50%] h-full bg-[#0c0b21] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6419c1]/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Mulai Perjalanan Digital RT Anda</h2>
            <p className="text-white/60">Kelola warga, surat, dan keuangan dengan mudah. Mulai tanpa batasan warga dan dapatkan akses penuh fitur AI.</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              
              <h3 className="text-2xl font-bold text-white mb-2">Akses Penuh</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-white">Gratis</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#6419c1]/20 flex items-center justify-center shrink-0">
                    <FileText className="w-3 h-3 text-[#b47af5]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 text-sm">Kuota Surat: Unlimited</h4>
                    <p className="text-xs text-white/50">Pembuatan surat otomatis</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#6419c1]/20 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-[#b47af5]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 text-sm">Kredit AI: 30 / Bulan</h4>
                    <p className="text-xs text-white/50">Token untuk fitur AI & Chatbot</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#6419c1]/20 flex items-center justify-center shrink-0">
                    <Users className="w-3 h-3 text-[#b47af5]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 text-sm">Maksimal Warga: Unlimited</h4>
                    <p className="text-xs text-white/50">Warga yang dapat dikelola</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Keamanan data setara bank terjamin.</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Screen (50%) - Register Form */}
      <div className="w-full lg:w-[50%] h-full relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-slate-50">
        {/* Animated Geometric Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-[#6419c1]/10 to-purple-600/5 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -left-[20%] w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/10 to-cyan-500/5 rounded-full blur-[60px]"
          />
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[500px] relative z-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col my-8 h-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 h-16 w-16 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon-tata-warga.png" alt="Tata Warga" className="h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Buat Akun RT</h1>
            <p className="text-slate-500 text-xs leading-relaxed px-2">
              Lengkapi data di bawah ini untuk memulai digitalisasi RT Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5 group">
              <Label htmlFor="name" className="text-slate-700 transition-colors text-xs">Nama Lengkap</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Budi Santoso" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 group">
                <Label htmlFor="email" className="text-slate-700 transition-colors text-xs">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="rt@tatawarga.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5 group">
                <Label htmlFor="phone" className="text-slate-700 transition-colors text-xs">Nomor WA</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="08123456789" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 group">
              <Label htmlFor="password" className="text-slate-700 transition-colors text-xs">Password Baru</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-10 pl-4 pr-10 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-4 mb-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#6419c1] rounded border-slate-300 focus:ring-[#6419c1]"
              />
              <Label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                Saya telah membaca dan menyetujui <Link href="/privacy" className="text-[#6419c1] hover:underline">Kebijakan Privasi</Link> serta Ketentuan Layanan Tata Warga.
              </Label>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || !agreed}
              className="w-full h-11 bg-gradient-to-r from-[#6419c1] to-[#8a38f5] hover:from-[#5412a8] hover:to-[#7428d8] text-white rounded-xl shadow-[0_0_15px_rgba(100,25,193,0.3)] transition-all active:scale-[0.98] font-semibold text-sm mt-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Daftar Sekarang"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-[#6419c1] font-semibold hover:text-[#5412a8] underline underline-offset-4 decoration-[#6419c1]/30 hover:decoration-[#6419c1] transition-all">
                Masuk di sini
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
