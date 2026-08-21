"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <button onClick={handleLogout} className="w-full flex items-center justify-between bg-white dark:bg-[#141229] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 mt-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
        <span className="font-bold text-red-600 dark:text-red-400">Keluar (Logout)</span>
      </div>
    </button>
  );
}
