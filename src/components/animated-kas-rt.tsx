"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowDownCircle, ArrowUpCircle, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedKasRt() {
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
    <div className="w-full h-full flex items-center justify-center bg-transparent p-4 overflow-hidden">
      <motion.div 
        className="relative w-[280px] h-[580px] bg-gray-50 dark:bg-[#0c0b21] rounded-[2.5rem] shadow-2xl border-[10px] border-slate-900 dark:border-black overflow-hidden flex flex-col shrink-0"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Status Bar */}
        <div className="h-6 w-full bg-[#141229] dark:bg-[#0c0b21] flex justify-between items-center px-5 text-[10px] text-white font-medium z-20">
          <span>09:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Header App */}
        <div className="bg-[#141229] dark:bg-[#0c0b21] px-4 pt-2 pb-6 text-white rounded-b-3xl shadow-lg z-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#6419c1]/40 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-emerald-400" /> Kas RT
            </h2>
            <p className="text-[10px] text-white/60 mb-1">Total Saldo Aktif</p>
            <h3 className="text-3xl font-extrabold text-emerald-400">Rp 4.5M</h3>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white/10 rounded-xl p-2 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center text-[8px] text-white/70 mb-1">
                  <ArrowDownCircle className="w-3 h-3 mr-1 text-emerald-400" /> Pemasukan
                </div>
                <p className="font-bold text-[10px] text-emerald-400">+ Rp 850Rb</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center text-[8px] text-white/70 mb-1">
                  <ArrowUpCircle className="w-3 h-3 mr-1 text-red-400" /> Pengeluaran
                </div>
                <p className="font-bold text-[10px] text-red-400">- Rp 200Rb</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 relative z-20">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">Riwayat Terakhir</h3>
            <span className="text-[10px] text-primary">Lihat Semua</span>
          </div>

          {[
            { title: "Iuran Bulanan Warga", date: "10 Ags 2026", type: "in", amount: "+ Rp 500.000" },
            { title: "Sumbangan 17an", date: "08 Ags 2026", type: "in", amount: "+ Rp 350.000" },
            { title: "Perbaikan Gapura", date: "05 Ags 2026", type: "out", amount: "- Rp 200.000" },
          ].map((trx, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${trx.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {trx.type === 'in' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{trx.title}</p>
                <p className="text-[9px] text-slate-500">{trx.date}</p>
              </div>
              <div className={`text-xs font-bold whitespace-nowrap ${trx.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trx.amount}
              </div>
            </motion.div>
          ))}
          
          <motion.button variants={itemVariants} className="mt-2 w-full py-2.5 bg-primary/10 text-primary rounded-xl text-[10px] font-bold flex items-center justify-center gap-1">
            <ReceiptText className="w-3 h-3" /> Unduh Laporan PDF
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
