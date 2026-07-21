"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck, FileText, Bot, Users, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { registerAndCheckout } from "@/app/actions/billing";
import { signIn } from "next-auth/react";
import { QrCode, Building2 } from "lucide-react";

export function RegisterClient({ logoUrl, products }: { logoUrl?: string | null, products: any[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [selectedProductId, setSelectedProductId] = useState<string>(products.length > 0 ? products[0].id : "");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !selectedProductId) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    setIsPending(true);
    try {
      const res = await registerAndCheckout({
        ...formData,
        productId: selectedProductId,
        paymentMethod
      });

      if (res.success) {
        toast.success("Pendaftaran berhasil!");
        
        // Auto Login quietly
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        router.push(`/checkout/success/${res.invoiceId}`);
      } else {
        toast.error(res.error || "Terjadi kesalahan saat pendaftaran");
        setIsPending(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pendaftaran");
      setIsPending(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden w-full flex flex-col lg:flex-row bg-[#0c0b21]">
      
      {/* Left Screen (50%) - Pricing Info */}
      <div className="hidden lg:flex w-[50%] h-full bg-[#0c0b21] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6419c1]/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Mulai Perjalanan Digital RT Anda</h2>
            <p className="text-white/60">Pilih paket yang sesuai dengan kebutuhan warga. Upgrade atau batalkan kapan saja.</p>
          </div>

          <AnimatePresence mode="wait">
            {selectedProduct && (
              <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                {selectedProduct.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#6419c1] to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                    Paling Diminati
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-white">{formatRp(selectedProduct.hargaPendaftaran)}</span>
                  <span className="text-white/50 text-sm">/ {selectedProduct.interval || 'bulan'}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-[#6419c1]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-3 h-3 text-[#b47af5]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90 text-sm">Kuota Surat: {selectedProduct.maxSurat === -1 ? 'Unlimited' : selectedProduct.maxSurat}</h4>
                      <p className="text-xs text-white/50">Pembuatan surat otomatis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-[#6419c1]/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-[#b47af5]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90 text-sm">Kuota AI: {selectedProduct.maxAiToken === -1 ? 'Unlimited' : (selectedProduct.maxAiToken >= 1000 ? (selectedProduct.maxAiToken/1000) + 'k' : selectedProduct.maxAiToken)}</h4>
                      <p className="text-xs text-white/50">Token untuk fitur AI & Bot WA</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-[#6419c1]/20 flex items-center justify-center shrink-0">
                      <Users className="w-3 h-3 text-[#b47af5]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90 text-sm">Maksimal Warga: {selectedProduct.maxWarga === 0 ? "Unlimited" : selectedProduct.maxWarga}</h4>
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
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Screen (50%) - Register Form */}
      <div className="w-full lg:w-[50%] h-full relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#0c0b21]">
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

        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[500px] relative z-10 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col my-8 h-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            {logoUrl ? (
              <div className="mb-4 h-8 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Tata Warga" className="h-full object-contain drop-shadow-md" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-[#6419c1] to-[#8a38f5] rounded-xl flex items-center justify-center shadow-lg shadow-[#6419c1]/30 mb-4">
                <span className="text-white font-bold text-lg">TW</span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-2">Buat Akun RT</h1>
            <p className="text-white/60 text-xs leading-relaxed px-2">
              Lengkapi data di bawah ini untuk memulai digitalisasi RT Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 group">
              <Label htmlFor="paket" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Pilih Paket</Label>
              <div className="relative">
                <select
                  id="paket"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm appearance-none outline-none"
                  required
                >
                  <option value="" disabled className="bg-slate-900 text-white">Pilih Paket Langganan...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} - {formatRp(p.hargaPendaftaran)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 group">
              <Label htmlFor="name" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Nama Lengkap</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Budi Santoso" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 group">
                <Label htmlFor="email" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="rt@tatawarga.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5 group">
                <Label htmlFor="phone" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Nomor WA</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="08123456789" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 px-4 rounded-xl focus:border-[#6419c1] focus:ring-1 focus:ring-[#6419c1] transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 group">
              <Label htmlFor="password" className="text-white/80 group-focus-within:text-white transition-colors text-xs">Password Baru</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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

            <div className="pt-2">
              <Label className="text-white/80 transition-colors text-xs mb-2 block">Pilih Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    paymentMethod === "qris" 
                      ? "border-[#6419c1] bg-[#6419c1]/20 text-white shadow-[0_0_15px_rgba(100,25,193,0.3)]" 
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <QrCode className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-[10px]">QRIS</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    paymentMethod === "transfer" 
                      ? "border-[#6419c1] bg-[#6419c1]/20 text-white shadow-[0_0_15px_rgba(100,25,193,0.3)]" 
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <Building2 className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-[10px]">Transfer Bank</span>
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-11 bg-gradient-to-r from-[#6419c1] to-[#8a38f5] hover:from-[#5412a8] hover:to-[#7428d8] text-white rounded-xl shadow-[0_0_15px_rgba(100,25,193,0.3)] transition-all active:scale-[0.98] font-semibold text-sm mt-4"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Daftar Sekarang"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/60">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-white font-semibold hover:text-white/80 underline underline-offset-4 decoration-white/30 transition-all">
                Masuk di sini
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
