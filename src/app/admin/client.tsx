"use client";

import { useState } from "react";
import { 
  Users, Activity, CreditCard, MessageSquare, Bot, 
  TrendingUp, TrendingDown, Clock, Zap, FileText,
  Calendar, Download, Users2, CheckCircle, Wallet, SlidersHorizontal, Search, MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalTenant: number; totalTenantGrowth: number;
  rtAktif: number; rtAktifGrowth: number;
  totalSurat: number; totalSuratGrowth: number;
  totalWarga: number; totalWargaGrowth: number;
  recentTenants: any[];
  growthMonthly: any[];
  growthYearly: any[];
  recentActivities: any[];
  filterMonth?: number;
  filterYear?: number;
}

const PIE_COLORS = ['#6419c1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

export function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const d = data;
  const [chartMode, setChartMode] = useState<"Bulanan" | "Tahunan">("Bulanan");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const handleExport = () => {
    const exportData = data.recentTenants.map(t => ({
      "Nama RT": t.name,
      "Tanggal Daftar": formatDate(new Date(t.createdAt)),
      "Status": t.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrasi RT");
    
    // Summary
    const summaryData = [
      { Metric: "Total RT", Value: data.totalTenant },
      { Metric: "RT Aktif", Value: data.rtAktif },
      { Metric: "Total Warga", Value: data.totalWarga }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, "Ringkasan");

    XLSX.writeFile(workbook, `Laporan_Tata_Warga_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={`${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'} text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} 
        {Math.abs(value)}%
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">OVERVIEW</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-white/80 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-white/50" />
            <span>{formatDate(new Date())}</span>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 bg-[#6419c1] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-xs md:text-sm font-semibold whitespace-nowrap">
            <Download className="w-4 h-4" />
            <span>Ekspor Laporan</span>
          </button>
        </div>
      </div>

      {/* Statistical Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#141229] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(100,25,193,0.25)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#6419c1]/10 dark:bg-[#6419c1]/20 flex items-center justify-center text-[#6419c1] dark:text-[#a064fa]"><Users2 className="w-5 h-5" /></div>
            <GrowthBadge value={d.totalTenantGrowth} />
          </div>
          <p className="text-slate-500 dark:text-white/60 text-sm font-medium">Total RT</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{d.totalTenant.toLocaleString("id-ID")}</h3>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#141229] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(100,25,193,0.25)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400"><CheckCircle className="w-5 h-5" /></div>
            <GrowthBadge value={d.rtAktifGrowth} />
          </div>
          <p className="text-slate-500 dark:text-white/60 text-sm font-medium">RT Aktif</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{d.rtAktif.toLocaleString("id-ID")}</h3>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#141229] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(100,25,193,0.25)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-700/20 flex items-center justify-center text-orange-600 dark:text-orange-500"><FileText className="w-5 h-5" /></div>
            <GrowthBadge value={d.totalSuratGrowth} />
          </div>
          <p className="text-slate-500 dark:text-white/60 text-sm font-medium">Total Surat</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{d.totalSurat.toLocaleString("id-ID")}</h3>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#141229] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(100,25,193,0.25)] transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#6419c1]/10 dark:bg-[#6419c1]/20 flex items-center justify-center text-[#6419c1] dark:text-[#a064fa]"><Users className="w-5 h-5" /></div>
            <GrowthBadge value={d.totalWargaGrowth} />
          </div>
          <p className="text-slate-500 dark:text-white/60 text-sm font-medium">Total Warga</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{d.totalWarga.toLocaleString("id-ID")}</h3>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Large Growth Area */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8 flex flex-col">
          
          <div className="bg-white dark:bg-[#141229] p-5 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] h-[400px] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h4 className="text-lg font-bold">Tren Pertumbuhan RT</h4>
              <div className="flex gap-2 self-start sm:self-auto">
                <button 
                  onClick={() => setChartMode("Bulanan")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${chartMode === "Bulanan" ? "bg-[#6419c1]/10 dark:bg-[#6419c1]/20 text-[#6419c1] dark:text-[#a064fa]" : "text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                >
                  Bulanan
                </button>
                <button 
                  onClick={() => setChartMode("Tahunan")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${chartMode === "Tahunan" ? "bg-[#6419c1]/10 dark:bg-[#6419c1]/20 text-[#6419c1] dark:text-[#a064fa]" : "text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                >
                  Tahunan
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartMode === "Bulanan" ? d.growthMonthly : d.growthYearly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px' }}
                    itemStyle={{ color: '#a064fa' }}
                  />
                  <Line type="monotone" dataKey="RT" stroke="#a064fa" strokeWidth={3} dot={{ fill: '#a064fa', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column for Recent Activity */}
        <div className="bg-white dark:bg-[#141229] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">Aktivitas Terbaru</h4>
            <Link href="/admin/logs" className="text-[#6419c1] dark:text-[#a064fa] text-xs font-bold hover:underline">Lihat Semua</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {d.recentActivities.length === 0 ? (
              <div className="flex flex-col h-full justify-center items-center opacity-50">
                <Activity className="w-8 h-8 text-slate-300 dark:text-white/30 mb-2" />
                <p className="text-xs text-slate-500 dark:text-white/50">Belum ada aktivitas.</p>
              </div>
            ) : (
              d.recentActivities.map((act: any) => (
                <div key={act.id} className="relative pl-4 border-l-2 border-[#6419c1]/30 pb-4 last:border-transparent last:pb-0">
                  <div className="absolute w-2 h-2 rounded-full bg-[#6419c1] dark:bg-[#a064fa] -left-[5px] top-1.5 shadow-[0_0_5px_#a064fa]"></div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white/90">{act.action}</p>
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-1 line-clamp-2">{act.description}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] font-medium text-slate-400 dark:text-white/40">
                    <span>{act.tenantName} - {act.userName}</span>
                    <span>{formatTimeAgo(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modern Table */}
      <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-lg font-bold">Registrasi RT Terbaru</h4>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/40" />
              <input 
                className="w-full sm:w-auto pl-9 pr-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-[#6419c1] focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30" 
                placeholder="Cari nama RT" 
                type="text" 
              />
            </div>
          </div>
        </div>
        
        {/* Table Wrapper for Horizontal Scroll */}
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NAMA RT / TENANT</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">TANGGAL</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {d.recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-white/40 text-sm">Belum ada RT terdaftar.</td>
                </tr>
              ) : (
                d.recentTenants.map((t: any) => (
                  <tr key={t.id} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6419c1]/10 dark:bg-[#6419c1]/20 flex items-center justify-center text-[#6419c1] dark:text-[#a064fa] font-bold text-xs uppercase shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold whitespace-nowrap text-slate-900 dark:text-white">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/60 whitespace-nowrap">{formatDate(new Date(t.createdAt))}</td>
                    <td className="px-6 py-4">
                      {t.status === "AKTIF" ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/20">Active</span>
                      ) : t.status === "PENDING" ? (
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold border border-orange-200 dark:border-orange-500/20">Pending</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-200 dark:border-red-500/20">Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/data/rts/${t.id}`} className="text-[#6419c1] dark:text-[#a064fa] text-xs font-bold hover:underline">Kelola Kredit</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
