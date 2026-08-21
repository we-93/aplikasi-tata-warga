"use client";

import { motion } from "framer-motion";
import { FileText, Plus, CheckCircle2, Clock, FileSignature } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedSurat() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="aspect-[9/19] w-full bg-muted/20 rounded-xl" />;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
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
        <div className="h-6 w-full bg-yellow-500 dark:bg-yellow-600 flex justify-between items-center px-5 text-[10px] text-white font-medium z-20">
          <span>09:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Header App */}
        <div className="bg-yellow-500 dark:bg-yellow-600 px-4 pt-2 pb-6 text-white rounded-b-3xl shadow-sm z-10 relative">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileSignature className="w-4 h-4" /> Pelayanan Surat
            </h2>
          </div>
          <p className="text-[10px] text-yellow-50 mt-1">Kelola dan setujui surat warga</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 -mt-4 flex flex-col gap-3 relative z-20">
          
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-md border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Menunggu TTD
              </div>
              <span className="text-[8px] text-slate-400">10 Menit lalu</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Surat Pengantar Domisili</h3>
            <p className="text-[10px] text-slate-500 mt-1 mb-3">Pemohon: Budi Santoso</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-bold">Cek Detail</button>
              <button className="py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-bold flex items-center justify-center gap-1">
                <FileSignature className="w-3 h-3" /> TTD Digital
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden opacity-75">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Selesai
              </div>
              <span className="text-[8px] text-slate-400">Kemarin</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Surat Keterangan Usaha</h3>
            <p className="text-[10px] text-slate-500 mt-1 mb-2">Pemohon: Siti Aminah</p>
            <div className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Telah ditandatangani
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden opacity-75">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Selesai
              </div>
              <span className="text-[8px] text-slate-400">2 Hari lalu</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Surat Pengantar Nikah</h3>
            <p className="text-[10px] text-slate-500 mt-1">Pemohon: Ahmad Fauzi</p>
          </motion.div>
        </div>

        {/* Floating Action Button */}
        <motion.div variants={itemVariants} className="absolute bottom-4 right-4 z-30">
          <button className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg">
            <Plus className="w-6 h-6" />
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
