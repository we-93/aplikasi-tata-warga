"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ForgotPasswordClient({ logoUrl }: { logoUrl?: string | null }) {
  const router = useRouter();

  const handleContactAdmin = () => {
    window.open("https://api.whatsapp.com/send?phone=6281934197955&text=Halo%20Admin%20Tata%20Warga%2C%20mohon%20dibantu%20untuk%20reset%20password", "_blank");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-50">
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

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] relative z-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col"
      >
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4 h-16 w-16 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon-tata-warga.png" alt="Tata Warga" className="h-full object-contain" />
          </div>
        </div>

        <motion.div
          key="step1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex flex-col"
        >
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Lupa Password?</h1>
            <p className="text-slate-500 text-sm leading-relaxed px-2">
              Silakan hubungi Admin melalui WhatsApp untuk mereset password akun Anda.
            </p>
          </div>

          <Button 
            type="button" 
            onClick={handleContactAdmin}
            className="w-full h-11 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] font-bold text-sm"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Hubungi Admin via WhatsApp
          </Button>
        </motion.div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/auth/login" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors text-xs font-medium px-4 py-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Kembali ke Halaman Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
