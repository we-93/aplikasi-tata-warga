"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Clock, Activity } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  KAS_CREATED:      { label: "Kas Dibuat",       color: "bg-emerald-100 text-emerald-800" },
  KAS_DELETED:      { label: "Kas Dihapus",       color: "bg-red-100 text-red-800" },
  KAS_UPDATED:      { label: "Kas Diperbarui",    color: "bg-blue-100 text-blue-800" },
  NOTULEN_CREATED:  { label: "Notulen Dibuat",    color: "bg-purple-100 text-purple-800" },
  NOTULEN_DELETED:  { label: "Notulen Dihapus",   color: "bg-red-100 text-red-800" },
  WARGA_CREATED:    { label: "Warga Ditambah",    color: "bg-emerald-100 text-emerald-800" },
  WARGA_UPDATED:    { label: "Warga Diperbarui",  color: "bg-blue-100 text-blue-800" },
  WARGA_DELETED:    { label: "Warga Dihapus",     color: "bg-red-100 text-red-800" },
  SURAT_CREATED:    { label: "Surat Diterbitkan", color: "bg-yellow-100 text-yellow-800" },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_LABELS[action];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta?.color ?? "bg-gray-100 text-gray-700"}`}>
      {meta?.label ?? action}
    </span>
  );
}

export function RtLogsClient({ data, currentPage }: { data: any; currentPage: number }) {
  const { logs, total, totalPages } = data;
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterAction !== "all") params.set("action", filterAction);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-card border border-border-card-foreground rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-primary font-medium mb-1 text-sm">Total Aktivitas Tercatat</p>
          <p className="text-4xl font-bold">{total.toLocaleString()}</p>
        </div>
        <Activity className="w-12 h-12 text-primary/40" />
      </div>

      {/* Filter */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari aksi atau keterangan..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyFilter()}
          />
        </div>
        <Select value={filterAction} onValueChange={(v) => setFilterAction(v || "all")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Semua Aksi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="bg-card border border-border-card-foreground" onClick={applyFilter}>
          <Search className="w-4 h-4 mr-2" /> Filter
        </Button>
        <Button variant="outline" onClick={() => { setSearch(""); setFilterAction("all"); router.push(pathname); }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      {/* Log Timeline / Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3 text-left"><Clock className="w-3.5 h-3.5 inline mr-1" />Waktu</th>
              <th className="px-5 py-3 text-left">Pengguna</th>
              <th className="px-5 py-3 text-left">Aksi</th>
              <th className="px-5 py-3 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada aktivitas tercatat.</p>
                  <p className="text-xs mt-1">Setiap perubahan data (kas, warga, surat, notulen) akan muncul di sini.</p>
                </td>
              </tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground font-mono">
                  {formatTime(log.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-sm">
                  {log.user ? (
                    <span className="font-medium">{log.user.name}</span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Sistem</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs max-w-sm truncate">
                  {log.description || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-xs text-muted-foreground font-medium">
            Menampilkan <span className="text-foreground">{(currentPage - 1) * 20 + 1}</span> - <span className="text-foreground">{Math.min(currentPage * 20, total)}</span> dari <span className="text-foreground">{total}</span> aktivitas
          </p>
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { const p = new URLSearchParams(window.location.search); p.set("page", String(currentPage - 1)); router.push(`${pathname}?${p}`); }}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center px-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => { const p = new URLSearchParams(window.location.search); p.set("page", String(page)); router.push(`${pathname}?${p}`); }}
                      className={`h-8 w-8 p-0 rounded-lg font-medium text-xs transition-all ${
                        currentPage === page 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1.5 text-muted-foreground text-xs">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { const p = new URLSearchParams(window.location.search); p.set("page", String(currentPage + 1)); router.push(`${pathname}?${p}`); }}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
