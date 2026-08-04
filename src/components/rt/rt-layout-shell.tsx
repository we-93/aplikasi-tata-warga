"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wallet, 
  MessageSquare, 
  Database,
  Receipt,
  Settings,
  Activity,
  Menu, 
  X, 
  LogOut,
  Sun,
  Moon,
  Bell,
  User,
  Globe,
  Bot,
  MessageCircle,
  HelpCircle,
  BookOpen
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/rt", icon: LayoutDashboard },
  { name: "Data Warga", href: "/dashboard/rt/warga", icon: Users },
  { name: "Pelayanan Surat", href: "/dashboard/rt/surat", icon: FileText },
  { name: "Kas RT", href: "/dashboard/rt/kas", icon: Wallet },
  { name: "AI Assistant", href: "/dashboard/rt/ai", icon: Bot },
  { name: "WA Asisten", href: "/dashboard/rt/wa", icon: MessageCircle },
  { name: "Notulen AI", href: "/dashboard/rt/notulen", icon: Database },
  { name: "Langganan & Tagihan", href: "/dashboard/rt/billing", icon: Receipt },
  { name: "Pengaturan RT", href: "/dashboard/rt/settings", icon: Settings },
  { name: "Log Aktivitas", href: "/dashboard/rt/logs", icon: Activity },
];

interface LogEntry {
  id: string;
  action: string;
  description: string | null;
  createdAt: string;
  tenantName: string | null;
  userName: string | null;
}

interface RTLayoutShellProps {
  children: React.ReactNode;
  logoUrl: string | null;
  logoUrlDark: string | null;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  footerText: string;
  recentLogs: LogEntry[];
}

