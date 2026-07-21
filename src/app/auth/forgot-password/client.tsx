"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { requestPasswordReset, verifyOtp, resetPassword } from "@/app/actions/auth";

export function ForgotPasswordClient({ logoUrl }: { logoUrl?: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Mohon masukkan email atau nomor WhatsApp");
      return;
    }

    setIsPending(true);
    const res = await requestPasswordReset(identity);
    setIsPending(false);

    if (res.success) {
      setMaskedPhone(res.maskedPhone || "");
      toast.success("Kode OTP berhasil dikirim via WhatsApp!");
      setStep(2);
    } else {
      toast.error(res.error || "Gagal mengirim OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Mohon masukkan 6 digit OTP yang valid");
      return;
    }

    setIsPending(true);
    const res = await verifyOtp(identity, otp);
    setIsPending(false);

    if (res.success) {
      toast.success("OTP valid!");
      setStep(3);
    } else {
      toast.error(res.error || "OTP tidak valid");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Password tidak cocok atau kosong");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsPending(true);
    const res = await resetPassword(identity, otp, newPassword);
    setIsPending(false);

    if (res.success) {
      setStep(4);
    } else {
      toast.error(res.error || "Gagal mengubah password");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0c0b21]">
      {/* Animated Geometric Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-[#6419c1]/30 to-purple-600/10 rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -left-[20%] w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 rounded-full blur-[60px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] relative z-10 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Logo */}
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
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-2">Lupa Password?</h1>
                <p className="text-white/60 text-xs leading-relaxed px-2">
                  Masukkan email atau nomor WhatsApp yang terdaftar untuk menerima kode OTP.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5 group">
                  <Label htmlFor="identity" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Email / No WhatsApp</Label>
                  <div className="relative">
                    <Input 
                      id="identity" 
                      type="text" 
                      placeholder="contoh@email.com / 0812345678" 
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      required 
                      className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full h-11 bg-gradient-to-r from-[#6419c1] to-[#8a38f5] hover:from-[#5412a8] hover:to-[#7428d8] text-white rounded-xl shadow-[0_0_15px_rgba(100,25,193,0.3)] transition-all active:scale-[0.98] font-semibold text-sm mt-4"
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kirim OTP"}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-2">Masukkan OTP</h1>
                <p className="text-white/60 text-xs leading-relaxed px-2">
                  Kami telah mengirimkan 6-digit OTP melalui WhatsApp ke nomor <span className="font-semibold text-white">{maskedPhone}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5 group">
                  <Label htmlFor="otp" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Kode OTP (6 Digit)</Label>
                  <Input 
                    id="otp" 
                    type="text"
                    maxLength={6} 
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required 
                    className="w-full bg-white/5 border-white/10 text-white text-center tracking-[0.5em] text-lg placeholder:tracking-normal placeholder:text-white/30 h-12 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isPending || otp.length !== 6}
                  className="w-full h-11 bg-gradient-to-r from-[#6419c1] to-[#8a38f5] hover:from-[#5412a8] hover:to-[#7428d8] text-white rounded-xl shadow-[0_0_15px_rgba(100,25,193,0.3)] transition-all active:scale-[0.98] font-semibold text-sm mt-4"
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verifikasi"}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-2">Buat Password Baru</h1>
                <p className="text-white/60 text-xs leading-relaxed px-2">
                  Buat password baru yang kuat untuk mengamankan akun Anda.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5 group">
                  <Label htmlFor="newPassword" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Password Baru</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                      className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 pl-4 pr-10 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <Label htmlFor="confirmPassword" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 pl-4 pr-10 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full h-11 bg-gradient-to-r from-[#6419c1] to-[#8a38f5] hover:from-[#5412a8] hover:to-[#7428d8] text-white rounded-xl shadow-[0_0_15px_rgba(100,25,193,0.3)] transition-all active:scale-[0.98] font-semibold text-sm mt-4"
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Password Baru"}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Password Diperbarui!</h1>
              <p className="text-white/60 text-xs leading-relaxed px-2 mb-8">
                Password akun Anda berhasil diubah. Silakan login kembali dengan password baru Anda.
              </p>
              
              <Button 
                onClick={() => router.push("/auth/login")}
                className="w-full h-11 bg-white hover:bg-white/90 text-[#0c0b21] rounded-xl font-bold text-sm"
              >
                Kembali ke Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link href="/auth/login" className="inline-flex items-center text-xs text-white/60 hover:text-white transition-colors group">
              <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
