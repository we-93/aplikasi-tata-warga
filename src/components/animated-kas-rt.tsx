"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowDownRight, ArrowUpRight, Filter, FileSpreadsheet, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedKasRt() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="aspect-[4/3] w-full bg-muted/20 rounded-xl" />;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50, rotateX: 5, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const chartData = [
    { label: "Feb", p: 40, e: 20 },
    { label: "Mar", p: 45, e: 10 },
    { label: "Apr", p: 30, e: 50 },
    { label: "Mei", p: 80, e: 25 },
    { label: "Jun", p: 60, e: 35 },
    { label: "Jul", p: 70, e: 20 },
  ];

  return (
    <motion.div 
      className="relative w-full aspect-[4/3] bg-[#f5f5f5] dark:bg-[#0c0b21] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Manajemen Kas RT</h2>
          <p className="text-[10px] md:text-xs text-slate-500 dark:text-white/50 mt-0.5">Kelola pencatatan uang kas warga, pemasukan, dan pengeluaran.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <p className="text-primary font-medium text-[8px] md:text-xs mb-1">Total Saldo Saat Ini</p>
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">Rp 12.5M</h3>
            <div className="w-5 h-5 md:w-8 md:h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Wallet className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <p className="text-muted-foreground font-medium text-[8px] md:text-xs mb-1">Pemasukan (Bulan Ini)</p>
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-lg font-bold text-emerald-600">Rp 4.2M</h3>
            <div className="w-5 h-5 md:w-8 md:h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <p className="text-muted-foreground font-medium text-[8px] md:text-xs mb-1">Pengeluaran (Bulan Ini)</p>
          <div className="flex justify-between items-center">
            <h3 className="text-sm md:text-lg font-bold text-red-500">Rp 1.1M</h3>
            <div className="w-5 h-5 md:w-8 md:h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm mb-4 flex-1 flex flex-col">
        <h2 className="font-bold text-xs mb-2 text-slate-800 dark:text-white">📈 Arus Kas 6 Bulan Terakhir</h2>
        <div className="flex items-end gap-2 md:gap-4 flex-1 px-2 md:px-4 mt-2">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="w-full flex items-end gap-0.5 md:gap-1 flex-1 relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: `${d.p}%` }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                  className="flex-1 bg-emerald-500 rounded-t-sm" 
                />
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: `${d.e}%` }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                  className="flex-1 bg-red-400 rounded-t-sm" 
                />
              </div>
              <span className="text-[8px] md:text-[10px] text-slate-400 mt-1">{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Toolbar Mockup */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 md:w-4 md:h-4 text-[#6419c1]" />
          <span className="font-semibold text-xs md:text-sm text-slate-800 dark:text-white">Riwayat Transaksi</span>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex items-center justify-center px-2 py-1 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] md:text-xs font-medium text-slate-700 dark:text-white cursor-pointer">
            <FileSpreadsheet className="w-3 h-3 mr-1" /> Excel
          </div>
          <div className="flex items-center justify-center px-2 py-1 rounded bg-[#6419c1] text-white text-[10px] md:text-xs font-medium cursor-pointer shadow-sm shadow-[#6419c1]/20">
            <Plus className="w-3 h-3 mr-1" /> Tambah
          </div>
        </div>
      </motion.div>
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </motion.div>
  );
}
