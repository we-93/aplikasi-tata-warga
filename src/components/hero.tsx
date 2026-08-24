"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedHeroDashboard } from "./animated-hero-dashboard";
import { useRef } from "react";

export function Hero({
  title,
  subtitle,
  image,
}: {
  title?: string | null;
  subtitle?: string | null;
  image?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={containerRef} id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-background">
      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#6419c1]/20 rounded-full blur-[100px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#fad700]/10 rounded-full blur-[120px] mix-blend-screen" 
        />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="container px-4 md:px-6 mx-auto text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Revolusi Administrasi Tingkat RT
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", type: "spring" }}
            className="text-4xl md:text-6xl lg:text-8xl font-extrabold tracking-tight text-[#6419c1] leading-tight drop-shadow-sm uppercase"
          >
            TATA WARGA
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-3xl text-muted-foreground font-semibold"
          >
            Teknologi Andal Tata Kelola Administrasi Warga
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mt-4"
          >
            Satu platform cerdas untuk mendigitalkan data warga, mempercepat pelayanan surat, dan mengelola kas tanpa repot.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base font-semibold bg-[#6419c1] hover:bg-[#7735d4] text-white shadow-lg shadow-[#6419c1]/30 hover:shadow-[#6419c1]/50 group transition-all duration-300 transform hover:-translate-y-1">
                Daftar Gratis Sekarang
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Button>
            </Link>
            <a href="/Tata Warga v.2.0.0.apk" download className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base font-semibold border-2 border-slate-200 dark:border-slate-800 hover:border-[#fad700] hover:bg-[#fad700]/10 shadow-lg group transition-all duration-300 transform hover:-translate-y-1">
                Unduh Tata Warga .apk
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-y-1 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </Button>
            </a>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, type: "spring" }}
          className="mt-16 md:mt-24 max-w-sm mx-auto relative group perspective-[1000px]"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 dark:opacity-80 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
          
          <motion.div 
            whileHover={{ rotateX: 5, rotateY: -5 }}
            className="relative rounded-3xl border border-white/20 bg-white/5 p-2 md:p-4 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-primary/10 transition-transform duration-500"
          >
            {/* Window controls mockup */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex space-x-2 z-20">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            <div className="bg-card rounded-2xl overflow-hidden relative aspect-[9/19] w-full border border-border/50 shadow-inner">
              {image ? (
                <Image src={image} alt="Dashboard Tata Warga" fill className="object-cover" />
              ) : (
                <AnimatedHeroDashboard />
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
