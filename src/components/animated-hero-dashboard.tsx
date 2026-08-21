"use client";

import { motion } from "framer-motion";
import { Users, FileText, Bot, Wallet, Activity, Database, Bell, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedHeroDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="aspect-[9/19] w-full bg-muted/20 rounded-xl" />;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-primary/5 p-4 overflow-hidden">
      <motion.div 
        className="relative w-[280px] h-[580px] bg-gray-50 dark:bg-[#0c0b21] rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 dark:border-black overflow-hidden flex flex-col shrink-0"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Status Bar */}
        <div className="h-6 w-full bg-transparent flex justify-between items-center px-5 text-[10px] text-slate-800 dark:text-slate-300 font-medium absolute top-0 z-20">
          <span>09:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-300"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden pt-8 px-4 pb-4 flex flex-col gap-4 relative z-10">
          
          <motion.div variants={itemVariants}>
            <p className="text-[10px] text-slate-500 font-light">Senin, 10 Agustus 2026</p>
            <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
              Selamat Datang, <br/><span className="text-[#6419c1] dark:text-[#a064fa]">Ketua RT 01/05</span>
            </h1>
          </motion.div>

          {/* Warga Card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#6419c1] to-[#a064fa] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <p className="text-white/80 text-[10px] font-medium mb-1">Data Penduduk</p>
            <h2 className="text-2xl font-extrabold mb-1">142 <span className="text-xs font-normal">Jiwa</span></h2>
            <div className="inline-flex items-center bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
              <Users className="w-2.5 h-2.5 mr-1" /> 45 Kepala Keluarga
            </div>
          </motion.div>

          {/* Kas Card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#141229] to-[#2a264a] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
             <div className="absolute right-0 top-0 w-16 h-16 bg-[#6419c1]/30 rounded-full blur-xl"></div>
             <p className="text-white/70 text-[10px] font-medium mb-1">Total Saldo Kas RT</p>
             <h2 className="text-lg font-extrabold text-emerald-400">Rp 4.500.000</h2>
          </motion.div>

          {/* Menus */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-wider">Menu Utama</h3>
            <div className="grid grid-cols-4 gap-y-3 gap-x-1">
              {[
                { icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", label: "Warga" },
                { icon: FileText, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20", label: "Surat" },
                { icon: BarChart3, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20", label: "Statistik" },
                { icon: Wallet, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", label: "Kas RT" },
                { icon: Bot, color: "text-[#6419c1]", bg: "bg-purple-100 dark:bg-purple-500/20", label: "Chat AI" },
                { icon: Database, color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-500/20", label: "Notulen" },
                { icon: Bell, color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-500/20", label: "Info" },
                { icon: Activity, color: "text-slate-500", bg: "bg-slate-200 dark:bg-slate-700/50", label: "Log" },
              ].map((menu, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${menu.bg} ${menu.color}`}>
                    <menu.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">{menu.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
