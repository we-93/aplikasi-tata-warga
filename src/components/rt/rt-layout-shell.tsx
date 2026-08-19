"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  BookOpen,
  Home,
  Plus,
  UserPlus
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
  { name: "Notulen & Pengumuman", href: "/dashboard/rt/notulen", icon: Database },
  { name: "Pengaturan", href: "/dashboard/rt/settings", icon: Settings },
  { name: "Log Aktivitas", href: "/dashboard/rt/logs", icon: Activity },
];

interface NotificationEntry {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface RTLayoutShellProps {
  children: React.ReactNode;
  logoUrl: string | null;
  logoUrlDark: string | null;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  footerText: string;
  notifications: NotificationEntry[];
}

import { markNotificationRead } from "@/app/actions/notifications";

export function RTLayoutShell({ children, logoUrl, logoUrlDark, userName, userEmail, userImage, footerText, notifications }: RTLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(notifications);

  // 30-second polling for new notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setLocalNotifs(data.notifications);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    setLocalNotifs(notifications);
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [notifications, fetchNotifications]);

  // Android back button handler
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      const isHome = pathname === "/dashboard/rt";
      if (isHome) {
        e.preventDefault();
        setShowExitDialog(true);
        // Push state back so the URL stays
        window.history.pushState(null, "", window.location.href);
      }
    };
    // Push initial state
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [pathname]);

  const unreadCount = localNotifs.filter(n => !n.isRead).length;
  const hasNewNotifs = mounted && unreadCount > 0;

  const handleMarkRead = async (id: string) => {
    setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationRead(id);
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
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Exit Confirmation Dialog (Android back button on home) */}
        {showExitDialog && (
          <div className="fixed inset-0 z-[9999] bg-black/60 flex items-end md:items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1835] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Keluar Aplikasi?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Apakah Anda yakin ingin menutup aplikasi Tata Warga?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowExitDialog(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  Batal
                </button>
                <button onClick={() => { setShowExitDialog(false); (window as any).history.go(-(window as any).history.length); }} className="flex-1 py-2.5 rounded-xl bg-[#6419c1] text-white text-sm font-semibold hover:bg-[#6419c1]/90 transition-colors">
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="h-14 md:h-20 bg-[#6519c2] md:bg-white/80 dark:md:bg-[#141229]/80 backdrop-blur-md border-b border-[#6519c2] md:border-slate-200 dark:border-white/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
          <div className="flex items-center gap-3">
              {/* Desktop Logo */}
              <div className="hidden md:flex items-center">
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
                  <Link href="/dashboard/rt" className="flex items-center">
                    <Image src="/logo-tata-waga.png" alt="Logo Tata Warga" width={100} height={32} className="h-7 w-auto object-contain" />
                  </Link>
                )}
              </div>
              
              {/* Mobile Logo (Always Dark/White text version for purple bg) */}
              <Link href="/dashboard/rt" className="flex items-center md:hidden">
                <Image src="/logo-tata-waga-dark.png" alt="Logo Tata Warga" width={140} height={36} className="h-9 w-auto object-contain drop-shadow-md" />
              </Link>
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
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 rounded-full text-white md:text-slate-600 dark:text-white/70 hover:bg-white/10 md:hover:bg-slate-100 dark:hover:bg-white/5 md:hover:text-slate-900 dark:hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                {hasNewNotifs && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm border-2 border-[#6519c2] md:border-white dark:border-[#141229]">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-w-[90vw] bg-white dark:bg-[#141229] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-lg dark:shadow-[0_0_15px_rgba(100,25,193,0.3)]">
                <div className="px-3 py-2.5 text-sm font-bold flex justify-between items-center border-b border-slate-100 dark:border-white/10">
                  <span>Pemberitahuan</span>
                </div>
                {localNotifs.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-slate-200 dark:text-white/10 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-white/50">Belum ada pemberitahuan</p>
                  </div>
                ) : (
                  <div className="max-h-[350px] overflow-y-auto">
                    {localNotifs.map((n) => (
                      <div key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)} className={`p-4 border-b border-slate-100 dark:border-white/5 transition-colors cursor-pointer ${n.isRead ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 opacity-70' : 'bg-[#6419c1]/5 dark:bg-[#6419c1]/10 hover:bg-[#6419c1]/10 dark:hover:bg-[#6419c1]/20'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${n.isRead ? 'font-medium text-slate-700 dark:text-white/80' : 'font-bold text-[#6419c1] dark:text-[#a064fa]'}`}>{n.title}</p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#6419c1] shrink-0 mt-1.5 ml-2"></span>}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-white/70 whitespace-pre-wrap leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-white/40 mt-2">{formatTime(n.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
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


      <div className="flex flex-1 overflow-hidden relative">

      
      {/* Sidebar - Desktop Only */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#141229] border-r border-slate-200 dark:border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(100,25,193,0.1)] transform transition-transform duration-300 ease-in-out md:translate-x-0 hidden md:flex flex-col`}>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
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
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden relative z-0 md:pl-0">
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6 flex flex-col">
          <div className="admin-content-wrapper flex-1">
             {children}
          </div>
          {/* Footer */}
          <footer className="mt-8 text-center text-xs text-slate-400 dark:text-white/40 pb-4 hidden md:block">
             {footerText}
          </footer>
        </div>
      </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#141229] border-t border-slate-200 dark:border-white/10 flex justify-around items-center px-2 py-2 pb-safe z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_24px_rgba(100,25,193,0.1)]">
        <Link href="/dashboard/rt" className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${pathname === '/dashboard/rt' ? 'text-[#6419c1] dark:text-[#a064fa]' : 'text-slate-500 dark:text-slate-400'}`}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link href="/dashboard/rt/warga" className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${pathname.startsWith('/dashboard/rt/warga') ? 'text-[#6419c1] dark:text-[#a064fa]' : 'text-slate-500 dark:text-slate-400'}`}>
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Warga</span>
        </Link>
        
        {/* Floating Action Button (FAB) */}
        <div className="relative -top-6 flex flex-col items-center justify-center">
          <button 
            onClick={() => setIsBottomSheetOpen(true)}
            className="w-14 h-14 bg-[#6419c1] rounded-full flex items-center justify-center shadow-lg shadow-[#6419c1]/30 text-yellow-400 hover:bg-[#7735d4] transition-colors border-4 border-slate-50 dark:border-black"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        <Link href="/dashboard/rt/surat" className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${pathname.startsWith('/dashboard/rt/surat') ? 'text-[#6419c1] dark:text-[#a064fa]' : 'text-slate-500 dark:text-slate-400'}`}>
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Surat</span>
        </Link>
        <Link href="/dashboard/rt/settings" className={`flex flex-col items-center p-2 rounded-xl min-w-[64px] ${pathname.startsWith('/dashboard/rt/settings') ? 'text-[#6419c1] dark:text-[#a064fa]' : 'text-slate-500 dark:text-slate-400'}`}>
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Pengaturan</span>
        </Link>
      </div>

      {/* MOBILE BOTTOM SHEET (TINDAKAN CEPAT) */}
      {isBottomSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsBottomSheetOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white dark:bg-[#141229] rounded-t-3xl shadow-2xl p-6 pt-8 animate-in slide-in-from-bottom-full duration-300 border-t border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setIsBottomSheetOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 text-center">Tindakan Cepat</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <Link href="/dashboard/rt/warga/create" onClick={() => setIsBottomSheetOpen(false)} className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tambah Warga</span>
              </Link>
              
              <Link href="/dashboard/rt/surat" onClick={() => setIsBottomSheetOpen(false)} className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Buat Surat</span>
              </Link>
              
              <Link href="/dashboard/rt/kas?action=create" onClick={() => setIsBottomSheetOpen(false)} className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Catat Kas</span>
              </Link>
            </div>
            
            <div className="mt-8 pb-4">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
