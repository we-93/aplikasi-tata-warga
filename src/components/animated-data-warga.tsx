"use client";

import { motion } from "framer-motion";
import { Users, PieChart, Activity, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedDataWarga() {
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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
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
        <div className="h-6 w-full bg-blue-600 dark:bg-blue-900 flex justify-between items-center px-5 text-[10px] text-white font-medium z-20">
          <span>09:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Header App */}
        <div className="bg-blue-600 dark:bg-blue-900 px-4 pt-2 pb-6 text-white rounded-b-3xl shadow-sm z-10 relative">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Statistik Warga
          </h2>
          <p className="text-[10px] text-blue-100 mt-1">Data terkini kependudukan RT 01</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-4 -mt-3 flex flex-col gap-3 relative z-20">
          
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-[10px] font-semibold text-slate-500 mb-2">Berdasarkan Jenis Kelamin</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium">Laki-laki (68)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <span className="text-xs font-medium">Perempuan (74)</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 mt-3 flex overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '48%' }}></div>
              <div className="h-full bg-pink-500" style={{ width: '52%' }}></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-[10px] font-semibold text-slate-500 mb-2">Kelompok Usia</h3>
            <div className="space-y-2">
              {[
                { label: 'Anak-anak (0-12)', val: '25%', color: 'bg-emerald-400' },
                { label: 'Remaja (13-18)', val: '15%', color: 'bg-amber-400' },
                { label: 'Dewasa (19-59)', val: '50%', color: 'bg-indigo-400' },
                { label: 'Lansia (>60)', val: '10%', color: 'bg-rose-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span>{item.label}</span>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${item.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: item.val }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 mt-auto mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold">Lihat Daftar Warga</p>
                <p className="text-[8px] text-slate-500">Kelola data 142 warga terdaftar</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