export function RTLayoutShell({ children, logoUrl, logoUrlDark, userName, userEmail, userImage, footerText, recentLogs }: RTLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lastReadLogId, setLastReadLogId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("rt_last_read_log_id");
    if (stored) {
      setLastReadLogId(stored);
    }
  }, []);

  const hasNewLogs = mounted && recentLogs.length > 0 && recentLogs[0].id !== lastReadLogId;

  const handleNotificationClick = () => {
    if (recentLogs.length > 0) {
      const latestId = recentLogs[0].id;
      setLastReadLogId(latestId);
      localStorage.setItem("rt_last_read_log_id", latestId);
    }
  };

  const isDark = mounted && resolvedTheme === "dark";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 flex bg-[#f5f5f5] dark:bg-[#0c0b21] transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
          bg-white dark:bg-[#141229] text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/5
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5 md:hidden">
          {logoUrl || logoUrlDark ? (
            <>
              {(!logoUrlDark || !isDark) && logoUrl && (
                <Image src={logoUrl} alt="Logo" width={100} height={32} className="h-8 w-auto object-contain" />
              )}
              {isDark && logoUrlDark && (
                <Image src={logoUrlDark} alt="Logo" width={100} height={32} className="h-8 w-auto object-contain" />
              )}
            </>
          ) : (
            <Link href="/dashboard/rt" className="font-bold text-xl text-[#6419c1]">
              Tata Warga
            </Link>
          )}
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Logo in Sidebar */}
        <div className="h-16 hidden md:flex items-center px-6 border-b border-slate-200 dark:border-white/5">
          {logoUrl || logoUrlDark ? (
            <>
              {(!logoUrlDark || !isDark) && logoUrl && (
                <Image src={logoUrl} alt="Logo" width={120} height={40} className="h-8 w-auto object-contain" />
              )}
              {isDark && logoUrlDark && (
                <Image src={logoUrlDark} alt="Logo" width={120} height={40} className="h-8 w-auto object-contain" />
              )}
            </>
          ) : (
            <Link href="/dashboard/rt" className="font-bold text-xl text-[#6419c1]">
              Tata Warga
            </Link>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-[#6419c1] text-white shadow-md shadow-[#6419c1]/20" 
                    : "text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-white/50"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
          {/* Mobile Only Theme Toggle */}
          <div className="flex md:hidden items-center justify-between px-2">
            <span className="text-xs text-slate-500 dark:text-white/50">Tema</span>
            {mounted && (
              <div className="flex gap-1 bg-slate-100 dark:bg-black/30 p-1 rounded-full border border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-[#6419c1] text-white shadow-sm' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#6419c1] text-white shadow-sm' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <a 
            href="https://docs.tatawarga.net" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center px-4 py-2 text-sm font-medium bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 rounded-md transition-colors w-full gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Tutorial
          </a>
          
          <a 
            href="https://api.whatsapp.com/send?phone=6285045441445&text=Halo%20admin%20Tata%20Warga%2C%20saya%20pelu%20bantuan%20terkait%20kendala....%20(jelaskan%20kendala%20Anda)" 
            target="_blank"
            rel="noreferrer"
            className="flex justify-center items-center px-4 py-2 text-sm font-medium bg-[#6419c1]/10 dark:bg-[#6419c1]/20 text-[#6419c1] dark:text-[#a064fa] hover:bg-[#6419c1]/20 dark:hover:bg-[#6419c1]/40 rounded-md transition-colors w-full gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Support
          </a>
          
          <button 
            onClick={handleLogout}
            className="flex justify-center items-center px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#f5f5f5] dark:bg-[#0c0b21]">
        
        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b bg-white dark:bg-[#141229] border-slate-200 dark:border-white/5 shadow-sm z-10">
          
          <div className="flex items-center gap-3">
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-md text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop Logo (Hidden since it's moved to Sidebar) */}
            <div className="hidden"></div>
            
            {/* Logo Mobile */}
            <div className="md:hidden flex items-center">
              {logoUrl || logoUrlDark ? (
                <>
                  {(!logoUrlDark || !isDark) && logoUrl && (
                    <Image src={logoUrl} alt="Logo" width={100} height={32} className="h-7 w-auto object-contain" />
                  )}
                  {isDark && logoUrlDark && (
                    <Image src={logoUrlDark} alt="Logo" width={100} height={32} className="h-7 w-auto object-contain" />
                  )}
                </>
              ) : (
                <Link href="/dashboard/rt" className="font-bold text-lg text-[#6419c1]">
                  Tata Warga
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Desktop Only Theme Toggle */}
            {mounted && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-full border border-slate-200 dark:border-white/5 mr-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-[#6419c1] text-white shadow-sm' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#6419c1] text-white shadow-sm' : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Moon className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Notifications */}
            <DropdownMenu onOpenChange={(open) => { if (open) handleNotificationClick(); }}>
              <DropdownMenuTrigger className="relative p-2 rounded-full text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                {hasNewLogs && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-[#141229] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-lg dark:shadow-[0_0_15px_rgba(100,25,193,0.3)]">
                <div className="px-2 py-1.5 text-sm font-semibold">Notifikasi Terakhir</div>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                {recentLogs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-white/50">Belum ada notifikasi</div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="p-3 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <p className="text-xs font-medium text-[#6419c1] dark:text-[#a064fa]">{log.action}</p>
                        <p className="text-xs text-slate-600 dark:text-white/70 mt-0.5 line-clamp-2">{log.description}</p>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 dark:text-white/40">
                          <span>{log.tenantName || 'Global'} - {log.userName || 'Sistem'}</span>
                          <span>{formatTime(log.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/rt/logs'} className="cursor-pointer justify-center text-[#6419c1] dark:text-[#a064fa] focus:bg-slate-50 dark:focus:bg-white/5">
                  Lihat Semua Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 dark:bg-white text-slate-600 dark:text-[#141229] border border-slate-300 dark:border-white/10 shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.2)] focus:outline-none overflow-hidden hover:opacity-90 transition-opacity">
                {userImage ? (
                  <Image src={userImage} alt="User" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#141229] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-lg dark:shadow-[0_0_15px_rgba(100,25,193,0.3)]">
                <div className="px-2 py-1.5 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-slate-500 dark:text-white/50">{userEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/rt/settings'} className="cursor-pointer focus:bg-slate-50 dark:focus:bg-white/5">
                  <Settings className="mr-2 h-4 w-4 text-slate-500 dark:text-white/70" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-500 dark:focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 flex flex-col">
          <div className="admin-content-wrapper flex-1">
             {children}
          </div>
          {/* Footer */}
          <footer className="mt-8 text-center text-xs text-slate-400 dark:text-white/40 pb-4">
             {footerText}
          </footer>
        </div>
      </main>
    </div>
  );
}
