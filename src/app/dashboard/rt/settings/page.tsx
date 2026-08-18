"use client";

import Link from "next/link";
import { User, Building2, FileText, BookOpen, Info, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsHubPage() {
  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-6">
      <div className="pt-2 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan</h1>
      </div>

      <div className="space-y-3">
        {/* Profil Saya */}
        <Link href="/dashboard/rt/settings/akun" className="flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6519c2] text-[#fad700] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Profil Saya</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6519c2]" />
        </Link>

        {/* Profil RT */}
        <Link href="/dashboard/rt/settings/profil" className="flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6519c2] text-[#fad700] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Profil RT</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6519c2]" />
        </Link>

        {/* Template Surat */}
        <Link href="/dashboard/rt/surat/template" className="flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6519c2] text-[#fad700] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Template Surat</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6519c2]" />
        </Link>

        {/* Tutorial */}
        <a href="https://docs.tatawarga.net/" target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6519c2] text-[#fad700] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Tutorial Aplikasi</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6519c2]" />
        </a>

        {/* Tentang Aplikasi */}
        <Link href="/dashboard/rt/about" className="flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6519c2] text-[#fad700] flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Tentang Aplikasi</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6519c2]" />
        </Link>

        {/* Bantuan */}
        <a href="https://api.whatsapp.com/send?phone=6281934197955&text=Halo%20Admin%20Tata%20Warga%2C%20mohon%20dibantu%20untuk" target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6519c2] text-[#fad700] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Pusat Bantuan</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6519c2]" />
        </a>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-bold text-red-600 dark:text-red-400">Keluar (Logout)</span>
          </div>
        </button>

      </div>
    </div>
  );
}
