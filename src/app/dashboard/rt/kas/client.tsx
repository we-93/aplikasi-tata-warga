"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, Plus, Trash2, Wallet, ArrowDownRight, ArrowUpRight,
  FileDown, Pencil, Search, Filter, FileSpreadsheet, FileText, Upload, ChevronDown, ChevronLeft, ChevronRight,
  Bot, Copy, Save
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import { createKasTransaction, deleteKasTransaction, updateKasTransaction } from "@/app/actions/kas";
import { importKasBulk } from "@/app/actions/kas-excel";
import { generateAiReport } from "@/app/actions/ai";
import { terbitkanPengumuman, hapusPengumuman } from "@/app/actions/pengumuman";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tx = {
  id: string; type: "PEMASUKAN" | "PENGELUARAN";
  amount: number; category: string; description: string | null;
  date: string; createdAt: string;
};
type ChartPoint = { label: string; pemasukan: number; pengeluaran: number };
type FormState = { type: "PEMASUKAN" | "PENGELUARAN"; amount: string; category: string; description: string; date: string };

const emptyForm = (): FormState => ({
  type: "PEMASUKAN", amount: "", category: "", description: "",
  date: new Date().toISOString().split("T")[0]
});

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// ─── Chart Component ────────────────────────
function KasChart({ data, title }: { data: ChartPoint[], title: string }) {
  const formatK = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "jt";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "rb";
    return n.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border p-3 rounded-lg shadow-md text-sm">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: Rp {entry.value.toLocaleString("id-ID")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-lg mb-6">📊 {title}</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#666" }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={formatK}
              tick={{ fontSize: 12, fill: "#666" }}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="pemasukan" name="Pemasukan" fill="#6519c2" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function KasClient({ 
  initialSummary, 
  initialTransactions, 
  chartData,
  initialPengumuman = []
}: { 
  initialSummary: any; 
  initialTransactions: Tx[]; 
  chartData: ChartPoint[];
  initialPengumuman?: any[];
}) {
  const [transactions, setTransactions] = useState<Tx[]>(initialTransactions);
  const [summary] = useState(initialSummary);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editTarget, setEditTarget] = useState<Tx | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Report State
  const [reportForm, setReportForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [reportResult, setReportResult] = useState("");
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pengumumans, setPengumumans] = useState<any[]>(initialPengumuman);

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setReportResult("");
    
    const res = await generateAiReport(reportForm.month, reportForm.year);
    if (res.success) {
      setReportResult(res.text);
      toast.success("Draf laporan berhasil dibuat!");
    } else {
      toast.error(res.error);
    }
    setIsReportLoading(false);
  };

  const handlePublishReport = async () => {
    if (!reportResult) return;
    setIsPublishing(true);
    const id = toast.loading("Menerbitkan laporan ke pengumuman...");
    const monthName = new Date(0, reportForm.month - 1).toLocaleString('id-ID', { month: 'long' });
    const title = `Laporan Kas Bulan ${monthName} ${reportForm.year}`;
    
    const res = await terbitkanPengumuman({ title, content: reportResult });
    if (res.success) {
      toast.success("Laporan berhasil diterbitkan ke Dashboard RT!", { id });
      
      const newP = {
        id: Math.random().toString(),
        title,
        content: reportResult,
        createdAt: new Date().toISOString()
      };
      setPengumumans([newP, ...pengumumans]);
      setReportResult("");
    } else {
      toast.error(res.error || "Gagal menerbitkan laporan", { id });
    }
    setIsPublishing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Teks disalin ke clipboard");
  };

  // Filter state
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  const [searchQ, setSearchQ] = useState("");
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterType, setFilterType] = useState("all");

  const formatRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  // ── Open dialog ──────────────────────────────────────────────────────────
  const openCreate = () => { setEditTarget(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (tx: Tx) => {
    setEditTarget(tx);
    setForm({
      type: tx.type, amount: String(tx.amount), category: tx.category,
      description: tx.description || "", date: new Date(tx.date).toISOString().split("T")[0]
    });
    setDialogOpen(true);
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.amount || !form.category || !form.date) return toast.error("Nominal, kategori, dan tanggal wajib diisi");
    setIsSaving(true);
    try {
      const payload = { type: form.type, amount: Number(form.amount), category: form.category, description: form.description, date: new Date(form.date) };
      const res = editTarget
        ? await updateKasTransaction(editTarget.id, payload)
        : await createKasTransaction(payload);

      if (res.success) {
        toast.success(editTarget ? "Transaksi berhasil diperbarui!" : "Transaksi kas berhasil dicatat!");
        setDialogOpen(false);
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    const res = await deleteKasTransaction(id);
    if (res.success) { toast.success("Transaksi dihapus."); setTransactions(prev => prev.filter(t => t.id !== id)); }
    else toast.error(res.error);
  };

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      
      const monthMatch = filterMonth === "all" || m === filterMonth;
      const yearMatch = filterYear === "all" || y === filterYear;
      const typeMatch = filterType === "all" || t.type === filterType;
      const searchMatch = !searchQ ||
        t.category.toLowerCase().includes(searchQ.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(searchQ.toLowerCase());
      return monthMatch && yearMatch && typeMatch && searchMatch;
    });
  }, [transactions, filterMonth, filterYear, filterType, searchQ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ── Dynamic Chart Data ──────────────────────────────────────────────────
  const dynamicChartData = useMemo(() => {
    if (filterMonth !== "all" && filterYear !== "all") {
      // Group by Week
      const weeks = Array.from({ length: 5 }, (_, i) => ({
        label: `Minggu ${i + 1}`, pemasukan: 0, pengeluaran: 0
      }));
      filtered.forEach(t => {
        const d = new Date(t.date).getDate();
        const weekIdx = Math.min(Math.floor((d - 1) / 7), 4);
        if (t.type === "PEMASUKAN") weeks[weekIdx].pemasukan += t.amount;
        if (t.type === "PENGELUARAN") weeks[weekIdx].pengeluaran += t.amount;
      });
      return weeks;
    } else if (filterYear !== "all") {
      // Group by Month
      const months = Array.from({ length: 12 }, (_, i) => ({
        label: new Date(2000, i, 1).toLocaleString('id-ID', { month: 'short' }), pemasukan: 0, pengeluaran: 0
      }));
      filtered.forEach(t => {
        const m = new Date(t.date).getMonth();
        if (t.type === "PEMASUKAN") months[m].pemasukan += t.amount;
        if (t.type === "PENGELUARAN") months[m].pengeluaran += t.amount;
      });
      return months;
    } else {
      // Group by Year
      const yearMap = new Map<string, ChartPoint>();
      filtered.forEach(t => {
        const y = new Date(t.date).getFullYear().toString();
        if (!yearMap.has(y)) yearMap.set(y, { label: y, pemasukan: 0, pengeluaran: 0 });
        const entry = yearMap.get(y)!;
        if (t.type === "PEMASUKAN") entry.pemasukan += t.amount;
        if (t.type === "PENGELUARAN") entry.pengeluaran += t.amount;
      });
      const res = Array.from(yearMap.values()).sort((a, b) => a.label.localeCompare(b.label));
      return res.length > 0 ? res : [{ label: "-", pemasukan: 0, pengeluaran: 0 }];
    }
  }, [filtered, filterMonth, filterYear]);

  const chartTitle = filterMonth !== "all" 
    ? `Arus Kas ${new Date(Number(filterYear), Number(filterMonth)-1, 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}` 
    : filterYear !== "all" 
      ? `Arus Kas Tahun ${filterYear}`
      : "Arus Kas Keseluruhan";

  // ── Export Excel (Menggunakan XLSX) ────────────────────────────
  const exportExcel = () => {
    if (filtered.length === 0) return toast.error("Tidak ada data untuk diekspor");
    
    const dataToExport = filtered.map(t => ({
      "Tanggal": new Date(t.date).toLocaleDateString("id-ID"),
      "Tipe": t.type,
      "Kategori": t.category,
      "Keterangan": t.description || "",
      "Nominal": t.amount
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Kas");
    XLSX.writeFile(wb, `Laporan_Kas_RT_${new Date().getTime()}.xlsx`);
  };

  // ── Import Excel ────────────────────────────────────────────────────────
  const handleDownloadTemplateKas = () => {
    const templateData = [
      {
        "Tanggal": "2026-08-01",
        "Tipe": "PEMASUKAN",
        "Kategori": "Iuran Bulanan",
        "Keterangan": "Iuran Pak Budi",
        "Nominal": 50000
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Kas");
    XLSX.writeFile(wb, `Template_Import_Kas.xlsx`);
  };

  const handleFileUploadKas = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const formattedData = jsonData.map(row => ({
        date: row["Tanggal"] || row["tanggal"] || "",
        type: String(row["Tipe"] || row["tipe"] || ""),
        category: String(row["Kategori"] || row["kategori"] || ""),
        description: String(row["Keterangan"] || row["keterangan"] || ""),
        amount: row["Nominal"] || row["nominal"] || 0
      }));

      if (formattedData.length === 0) {
        toast.error("Tidak ada data valid yang ditemukan.");
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const res = await importKasBulk(formattedData);
      if (res.success) {
        toast.success(res.message);
        setImportDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file Excel.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Export PDF (print-friendly window) ───────────────────────────────────
  const exportPDF = () => {
    if (filtered.length === 0) return toast.error("Tidak ada data untuk diekspor");
    const totalPemasukan = filtered.filter(t => t.type === "PEMASUKAN").reduce((s, t) => s + t.amount, 0);
    const totalPengeluaran = filtered.filter(t => t.type === "PENGELUARAN").reduce((s, t) => s + t.amount, 0);
    const rows = filtered.map(t => `
      <tr>
        <td>${new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
        <td><span class="${t.type === "PEMASUKAN" ? "badge-in" : "badge-out"}">${t.type}</span></td>
        <td>${t.category}</td>
        <td>${t.description || "-"}</td>
        <td class="amount ${t.type === "PEMASUKAN" ? "green" : "red"}">${t.type === "PEMASUKAN" ? "+" : "-"}${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(t.amount)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Laporan Kas RT</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 24px; }
  h1 { color: #1b264f; margin-bottom: 4px; }
  .sub { color: #666; margin-bottom: 20px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #1b264f; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 12px; }
  tr:nth-child(even) { background: #f9f9f9; }
  .badge-in { background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:12px;font-size:11px; }
  .badge-out { background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:12px;font-size:11px; }
  .amount { font-weight: 600; }
  .green { color: #059669; }
  .red { color: #dc2626; }
  .summary { display:flex;gap:24px;margin-top:20px;padding:16px;background:#f0f9ff;border-radius:8px; }
  .summary div { flex:1; }
  .summary .label { font-size:11px;color:#666;margin-bottom:2px; }
  .summary .val { font-size:16px;font-weight:700; }
  @media print { button { display:none; } }
</style></head><body>
<h1>📋 Laporan Kas RT</h1>
<div class="sub">Dicetak pada: ${new Date().toLocaleString("id-ID")}</div>
<div class="summary">
  <div><div class="label">Total Pemasukan</div><div class="val" style="color:#059669">${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(totalPemasukan)}</div></div>
  <div><div class="label">Total Pengeluaran</div><div class="val" style="color:#dc2626">${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(totalPengeluaran)}</div></div>
  <div><div class="label">Selisih (Saldo Periode Ini)</div><div class="val">${new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(totalPemasukan-totalPengeluaran)}</div></div>
</div>
<table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Keterangan</th><th>Nominal</th></tr></thead>
<tbody>${rows}</tbody></table>
<script>window.onload=()=>window.print();</script>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1b264f] dark:text-foreground">Manajemen Kas RT</h1>
          <p className="text-muted-foreground mt-1">Kelola pencatatan uang kas warga, pemasukan, dan pengeluaran.</p>
        </div>
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-[#6519c2] text-[#6519c2] hover:bg-[#6519c2]/5 hover:text-[#6519c2]" onClick={() => setImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import Excel
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex-1 md:flex-none">
              <FileDown className="w-4 h-4 mr-2" /> Export <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2 text-[#6519c2]" /> Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF}>
                <FileText className="w-4 h-4 mr-2 text-red-500" /> PDF / Cetak
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAiReportOpen(true)}>
                <Bot className="w-4 h-4 mr-2 text-emerald-600" /> Analisis AI (Laporan)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 md:flex-none" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Catat Kas
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border-card-foreground rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary font-medium mb-1 text-sm">Total Saldo Saat Ini</p>
              <h3 className="text-3xl font-bold">{formatRp(summary.saldoSaatIni)}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl"><Wallet className="w-6 h-6 text-foreground" /></div>
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1 text-sm">Pemasukan Bulan Ini</p>
              <h3 className="text-2xl font-bold text-[#6519c2]">{formatRp(summary.pemasukanBulanIni)}</h3>
            </div>
            <div className="p-3 bg-[#6519c2]/10 rounded-xl"><ArrowDownRight className="w-6 h-6 text-[#6519c2]" /></div>
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1 text-sm">Pengeluaran Bulan Ini</p>
              <h3 className="text-2xl font-bold text-red-600">{formatRp(summary.pengeluaranBulanIni)}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-xl"><ArrowUpRight className="w-6 h-6 text-red-600" /></div>
          </div>
        </div>
      </div>

      {/* Toolbar: Filter + Search + Export + Add */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="font-semibold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" /> Riwayat Transaksi
            {(searchQ || filterMonth !== "all" || filterYear !== "all" || filterType !== "all") && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {filtered.length} hasil
              </span>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kategori / keterangan..."
              className="pl-9"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>
          <Select value={filterMonth} onValueChange={(v) => setFilterMonth(v || "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              <SelectItem value="01">Januari</SelectItem>
              <SelectItem value="02">Februari</SelectItem>
              <SelectItem value="03">Maret</SelectItem>
              <SelectItem value="04">April</SelectItem>
              <SelectItem value="05">Mei</SelectItem>
              <SelectItem value="06">Juni</SelectItem>
              <SelectItem value="07">Juli</SelectItem>
              <SelectItem value="08">Agustus</SelectItem>
              <SelectItem value="09">September</SelectItem>
              <SelectItem value="10">Oktober</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">Desember</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterYear} onValueChange={(v) => setFilterYear(v || "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {Array.from({ length: 5 }).map((_, i) => {
                const y = (new Date().getFullYear() - i).toString();
                return <SelectItem key={y} value={y}>{y}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v || "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="PEMASUKAN">Pemasukan</SelectItem>
              <SelectItem value="PENGELUARAN">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <KasChart data={dynamicChartData} title={chartTitle} />

      {/* Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-right">Nominal</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  {searchQ || filterMonth !== "all" || filterYear !== "all" || filterType !== "all"
                    ? "Tidak ada transaksi yang sesuai filter."
                    : "Belum ada transaksi kas yang dicatat."}
                </td></tr>
              ) : currentData.map(t => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${t.type === "PEMASUKAN" ? "bg-[#6519c2]/10 text-[#6519c2]" : "bg-red-100 text-red-800"}`}>
                      {t.type === "PEMASUKAN" ? "↓" : "↑"} {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{t.description || "-"}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${t.type === "PEMASUKAN" ? "text-[#6519c2]" : "text-red-600"}`}>
                    {t.type === "PEMASUKAN" ? "+" : "-"}{formatRp(t.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => openEdit(t)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 bg-muted/30 border-t flex justify-between text-sm text-muted-foreground overflow-x-auto min-w-[600px] md:min-w-0">
            <span>Total {filtered.length} transaksi</span>
            <span className="whitespace-nowrap">
              <span className="text-[#6519c2] font-medium mr-4">
                +{formatRp(filtered.filter(t => t.type === "PEMASUKAN").reduce((s, t) => s + t.amount, 0))}
              </span>
              <span className="text-red-500 font-medium">
                -{formatRp(filtered.filter(t => t.type === "PENGELUARAN").reduce((s, t) => s + t.amount, 0))}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground font-medium">
            Menampilkan <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> dari <span className="text-foreground">{filtered.length}</span> transaksi
          </p>
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
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
                      onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Transaksi Kas" : "Catat Transaksi Kas Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipe Transaksi</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEMASUKAN">Pemasukan (Kas Bertambah)</SelectItem>
                  <SelectItem value="PENGELUARAN">Pengeluaran (Kas Berkurang)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input type="number" min={0} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Iuran Warga, Sumbangan, Perbaikan, dll." />
            </div>
            <div className="space-y-2">
              <Label>Keterangan (Opsional)</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Dari Blok A-1, Beli sapu, dll." />
            </div>
            <Button className="w-full bg-card border border-border-card-foreground" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editTarget ? "Simpan Perubahan" : "Simpan Transaksi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Transaksi Kas</DialogTitle>
            <DialogDescription>
              Unggah file Excel untuk memasukkan banyak data transaksi kas sekaligus ke dalam sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Button variant="outline" className="w-full justify-start text-[#6519c2] border-[#6519c2]/30 bg-[#6519c2]/5 hover:bg-[#6519c2]/5 hover:text-[#6519c2]" onClick={handleDownloadTemplateKas}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Template Excel
              </Button>
              <p className="text-xs text-muted-foreground ml-1">Unduh template agar kolom data sesuai dengan sistem.</p>
            </div>

            <div className="space-y-2">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUploadKas}
              />
              <Button 
                className="w-full bg-[#6519c2] hover:bg-[#6519c2]/90 text-white" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? "Mengimpor..." : "Pilih File & Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAiReportOpen} onOpenChange={setIsAiReportOpen}>
        <DialogContent className="max-w-4xl h-[90vh] md:h-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Laporan Analisis AI</DialogTitle>
            <DialogDescription>
              Buat dan terbitkan laporan kas bulanan otomatis menggunakan AI untuk bagikan ke warga.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select value={reportForm.month.toString()} onValueChange={(v) => setReportForm({...reportForm, month: parseInt(v || "1")})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tahun</Label>
                <Input type="number" value={reportForm.year} onChange={e => setReportForm({...reportForm, year: parseInt(e.target.value)})} />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4" onClick={handleGenerateReport} disabled={isReportLoading}>
                {isReportLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                Buat Laporan AI
              </Button>
            </div>

            <div className="flex flex-col min-h-[400px]">
              {reportResult ? (
                <div className="flex-1 flex flex-col gap-4">
                  <Textarea 
                    value={reportResult} 
                    onChange={(e) => setReportResult(e.target.value)}
                    className="flex-1 min-h-[300px] resize-none font-mono text-sm leading-relaxed" 
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(reportResult)} className="flex-1 bg-card border border-border-card-foreground">
                      <Copy className="w-4 h-4 mr-2" /> Salin
                    </Button>
                    <Button onClick={handlePublishReport} disabled={isPublishing} className="flex-1 bg-primary text-primary-foreground">
                      {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Terbitkan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-center px-8 border border-dashed rounded-xl">
                  Pilih bulan dan tahun, lalu AI akan merangkum seluruh transaksi kas Anda menjadi laporan naratif yang siap dibagikan ke warga.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
