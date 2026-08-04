"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar({ logoUrl, logoUrlDark, menus, session }: { logoUrl?: string | null, logoUrlDark?: string | null, menus?: any, session?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Fallback menus if not provided from database
  const navLinks = menus || [
    { name: "Beranda", href: "/#home" },
    { name: "Fitur", href: "/#fitur" },
    { name: "Harga", href: "/#harga" },
    { name: "Tutorial", href: "https://docs.tatawarga.id" },
    { name: "Kontak", href: "/#kontak" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md border-border shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              {logoUrl || logoUrlDark ? (
                <>
                  {(!logoUrlDark || !isDark) && logoUrl && (
                    <img src={logoUrl} alt="Tata Warga Logo" className="h-8 w-auto" />
                  )}
                  {isDark && logoUrlDark && (
                    <img src={logoUrlDark} alt="Tata Warga Logo" className="h-8 w-auto" />
                  )}
                </>
              ) : (
                <span className="text-xl font-bold tracking-tight text-primary">
                  Tata Warga
                </span>
              )}
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link: any) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-white/80 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <div className="ml-4 flex items-center gap-4">
                <ThemeToggle />
                {session?.user ? (
                  <Link 
                    href="/admin" 
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6419c1] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] transition-colors hover:bg-[#7735d4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6419c1]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/auth/login" 
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6419c1] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] transition-colors hover:bg-[#7735d4] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6419c1]"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Buka menu utama</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 bg-background">
            {navLinks.map((link: any) => (
              <Link
                key={link.name}
                href={link.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 pt-4 pb-2 border-t border-slate-200 dark:border-white/10 mt-2">
              {session?.user ? (
                <Link 
                  href="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-[#6419c1] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] transition-colors hover:bg-[#7735d4]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link 
                  href="/auth/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-[#6419c1] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] transition-colors hover:bg-[#7735d4]"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
