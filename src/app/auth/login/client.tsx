"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Animated Components from Landing Page
import { AnimatedHeroDashboard } from "@/components/animated-hero-dashboard";
import { AnimatedDataWarga } from "@/components/animated-data-warga";
import { AnimatedKasRt } from "@/components/animated-kas-rt";
import { AnimatedNotulenAi } from "@/components/animated-notulen-ai";
const ANIMATIONS = [
  { component: AnimatedHeroDashboard, title: "Dashboard Pintar", desc: "Pantau semua aktivitas RT dalam satu layar" },
  { component: AnimatedDataWarga, title: "Data Warga Digital", desc: "Kelola data kependudukan secara modern" },
  { component: AnimatedKasRt, title: "Transparansi Keuangan", desc: "Laporan kas RT yang transparan & otomatis" },
  { component: AnimatedNotulenAi, title: "Notulen Rapat AI", desc: "Buat notulen otomatis menggunakan kecerdasan buatan" },
];

export function LoginClient({ logoUrl }: { logoUrl?: string | null }) {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % ANIMATIONS.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Email atau password salah.");
      setIsPending(false);
    } else {
      toast.success("Login berhasil!");
      router.push("/dashboard/rt");
      router.refresh();
    }
  };

  const CurrentAnimation = ANIMATIONS[activeSlide].component;

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#0c0b21] overflow-hidden">
      
      {/* Left Screen (60%) - Carousel */}
      <div className="hidden lg:flex w-[60%] h-full bg-[#0c0b21] flex-col items-center justify-center p-8 relative">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6419c1]/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-2xl flex flex-col items-center justify-center h-full">
          {/* Ubah rasio ketinggian agar seimbang dengan teks */}
          <div className="h-[65%] w-full flex items-center justify-center mb-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center origin-center"
              >
                <div className="w-[85%] origin-center scale-[0.85]">
                  <CurrentAnimation />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Text & Indicators */}
          <div className="text-center space-y-4 h-[20%] flex flex-col justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white">{ANIMATIONS[activeSlide].title}</h2>
                <p className="text-white/60 mt-2">{ANIMATIONS[activeSlide].desc}</p>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-2 pt-4">
              {ANIMATIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeSlide ? 'bg-[#6419c1] w-6' : 'bg-white/20 hover:bg-white/40'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Screen (40%) - Login Form */}
      <div className="w-full lg:w-[40%] h-full relative flex items-center justify-center p-4 overflow-hidden bg-[#0c0b21]">
        {/* Animated Geometric Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Elemen geometrik di belakang */}
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-[#6419c1]/30 to-purple-600/10 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -left-[20%] w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 rounded-full blur-[60px]"
          />
          <motion.div 
            animate={{ 
              y: [0, -50, 0],
              x: [0, 30, 0],
              rotate: 45
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[0%] right-[10%] w-[300px] h-[300px] border-[2px] border-indigo-500/20 rounded-3xl blur-[2px]"
          />
        </div>

        {/* Glassmorphism Card (Sesuai Mockup) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[380px] relative z-10 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            {logoUrl ? (
              <div className="mb-4 h-8 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Tata Warga" className="h-full object-contain drop-shadow-md" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#6419c1] to-[#8a38f5] rounded-xl flex items-center justify-center shadow-lg shadow-[#6419c1]/30 mb-4">
                <span className="text-white font-bold text-xl">TW</span>
              </div>
            )}
            <h1 className="text-xl font-bold text-white mb-2">Selamat Datang</h1>
            <p className="text-white/60 text-xs leading-relaxed px-2">
              Masuk ke akun Tata Warga untuk mengelola data warga Anda
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 group">
              <Label htmlFor="email" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Alamat Email</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="admin@tatawarga.com" 
                  required 
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 group">
              <Label htmlFor="password" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 pl-4 pr-10 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1 z-10 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    rememberMe 
                      ? 'bg-[#6419c1] border-[#6419c1]' 
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  {rememberMe && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </button>
                <Label className="text-sm text-white/70 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                  Ingat password
                </Label>
              </div>
              <Link href="/auth/forgot-password" className="text-xs text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white">
                Lupa Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-11 bg-gradient-to-r from-[#6419c1] to-[#8a38f5] hover:from-[#5412a8] hover:to-[#7428d8] text-white rounded-xl shadow-[0_0_15px_rgba(100,25,193,0.3)] transition-all active:scale-[0.98] font-semibold text-sm mt-2"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/60">
              Belum punya akun?{" "}
              <Link href="/auth/register" className="text-white font-semibold hover:text-white/80 underline underline-offset-4 decoration-white/30 transition-all">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
