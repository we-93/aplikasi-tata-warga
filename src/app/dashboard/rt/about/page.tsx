import { Info } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Tentang Aplikasi - Tata Warga",
};

export default function AboutPage() {
  return (
    <div className="max-w-md mx-auto pb-8 pt-6 flex flex-col min-h-[70vh] justify-center items-center text-center">
      
      <div className="w-24 h-24 bg-gradient-to-br from-[#6419c1] to-[#a064fa] rounded-3xl shadow-xl flex items-center justify-center mb-6">
        <span className="text-white font-extrabold text-5xl leading-none">T</span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
        TATA WARGA
      </h1>
      <h2 className="text-sm font-semibold text-[#6419c1] dark:text-[#a064fa] mb-6">
        (Teknologi Andal Tata Kelola Administrasi Warga)
      </h2>

      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-12">
        Aplikasi ini dirancang khusus untuk memudahkan pengurus RT dan RW dalam mengelola data penduduk, administrasi persuratan otomatis, pencatatan kas terpusat, serta memberikan informasi cerdas bagi warga melalui asisten AI. Kami berkomitmen untuk mewujudkan lingkungan yang lebih tertib, transparan, dan modern.
      </p>

      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/10 w-full">
        <p className="text-red-500 font-bold text-sm tracking-widest">
          VERSI 2.0
        </p>
        <p className="text-xs text-slate-400 mt-2">
          &copy; {new Date().getFullYear()} Tata Warga. All rights reserved.
        </p>
      </div>

    </div>
  );
}
