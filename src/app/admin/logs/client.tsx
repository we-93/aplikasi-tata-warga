"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Trash2, ChevronLeft, ChevronRight, Shield, User, Building2, Clock } from "lucide-react";
import { clearOldLogs } from "@/app/actions/logs";
import { toast } from "sonner";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  KAS_CREATED:       { label: "Kas Dibuat",        color: "bg-emerald-100 text-emerald-800" },
  KAS_DELETED:       { label: "Kas Dihapus",        color: "bg-red-100 text-red-800" },
  KAS_UPDATED:       { label: "Kas Diperbarui",     color: "bg-blue-100 text-blue-800" },
  NOTULEN_CREATED:   { label: "Notulen Dibuat",     color: "bg-purple-100 text-purple-800" },
  NOTULEN_DELETED:   { label: "Notulen Dihapus",    color: "bg-red-100 text-red-800" },
  WARGA_CREATED:     { label: "Warga Ditambah",     color: "bg-emerald-100 text-emerald-800" },
  WARGA_UPDATED:     { label: "Warga Diperbarui",   color: "bg-blue-100 text-blue-800" },
  WARGA_DELETED:     { label: "Warga Dihapus",      color: "bg-red-100 text-red-800" },
  SURAT_CREATED:     { label: "Surat Diterbitkan",  color: "bg-yellow-100 text-yellow-800" },
  INVOICE_APPROVED:  { label: "Invoice Disetujui",  color: "bg-emerald-100 text-emerald-800" },
  INVOICE_CANCELLED: { label: "Invoice Dibatalkan", color: "bg-red-100 text-red-800" },
  SUBSCRIPTION_ACTIVATED: { label: "Langganan Aktif", color: "bg-green-100 text-green-800" },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_LABELS[action];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta?.color ?? "bg-gray-100 text-gray-700"}`}>
      {meta?.label ?? action}
    </span>
  );
}

function RoleBadge({ role }: { role?: string }) {
  if (role === "SUPER_ADMIN") return <span className="text-xs bg-[#1b264f] text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Shield className="w-3 h-3" />Admin</span>;
  if (role === "TENANT_ADMIN") return <span className="text-xs bg-[#21b7b1]/10 text-[#21b7b1] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><User className="w-3 h-3" />RT</span>;
  return <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Sistem</span>;
}

export function AdminLogsClient({ data, currentPage }: { data: any; currentPage: number }) {
  const { logs, total, totalPages, tenants } = data;
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [filterTenant, setFilterTenant] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [isCleaning, setIsCleaning] = useState(false);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterTenant !== "all") params.set("tenantId", filterTenant);
    if (filterAction !== "all") params.set("action", filterAction);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = async (days: number) => {
    if (!confirm(`Hapus semua log lebih dari ${days} hari yang lalu?`)) return;
    setIsCleaning(true);
    const res = await clearOldLogs(days);
    if (res.success) {
      toast.success(`${res.deleted} entri log dihapus.`);
      router.refresh();
    } else {
      toast.error("Gagal membersihkan log.");
    }
    setIsCleaning(false);
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 text-center">
          <p className="text-4xl font-black text-[#6419c1] dark:text-[#a064fa]">{total.toLocaleString()}</p>
          <p className="text-sm font-semibold text-slate-500 dark:text-white/50 mt-2">Total Log Aktivitas</p>
        </div>
        <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 text-center">
          <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400">{tenants.length}</p>
          <p className="text-sm font-semibold text-slate-500 dark:text-white/50 mt-2">Tenant (RT) Aktif</p>
        </div>
        <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 text-center">
          <p className="text-4xl font-black text-orange-500 dark:text-orange-400">{totalPages}</p>
          <p className="text-sm font-semibold text-slate-500 dark:text-white/50 mt-2">Total Halaman</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
            <input 
              placeholder="Cari aksi, deskripsi, atau pengguna..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyFilter()} 
            />
          </div>
          <div className="w-[180px]">
            <Select value={filterTenant} onValueChange={(v) => setFilterTenant(v || "all")}>
              <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl focus:ring-[#6419c1] text-slate-900 dark:text-white"><SelectValue placeholder="Semua Tenant" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tenant / RT</SelectItem>
                <SelectItem value="none">Tanpa Tenant (Global)</SelectItem>
                {tenants.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={filterAction} onValueChange={(v) => setFilterAction(v || "all")}>
              <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl focus:ring-[#6419c1] text-slate-900 dark:text-white"><SelectValue placeholder="Semua Aksi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                {Object.entries(ACTION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <button className="flex items-center gap-2 bg-[#6419c1] text-white px-5 py-2.5 h-11 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold" onClick={applyFilter}><Search className="w-4 h-4" />Filter</button>
          <button className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white px-5 py-2.5 h-11 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm font-semibold border border-transparent dark:border-white/10" onClick={() => { setSearch(""); setFilterTenant("all"); setFilterAction("all"); router.push(pathname); }}>
            <RefreshCw className="w-4 h-4" />Reset
          </button>
          <button className="flex items-center gap-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-5 py-2.5 h-11 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/20 transition-all text-sm font-semibold border border-red-200 dark:border-red-500/20" onClick={() => handleClear(30)} disabled={isCleaning}>
            <Trash2 className="w-4 h-4" />{isCleaning ? "Menghapus..." : "Hapus >30 Hari"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] overflow-hidden">
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider w-48"><Clock className="w-3.5 h-3.5 inline mr-1" />Waktu</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider"><Building2 className="w-3.5 h-3.5 inline mr-1" />Tenant / RT</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider"><User className="w-3.5 h-3.5 inline mr-1" />Pengguna</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Aksi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-white/40 text-sm">Belum ada log aktivitas tercatat.</td></tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-white/50 font-mono font-medium">{formatTime(log.createdAt)}</td>
                  <td className="px-6 py-4">
                    {log.tenant ? (
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{log.tenant.name}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-white/40 italic text-xs font-semibold">Global / Admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {log.user ? (
                        <>
                          <RoleBadge role={log.user.role} />
                          <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{log.user.name}</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-white/40 font-semibold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">Sistem</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4"><ActionBadge action={log.action} /></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-white/60 text-sm max-w-xs truncate">{log.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500 dark:text-white/50">Halaman {currentPage} dari {totalPages} <span className="font-normal">({total} entri)</span></p>
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-1 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={currentPage <= 1}
              onClick={() => { const p = new URLSearchParams(window.location.search); p.set("page", String(currentPage - 1)); router.push(`${pathname}?${p}`); }}>
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <button 
              className="flex items-center gap-1 bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={currentPage >= totalPages}
              onClick={() => { const p = new URLSearchParams(window.location.search); p.set("page", String(currentPage + 1)); router.push(`${pathname}?${p}`); }}>
              Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
