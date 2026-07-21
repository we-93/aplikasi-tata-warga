"use client";

import { motion } from "framer-motion";
import { Bot, FileText, Mic, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedNotulenAi() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0); // 0: input, 1: generating, 2: done

  useEffect(() => {
    setMounted(true);
    
    // Auto-play animation sequence
    const interval = setInterval(() => {
      setStep(s => {
        if (s === 0) return 1;
        if (s === 1) return 2;
        return 0; // loop back to 0 after 2
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="aspect-[4/3] w-full bg-muted/20 rounded-xl" />;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50, rotateX: 5, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="relative w-full aspect-[4/3] bg-[#f5f5f5] dark:bg-[#0c0b21] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col p-3 md:p-5"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-white leading-tight">AI Asisten Notulen</h2>
          <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-white/50">Merangkum hasil musyawarah otomatis</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 overflow-hidden">
        {/* Left Side: Raw Input */}
        <div className="flex-1 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 md:p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-white/80">Input Mentah</span>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 flex-1 border border-slate-100 dark:border-white/5 relative">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-[10px] md:text-xs text-slate-600 dark:text-white/70 leading-relaxed font-mono"
            >
              "Tadi malam rapat bahas keamanan blok C. Pak RT bilang mulai minggu depan ronda digilir tiap malam minggu. Trus dana kas RT sisa 2 juta, rencananya mau dipake beli lampu jalan 4 biji. Pak Budi usul sekalian perbaiki portal depan, disetujui sama warga."
            </motion.p>
            
            {/* Animated Scanning Effect during step 1 */}
            {step === 1 && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-8 bg-gradient-to-b from-transparent via-orange-500/20 to-transparent border-b border-orange-500/50"
              />
            )}
          </div>
          
          <div className="mt-3">
             <motion.button 
               className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-white transition-colors ${step === 1 ? 'bg-orange-400' : 'bg-orange-500'}`}
             >
               {step === 0 && <><Wand2 className="w-3.5 h-3.5" /> Susun Notulen</>}
               {step === 1 && <><Sparkles className="w-3.5 h-3.5 animate-spin" /> AI Sedang Memproses...</>}
               {step === 2 && <><Wand2 className="w-3.5 h-3.5" /> Susun Ulang</>}
             </motion.button>
          </div>
        </div>

        {/* Right Side: AI Output (Structured PDF) */}
        <div className="flex-1 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 md:p-4 shadow-sm flex flex-col relative">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-white/80">Hasil Akhir (PDF)</span>
          </div>

          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 overflow-hidden shadow-inner flex flex-col">
            {step === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <FileText className="w-12 h-12 text-slate-300 mb-2" />
                <span className="text-[10px] text-slate-400 text-center">Menunggu proses AI...</span>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col h-full"
              >
                <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                  <h3 className="font-bold text-[10px] md:text-xs text-slate-800 dark:text-white">NOTULEN RAPAT RT</h3>
                  <p className="text-[8px] md:text-[9px] text-slate-500">Tanggal: 12 Juli 2026</p>
                </div>
                
                <div className="space-y-3 flex-1">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: step === 2 ? 1 : 0 }} transition={{ delay: 0.5 }}>
                    <h4 className="font-semibold text-[9px] md:text-[10px] text-slate-700 dark:text-white/90">A. Keputusan Keamanan</h4>
                    <ul className="list-disc pl-4 text-[8px] md:text-[9px] text-slate-600 dark:text-white/70 mt-0.5">
                      <li>Ronda malam digilir setiap Malam Minggu.</li>
                    </ul>
                  </motion.div>
                  
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: step === 2 ? 1 : 0 }} transition={{ delay: 1.2 }}>
                    <h4 className="font-semibold text-[9px] md:text-[10px] text-slate-700 dark:text-white/90">B. Laporan Keuangan</h4>
                    <ul className="list-disc pl-4 text-[8px] md:text-[9px] text-slate-600 dark:text-white/70 mt-0.5">
                      <li>Sisa dana Kas RT: Rp 2.000.000.</li>
                    </ul>
                  </motion.div>
                  
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: step === 2 ? 1 : 0 }} transition={{ delay: 1.8 }}>
                    <h4 className="font-semibold text-[9px] md:text-[10px] text-slate-700 dark:text-white/90">C. Tindak Lanjut</h4>
                    <ul className="list-disc pl-4 text-[8px] md:text-[9px] text-slate-600 dark:text-white/70 mt-0.5">
                      <li>Pembelian 4 lampu jalan.</li>
                      <li>Perbaikan portal depan (usulan Bp. Budi).</li>
                    </ul>
                  </motion.div>
                </div>
                
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-auto">
                    <button className="w-full py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded text-[10px] font-semibold flex items-center justify-center gap-1">
                      <FileText className="w-3 h-3" /> Unduh PDF
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </motion.div>
  );
}
