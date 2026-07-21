"use client";

import { motion } from "framer-motion";
import { Download, Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedDataWarga() {
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

  const rowVariants: any = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const dummyWarga = [
    { name: "Budi Santoso", nik: "3201012345678901", kk: "3201019876543210", gender: "L", hp: "081234567890", status: "Aktif", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { name: "Siti Aminah", nik: "3201012345678902", kk: "3201019876543210", gender: "P", hp: "081298765432", status: "Aktif", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { name: "Ahmad Fauzi", nik: "3201012345678903", kk: "3201011122334455", gender: "L", hp: "081211223344", status: "Pindah", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
    { name: "Dewi Lestari", nik: "3201012345678904", kk: "3201015566778899", gender: "P", hp: "081255667788", status: "Aktif", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Data Warga</h2>
          <p className="text-[10px] md:text-xs text-slate-500 dark:text-white/50 mt-1">Kelola data seluruh penduduk di lingkungan RT Anda.</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} className="hidden md:flex items-center justify-center px-3 py-1.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-white cursor-pointer shadow-sm">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Excel
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center justify-center px-3 py-1.5 rounded bg-[#6419c1] text-white text-xs font-medium cursor-pointer shadow-sm shadow-[#6419c1]/20">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Warga
          </motion.div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-lg flex items-center px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <div className="w-24 h-3 bg-slate-100 dark:bg-white/5 rounded animate-pulse"></div>
        </div>
        <div className="w-10 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 rounded-lg flex items-center justify-center shadow-sm">
          <Filter className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Table Mockup */}
      <div className="flex-1 bg-white dark:bg-[#141229] rounded-lg border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-white/5 p-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
          <div className="col-span-4">Nama Lengkap</div>
          <div className="col-span-3">NIK / No. KK</div>
          <div className="col-span-1 hidden md:block">L/P</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 md:col-span-2 text-right">Aksi</div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {dummyWarga.map((warga, i) => (
            <motion.div 
              key={i}
              variants={rowVariants}
              className="grid grid-cols-12 gap-2 p-3 border-b border-slate-100 dark:border-white/5 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="col-span-4 font-medium text-xs text-slate-700 dark:text-white/90 truncate pr-2">
                {warga.name}
              </div>
              <div className="col-span-3 flex flex-col justify-center">
                <span className="text-[10px] text-slate-600 dark:text-white/70 truncate">NIK: {warga.nik}</span>
                <span className="text-[9px] text-slate-400 truncate hidden md:block">KK: {warga.kk}</span>
              </div>
              <div className="col-span-1 text-xs text-slate-500 hidden md:block">
                {warga.gender}
              </div>
              <div className="col-span-2 flex items-center">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${warga.bg} ${warga.color}`}>
                  {warga.status}
                </span>
              </div>
              <div className="col-span-3 md:col-span-2 flex justify-end gap-1 md:gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-blue-500 bg-blue-500/10 cursor-pointer">
                  <Pencil className="w-3 h-3" />
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center text-red-500 bg-red-500/10 cursor-pointer hidden md:flex">
                  <Trash2 className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </motion.div>
  );
}
