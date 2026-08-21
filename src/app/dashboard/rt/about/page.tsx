import { Info, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Tentang Aplikasi - Tata Warga",
};

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10 w-full mt-4">
        <Link href="/dashboard/rt/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Tentang Aplikasi</h1>
      </div>
      
      <div className="pb-8 pt-6 flex flex-col min-h-[60vh] justify-center items-center text-center">
      
      <div className="w-24 h-24 flex items-center justify-center mb-6">
        <Image src="/favicon-tata-warga.png" alt="Tata Warga Logo" width={96} height={96} className="object-contain drop-shadow-xl" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">
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
    </div>
  );
}
