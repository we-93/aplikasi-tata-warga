"use client";

import { motion } from "framer-motion";
import { Users, FileText, Wallet, MessageSquare, LayoutDashboard, Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedHeroDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="aspect-[4/3] w-full bg-muted/20 rounded-xl" />;

  const containerVariants: any = {
    hidden: { opacity: 0, y: 50, rotateX: 10, scale: 0.95 },
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  const pathVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 2, ease: "easeInOut", delay: 0.5 } 
    }
  };

  return (
    <motion.div 
      className="relative w-full aspect-[4/3] bg-[#f5f5f5] dark:bg-[#0c0b21] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      {/* Sidebar Mockup */}
      <div className="w-16 md:w-48 bg-white dark:bg-[#141229] border-r border-slate-200 dark:border-white/5 flex flex-col items-center md:items-start py-4 md:px-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded bg-[#6419c1] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[10px]">TW</span>
          </div>
          <span className="font-bold text-[#6419c1] text-[10px] hidden md:block">Tata Warga</span>
        </div>
        
        <div className="w-full space-y-2">
          {[
            { icon: LayoutDashboard, color: "text-white", bg: "bg-[#6419c1]", label: "Dashboard" },
            { icon: Users, color: "text-slate-400", bg: "bg-transparent", label: "Data Warga" },
            { icon: FileText, color: "text-slate-400", bg: "bg-transparent", label: "Surat" },
            { icon: Wallet, color: "text-slate-400", bg: "bg-transparent", label: "Kas RT" },
            { icon: MessageSquare, color: "text-slate-400", bg: "bg-transparent", label: "AI Asisten" }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className={`flex items-center gap-3 p-2 md:px-3 rounded-lg ${item.bg} w-full justify-center md:justify-start`}
            >
              <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${item.color}`} />
              <span className={`text-[10px] md:text-xs font-medium ${item.color} hidden md:block`}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Mockup */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-[#141229] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6">
          <div className="w-32 h-8 bg-slate-100 dark:bg-white/5 rounded-md flex items-center px-2 gap-2 text-slate-400 hidden sm:flex">
             <Search className="w-4 h-4" />
             <span className="text-xs">Cari...</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 relative">
               <Bell className="w-4 h-4" />
               <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-white dark:border-[#141229]"></div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { title: "Total Warga", value: "342", color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
              { title: "Kas RT", value: "Rp 12.5M", color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+5%" },
              { title: "Surat Dibuat", value: "45", color: "text-amber-500", bg: "bg-amber-500/10", trend: "Bulan ini" },
              { title: "WA Bot", value: "Online", color: "text-purple-500", bg: "bg-purple-500/10", trend: "100% Uptime" }
            ].map((card, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-[#141229] p-3 md:p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 justify-between mb-1">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shrink-0">
                    <div className={`w-full h-full rounded-full ${card.bg}`}></div>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-semibold text-emerald-500">{card.trend}</span>
                </div>
                <h3 className="text-slate-500 dark:text-white/50 text-[9px] md:text-[10px] font-medium">{card.title}</h3>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + (i * 0.2) }}
                  className="text-xs md:text-base font-bold text-slate-800 dark:text-white mt-0.5"
                >
                  {card.value}
                </motion.p>
              </motion.div>
            ))}
          </div>

          {/* Chart & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-[#141229] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-4 flex flex-col relative overflow-hidden group">
              <h3 className="text-[10px] md:text-xs font-semibold text-slate-800 dark:text-white mb-2">Statistik Kas RT</h3>
              
              {/* Chart Grid Lines */}
              <div className="absolute inset-x-0 bottom-4 top-12 flex flex-col justify-between px-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-full border-t border-dashed border-slate-100 dark:border-white/5"></div>
                ))}
              </div>

              <div className="flex-1 w-full relative mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Area Fill */}
                  <motion.path 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    d="M0,40 L0,20 C10,20 20,10 30,15 C40,20 50,5 60,10 C70,15 80,5 100,5 L100,40 Z" 
                    className="fill-emerald-500/10 dark:fill-emerald-500/20"
                  />
                  {/* Line */}
                  <motion.path 
                    variants={pathVariants}
                    d="M0,20 C10,20 20,10 30,15 C40,20 50,5 60,10 C70,15 80,5 100,5" 
                    fill="none" 
                    strokeWidth="1.5" 
                    className="stroke-emerald-500 drop-shadow-md"
                  />
                </svg>
                
                {/* Floating Tooltip Mockup */}
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 2.5, type: "spring" }}
                  className="absolute top-[10%] right-[20%] bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none"
                >
                  Rp 12.5M
                </motion.div>
              </div>
            </motion.div>

            {/* Activity List */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#141229] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-3 hidden md:flex flex-col">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-white mb-3">Aktivitas Terbaru</h3>
              <div className="space-y-3 flex-1">
                {[
                  { text: "Budi membayar Iuran", time: "2 jam lalu", type: "kas" },
                  { text: "Surat Pengantar RT dibuat", time: "5 jam lalu", type: "surat" },
                  { text: "Notulen Rapat Bulanan", time: "1 hari lalu", type: "ai" }
                ].map((act, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + (i * 0.2) }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-700 dark:text-white/80 font-medium leading-tight">{act.text}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">{act.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#6419c1]/20 rounded-full blur-3xl pointer-events-none"></div>
    </motion.div>
  );
}
