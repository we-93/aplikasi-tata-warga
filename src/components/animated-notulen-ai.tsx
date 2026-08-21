"use client";

import { motion } from "framer-motion";
import { Mic, FileText, Send, Database, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedNotulenAi() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="aspect-[9/19] w-full bg-muted/20 rounded-xl" />;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.3 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent p-4 overflow-hidden">
      <motion.div 
        className="relative w-[280px] h-[580px] bg-gray-50 dark:bg-[#0c0b21] rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 dark:border-black overflow-hidden flex flex-col shrink-0"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Status Bar */}
        <div className="h-6 w-full bg-cyan-600 dark:bg-cyan-900 flex justify-between items-center px-5 text-[10px] text-white font-medium z-20">
          <span>09:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Header App */}
        <div className="bg-cyan-600 dark:bg-cyan-900 px-4 pt-2 pb-4 text-white shadow-md z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Notulen AI</h2>
              <p className="text-[9px] text-cyan-100 flex items-center"><Sparkles className="w-2.5 h-2.5 mr-1"/> Otomatis merangkum rapat</p>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 relative z-20 bg-slate-50 dark:bg-slate-900">
          
          <motion.div variants={itemVariants} className="self-end max-w-[85%] bg-cyan-500 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm">
            <p className="text-[11px] leading-relaxed">
              Catatan kasar rapat: 1. Iuran keamanan naik jadi 50rb mulai bulan depan. 2. Kerja bakti diadakan tgl 15. 3. Ronda malam wajib bagi bapak2. Tolong buatkan notulennya.
            </p>
            <p className="text-[8px] text-cyan-100 text-right mt-1">10:00</p>
          </motion.div>

          <motion.div variants={itemVariants} className="self-start max-w-[85%] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold">AI sedang memproses...</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
              <div className="w-3/4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="self-start max-w-[85%] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-bold">Notulen Berhasil Dibuat!</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 flex items-center gap-2 border border-slate-100 dark:border-slate-700 mt-2">
              <div className="w-8 h-8 rounded bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold truncate">Notulen_Rapat_RT_01.pdf</p>
                <p className="text-[8px] text-slate-500">2 Halaman • 142 KB</p>
              </div>
            </div>

            <button className="w-full mt-2 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg text-[10px] font-bold border border-cyan-100 dark:border-cyan-800">
              Buka Dokumen
            </button>
            <p className="text-[8px] text-slate-400 text-right mt-1">10:01</p>
          </motion.div>

        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 p-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div className="flex-1 h-9 rounded-full bg-slate-100 dark:bg-slate-700 px-3 flex items-center">
            <span className="text-[10px] text-slate-400">Ketik poin rapat...</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

      </motion.div>
    </div>
  );
}
