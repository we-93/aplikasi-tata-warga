import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { 
  Users, FileText, BarChart3, Wallet, Bot, 
  Database, Bell, Activity, ArrowDownCircle, ArrowUpCircle 
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function RTDashboardPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  if (!tenantId) return <div>Akses Ditolak</div>;

  // 1. Fetch Tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  
  if (!tenant) return <div>Data Tenant Tidak Ditemukan</div>;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Format Tanggal Hari Ini
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  // 2. Fetch Stats Warga
  const totalWarga = await prisma.warga.count({ where: { tenantId } });
  const totalKK = await prisma.warga.count({ 
    where: { tenantId, hubunganKeluarga: 'KEPALA_KELUARGA' } 
  });

  // 3. Fetch Kas RT (Saldo, Pemasukan, Pengeluaran Bulan Ini)
  const allKas = await prisma.kasTransaction.findMany({ where: { tenantId } });
  
  let totalSaldo = 0;
  let totalPemasukanBulanIni = 0;
  let totalPengeluaranBulanIni = 0;

  allKas.forEach(k => {
    const amt = Number(k.amount);
    // Saldo Total
    if (k.type === "PEMASUKAN") totalSaldo += amt;
    else totalSaldo -= amt;

    // Bulan Ini
    if (k.date >= startOfMonth) {
      if (k.type === "PEMASUKAN") totalPemasukanBulanIni += amt;
      else totalPengeluaranBulanIni += amt;
    }
  });

  // Teks Selamat Datang (ambil nama tenant, contoh: "RT 01 / RW 02 Perumahan X")
  const rtName = tenant.name || "RT/RW";

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-6">
      
      {/* HEADER: Selamat Datang & Tanggal */}
      <div className="pt-2">
        <h1 className="text-2xl text-slate-800 dark:text-white">
          Selamat Datang, <br/>
          <span className="font-extrabold">{rtName}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-white/60 font-light mt-1">
          {todayFormatted}
        </p>
      </div>

      {/* CARD 1: KARTU TOTAL WARGA */}
      <div className="bg-gradient-to-br from-[#6419c1] to-[#a064fa] rounded-3xl p-6 text-white shadow-lg shadow-[#6419c1]/20 relative overflow-hidden">
        {/* Dekorasi Bulatan */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Data Penduduk</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold">{totalWarga}</h2>
              <span className="text-white/80 font-medium">Jiwa</span>
            </div>
            <div className="mt-2 inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Users className="w-3 h-3 mr-1.5" />
              {totalKK} Kepala Keluarga (KK)
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* CARD 2: KARTU KAS RT */}
      <div className="bg-gradient-to-br from-[#141229] to-[#2a264a] dark:from-[#1a1835] dark:to-[#0c0b21] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#6419c1]/30 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Total Saldo Kas RT</p>
          <h2 className="text-3xl font-extrabold mb-5">
            Rp {totalSaldo.toLocaleString('id-ID')}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <div className="flex items-center text-xs text-white/60 mb-1">
                <ArrowDownCircle className="w-3 h-3 mr-1 text-emerald-400" />
                Masuk (Bulan Ini)
              </div>
              <p className="font-bold text-sm text-emerald-400">
                Rp {totalPemasukanBulanIni.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <div className="flex items-center text-xs text-white/60 mb-1">
                <ArrowUpCircle className="w-3 h-3 mr-1 text-red-400" />
                Keluar (Bulan Ini)
              </div>
              <p className="font-bold text-sm text-red-400">
                Rp {totalPengeluaranBulanIni.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MENU UTAMA (GRID 4x2) */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Menu Utama</h3>
        
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          
          <Link href="/dashboard/rt/warga" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Data<br/>Warga</span>
          </Link>

          <Link href="/dashboard/rt/surat" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Surat<br/>Surat</span>
          </Link>

          <Link href="/dashboard/rt/warga/statistik" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Statistik<br/>Warga</span>
          </Link>

          <Link href="/dashboard/rt/kas" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Kas<br/>RT</span>
          </Link>

          <Link href="/dashboard/rt/ai/chat" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/20 text-[#6419c1] dark:text-[#a064fa] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Chat<br/>AI</span>
          </Link>

          <Link href="/dashboard/rt/notulen/rapat" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Notulen<br/>Rapat</span>
          </Link>

          <Link href="/dashboard/rt/notulen/pengumuman" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Info /<br/>Pengumuman</span>
          </Link>

          <Link href="/dashboard/rt/logs" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center">Log<br/>Aktivitas</span>
          </Link>

        </div>
      </div>
      
    </div>
  );
}
