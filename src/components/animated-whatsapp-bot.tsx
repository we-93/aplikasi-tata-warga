"use client";

import { motion } from "framer-motion";
import { Battery, Wifi, Signal, Check, CheckCheck, MoreVertical, Phone, Video, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export function AnimatedWhatsappBot() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Animation sequence: 0: Initial, 1: RT typing, 2: RT sent, 3: Bot typing, 4: Bot sent
    const runSequence = async () => {
      while (true) {
        setStep(0);
        await new Promise(r => setTimeout(r, 1000));
        setStep(1); // Typing request
        await new Promise(r => setTimeout(r, 2000));
        setStep(2); // Sent request
        await new Promise(r => setTimeout(r, 1000));
        setStep(3); // Bot typing
        await new Promise(r => setTimeout(r, 2000));
        setStep(4); // Bot sent
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    
    runSequence();
  }, []);

  if (!mounted) return <div className="aspect-[9/19] w-full max-w-[280px] mx-auto bg-muted/20 rounded-[2.5rem]" />;

  const chatVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-[9/19] bg-black rounded-[2.5rem] p-2 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden">
      {/* Phone Screen Background */}
      <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] rounded-[2rem] overflow-hidden flex flex-col relative border border-slate-700/50">
        
        {/* Status Bar */}
        <div className="h-6 w-full bg-[#008069] dark:bg-[#202c33] flex justify-between items-center px-4 text-[10px] text-white z-10">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
          </div>
        </div>

        {/* WhatsApp Header */}
        <div className="h-14 bg-[#008069] dark:bg-[#202c33] flex items-center px-2 z-10 shadow-sm">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden shrink-0">
               <div className="w-full h-full bg-emerald-100 flex flex-wrap">
                  <div className="w-1/2 h-1/2 bg-blue-500/50"></div>
                  <div className="w-1/2 h-1/2 bg-green-500/50"></div>
                  <div className="w-1/2 h-1/2 bg-yellow-500/50"></div>
                  <div className="w-1/2 h-1/2 bg-red-500/50"></div>
               </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">Grup Asisten RT</h3>
              <p className="text-white/80 text-[10px] truncate">
                {step === 3 ? "AI Asisten sedang mengetik..." : "Ketua RT, Bendahara, AI Asisten..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white px-2">
            <Video className="w-4 h-4" />
            <Phone className="w-4 h-4" />
            <MoreVertical className="w-4 h-4" />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 relative bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QNT4vO2uO.png')] dark:bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QNT4vO2uO.png')] bg-contain opacity-90">
          <div className="text-center my-2">
            <span className="bg-[#e1f3fb] dark:bg-[#182229] text-slate-600 dark:text-slate-400 text-[9px] px-3 py-1 rounded-lg uppercase shadow-sm">Hari Ini</span>
          </div>

          {/* User Chat (Ketua RT) */}
          <motion.div 
            initial="hidden"
            animate={step >= 1 ? "visible" : "hidden"}
            variants={chatVariants}
            className="self-end max-w-[85%] mb-1"
          >
            <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-[#e9edef] rounded-lg rounded-tr-none p-2 shadow-sm text-xs relative">
              <span className="text-[#008069] dark:text-[#53bdeb] font-semibold text-[10px] block mb-0.5">~ Ketua RT</span>
              {step === 1 ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 0.8 }}>#SURAT Tolong buatkan penga|</motion.span>
              ) : (
                <span>#SURAT Tolong buatkan pengantar SKCK atas nama Budi Santoso</span>
              )}
              <div className="flex justify-end items-center gap-1 mt-1 -mb-1">
                <span className="text-[9px] text-slate-500 dark:text-white/60">09:41</span>
                {step >= 2 && <CheckCheck className={`w-3 h-3 ${step >= 3 ? 'text-blue-500' : 'text-slate-400'}`} />}
              </div>
            </div>
          </motion.div>

          {/* Bot Typing Indicator */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="self-start max-w-[85%] mt-1"
            >
               <div className="bg-white dark:bg-[#202c33] p-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </motion.div>
          )}

          {/* Bot Reply */}
          <motion.div 
            initial="hidden"
            animate={step >= 4 ? "visible" : "hidden"}
            variants={chatVariants}
            className="self-start max-w-[85%] mt-1"
          >
            <div className="bg-white dark:bg-[#202c33] text-slate-800 dark:text-[#e9edef] rounded-lg rounded-tl-none p-2 shadow-sm text-xs relative">
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-[10px] flex items-center gap-1 mb-0.5">
                ~ AI Asisten <span className="bg-purple-100 text-purple-600 px-1 text-[8px] rounded">BOT</span>
              </span>
              <p>Baik Pak RT! 🤖</p>
              <p className="mt-1">Draf Surat Pengantar SKCK untuk <b>Budi Santoso (NIK: 3201...)</b> telah dibuat.</p>
              
              <div className="mt-2 p-2 bg-slate-100 dark:bg-[#111b21] rounded flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div className="bg-red-500 text-white p-1.5 rounded">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate">Surat_Pengantar_SKCK_Budi.pdf</p>
                  <p className="text-[8px] text-slate-500">124 KB • PDF Document</p>
                </div>
              </div>
              
              <div className="flex justify-end items-center gap-1 mt-1 -mb-1">
                <span className="text-[9px] text-slate-500 dark:text-white/60">09:42</span>
              </div>
            </div>
          </motion.div>
          
        </div>

        {/* Input Area */}
        <div className="h-12 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center px-2 gap-2 z-10">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-500"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          </div>
          <div className="flex-1 h-8 bg-white dark:bg-[#2a3942] rounded-full flex items-center px-3 text-[11px] text-slate-400">
            Ketik pesan...
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center shrink-0 shadow-sm">
            <Mic className="w-4 h-4 text-white" />
          </div>
        </div>

      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none -z-10"></div>
    </div>
  );
}
