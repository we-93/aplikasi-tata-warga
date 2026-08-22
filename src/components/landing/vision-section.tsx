"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function VisionSection() {
  return (
    <section className="py-24 md:py-40 relative bg-[#0c0b21] overflow-hidden flex flex-col items-center justify-center">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6419c1]/30 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full px-4 text-center max-w-5xl mx-auto space-y-8 md:space-y-12">
        <motion.h2 
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
        >
          Dari RT untuk masyarakat
        </motion.h2>
        
        <motion.h2 
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#fad700] tracking-tight"
        >
          Dari masyarakat<br className="hidden md:block" /> untuk Kabupaten Tangerang
        </motion.h2>
      </div>
    </section>
  );
}
