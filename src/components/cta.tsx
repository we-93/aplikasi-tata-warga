"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-16 md:py-24 bg-background px-4 md:px-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl"
        >
          {/* Background decoration */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] transform translate-x-1/2 -translate-y-1/2"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] transform -translate-x-1/2 translate-y-1/2"
          />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Uji Coba TATA WARGA Sekarang
            </h2>
            <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto">
              Silakan mendaftar secara gratis atau gunakan akun demo kami untuk melihat langsung fitur-fitur Tata Warga.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base font-semibold bg-[#6419c1] hover:bg-[#7735d4] text-white shadow-lg group border-0">
                  Daftar Gratis Sekarang
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Button>
              </Link>
              <a href="/tata-warga.apk" download className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base font-semibold bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg group border-0">
                  Unduh Tata Warga .apk
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-y-1 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </Button>
              </a>
            </div>

            <div className="pt-8 mt-8 border-t border-white/20 flex flex-col md:flex-row justify-center items-center gap-6">
              <div className="text-left bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <p className="text-sm font-semibold mb-2 text-yellow-400">Akses Demo Website</p>
                <div className="text-sm space-y-1 text-white/90">
                  <p>Email: <span className="font-mono bg-black/30 px-2 py-0.5 rounded">demo@tatawarga.web.id</span></p>
                  <p>Password: <span className="font-mono bg-black/30 px-2 py-0.5 rounded">demo123</span></p>
                </div>
                <Link href="/auth/login" className="inline-block mt-3 text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-2">
                  Masuk ke Demo →
                </Link>
              </div>
              
              <div className="text-left bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <p className="text-sm font-semibold mb-2 text-yellow-400">Pusat Bantuan & Tutorial</p>
                <p className="text-sm text-white/90 max-w-xs mb-3">
                  Pelajari cara menggunakan Tata Warga dari A sampai Z melalui dokumentasi publik kami.
                </p>
                <a href="https://doc.tatawarga.web.id" target="_blank" rel="noreferrer" className="inline-block text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-2">
                  Buka Dokumentasi →
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
