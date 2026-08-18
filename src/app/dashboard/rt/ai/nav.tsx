"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AiTabsNav() {
  const pathname = usePathname();

  return (
    <div className="flex w-full justify-start mb-4 h-auto gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <Link 
        href="/dashboard/rt/ai/chat" 
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${pathname === '/dashboard/rt/ai/chat' ? 'bg-[#6419c1] text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm'}`}
      >
        Chat AI
      </Link>
    </div>
  );
}
