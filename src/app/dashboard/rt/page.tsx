import { DashboardHeaderClient } from "@/components/rt/dashboard-header-client";
import { DashboardCharts } from "@/components/rt/dashboard-charts";
import { Users, FileText, MessageSquare, Sparkles, ChevronRight, Plus, CheckCircle2, UserPlus, Info, CreditCard, Bot } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function RTDashboardPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  if (!tenantId) return <div>Akses Ditolak</div>;

  // 1. Fetch Tenant & Current Product
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  
  if (!tenant) return <div>Data Tenant Tidak Ditemukan</div>;

  const currentProduct = await prisma.product.findFirst({
    where: { name: tenant.subscriptionPlan }
  });
  
  const planName = tenant.subscriptionPlan || "Free Plan";
  let statusText = "Inactive";
  if (tenant.status === "AKTIF") statusText = "Active";
  else if (tenant.status === "PENDING") statusText = "Pending";
  else if (tenant.status === "KADALUARSA") statusText = "Expired";

  let planExpiry = "Selamanya";
  if (tenant.activeUntil) {
    planExpiry = new Date(tenant.activeUntil).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  } else if (tenant.status === "PENDING" && currentProduct?.masaAktifBulan) {
    const future = new Date();
    future.setMonth(future.getMonth() + currentProduct.masaAktifBulan);
    planExpiry = future.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) + " (Estimasi)";
  }

  // 2. Fetch Stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalWarga = await prisma.warga.count({ where: { tenantId } });
  const wargaBaru = await prisma.warga.count({ where: { tenantId, createdAt: { gte: startOfMonth } } });
  const wargaGrowth = totalWarga > 0 ? Math.round((wargaBaru / totalWarga) * 100) : 0;

  const totalSurat = await prisma.suratArsip.count({ where: { tenantId, createdAt: { gte: startOfMonth } } });
  const baseSurat = currentProduct?.maxSurat === -1 ? 999999 : (currentProduct?.maxSurat ?? 20);
  const suratLimit = baseSurat + tenant.addonMaxSurat; 

  const notulens = await prisma.notulenAi.findMany({ where: { tenantId, createdAt: { gte: startOfMonth } } });
  const aiChatLogs = await prisma.activityLog.findMany({ where: { tenantId, action: { in: ["AI_CHAT_USAGE", "AI_BROADCAST_USAGE", "AI_REPORT_USAGE", "AI_OCR_USAGE", "AI_AUDIO_USAGE", "AI_DRAFT_USAGE"] }, createdAt: { gte: startOfMonth } } });
  const aiChatUsed = aiChatLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0);
  const aiUsed = notulens.reduce((acc, curr) => acc + curr.tokenUsed, 0) + aiChatUsed;
  
  const baseAi = currentProduct?.maxAiToken === -1 ? 999999 : (currentProduct?.maxAiToken ?? 2000);
  const aiLimit = baseAi + tenant.addonMaxAiToken;

  // 3. Fetch Kas RT (Last 6 Months & Total)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const kasData = await prisma.kasTransaction.findMany({
    where: { tenantId, date: { gte: sixMonthsAgo } },
    orderBy: { date: 'asc' }
  });
  
  const allKas = await prisma.kasTransaction.findMany({ where: { tenantId } });
  const serializedAllKas = allKas.map(k => ({
    ...k,
    amount: Number(k.amount),
    date: k.date.toISOString(),
    createdAt: k.createdAt.toISOString(),
    updatedAt: k.updatedAt.toISOString(),
  }));
  let totalSaldo = 0;
  let totalPemasukanBulanIni = 0;
  let totalPengeluaranBulanIni = 0;

  allKas.forEach(k => {
    const amt = Number(k.amount);
    if (k.type === "PEMASUKAN") totalSaldo += amt;
    else totalSaldo -= amt;
  });

  // Group chart data by month (Jan, Feb, Mar, etc)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const chartMap = new Map();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartMap.set(`${d.getFullYear()}-${d.getMonth()}`, {
      month: months[d.getMonth()],
      pemasukan: 0,
      pengeluaran: 0,
      net: 0
    });
  }

  kasData.forEach(k => {
    const amt = Number(k.amount);
    const key = `${k.date.getFullYear()}-${k.date.getMonth()}`;
    if (chartMap.has(key)) {
      const entry = chartMap.get(key);
      if (k.type === "PEMASUKAN") entry.pemasukan += amt;
      else entry.pengeluaran += amt;
      entry.net = entry.pemasukan - entry.pengeluaran;
    }
    
    // Bulan ini
    if (k.date >= startOfMonth) {
      if (k.type === "PEMASUKAN") totalPemasukanBulanIni += amt;
      else totalPengeluaranBulanIni += amt;
    }
  });

  const kasChartData = Array.from(chartMap.values());
  const kasSummary = {
    pemasukan: totalPemasukanBulanIni,
    pengeluaran: totalPengeluaranBulanIni,
    net: totalSaldo
  };

  // 4. Fetch Surat Terbaru
  const suratTerbaru = await prisma.suratArsip.findMany({
    where: { tenantId },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { warga: true, template: true }
  });

  // 5. Fetch Pengumuman Terkini
  const pengumumanTerkini = await prisma.pengumuman.findMany({
    where: { tenantId },
    take: 2,
    orderBy: { createdAt: 'desc' }
  });

  // 6. Fetch Aktivitas Terbaru
  const aktivitasTerbaru = await prisma.activityLog.findMany({
    where: { tenantId },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">Overview</h1>
          <p className="text-muted-foreground mt-1">Ringkasan aktivitas dan status langganan RT Anda.</p>
        </div>
        <DashboardHeaderClient kasData={serializedAllKas as any} />
      </div>

      {/* Subscription Banner */}
      <div className="bg-[#6419c1] text-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-lg shadow-[#6419c1]/20">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-1">STATUS LANGGANAN</p>
            <h2 className="text-2xl font-bold">{statusText} - {planName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden md:block">
            <p className="text-white/70 text-xs">Berlaku hingga</p>
            <p className="font-bold">{planExpiry}</p>
          </div>
          <Button variant="secondary" className="bg-white text-[#6419c1] hover:bg-white/90 font-bold px-6 rounded-xl" asChild>
            <Link href="/dashboard/rt/billing">Kelola</Link>
          </Button>
        </div>
      </div>

      {/* 4 Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warga */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            {wargaGrowth > 0 && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center">
                +{wargaGrowth}% ↗
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Warga</p>
          <h3 className="text-3xl font-extrabold">{totalWarga}</h3>
        </div>

        {/* Total Surat */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Kuota Surat: {totalSurat}/{suratLimit}
            </span>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Surat</p>
          <h3 className="text-3xl font-extrabold">{totalSurat}</h3>
        </div>

        {/* WA Asisten */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">WA Asisten</p>
          <h3 className="text-lg font-extrabold text-emerald-500 truncate">{tenant?.whatsappBotNo || "Belum Terhubung"}</h3>
        </div>

        {/* Kuota AI */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (aiUsed/aiLimit)*100)}%` }}></div>
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Kuota AI</p>
          <h3 className="text-3xl font-extrabold flex items-baseline gap-1">
            {aiUsed >= 1000 ? (aiUsed/1000).toFixed(1) + 'k' : aiUsed}
            <span className="text-sm font-medium text-muted-foreground">/ {aiLimit >= 1000 ? (aiLimit/1000).toFixed(1) + 'k' : aiLimit}</span>
          </h3>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts data={kasChartData} summary={kasSummary} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Surat & Pengumuman) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Surat Terbaru */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-sm">Surat Terbaru</h3>
              <Link href="/dashboard/rt/surat" className="text-xs font-semibold text-primary hover:underline">Lihat Semua</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Nama Warga</th>
                    <th className="px-5 py-3 font-semibold">Jenis Surat</th>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {suratTerbaru.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-6 text-center text-muted-foreground">Belum ada surat bulan ini</td>
                    </tr>
                  ) : (
                    suratTerbaru.map((surat) => (
                      <tr key={surat.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {surat.warga?.namaLengkap?.charAt(0).toUpperCase() || "W"}
                          </div>
                          {surat.warga?.namaLengkap || "Tanpa Nama"}
                        </td>
                        <td className="px-5 py-3">{surat.template.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{new Date(surat.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pengumuman Terkini */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-4 md:p-5 relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-sm">Pengumuman Terkini</h3>
            </div>
            
            <div className="space-y-3 relative z-10 mb-4">
              {pengumumanTerkini.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  Belum ada pengumuman
                </div>
              ) : (
                pengumumanTerkini.map((p, i) => (
                  <div key={p.id} className={`p-4 rounded-xl border border-border ${i === 0 ? 'bg-blue-500/5 border-blue-500/20' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
                    <h4 className={`font-bold text-sm mb-1 ${i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-cyan-600 dark:text-cyan-400'}`}>{p.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.content}</p>
                    <p className="text-[10px] text-muted-foreground/70">Diterbitkan {new Date(p.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>
            
            <Button variant="outline" className="w-full border-dashed border-border text-muted-foreground hover:text-foreground relative z-10" asChild>
              <Link href="/dashboard/rt/ai">
                <Plus className="w-4 h-4 mr-2" /> Buat Pengumuman
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Column (Aktivitas Terbaru) */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-4 md:p-5 flex flex-col h-full">
          <h3 className="font-bold text-sm mb-6">Aktivitas Terbaru</h3>
          
          <div className="flex-1">
            {aktivitasTerbaru.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Belum ada aktivitas
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[1.125rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {aktivitasTerbaru.map((log) => {
                  let Icon = Info;
                  let colorClass = "bg-slate-500";
                  let displayAction = log.action;
                  let displayDesc = log.description;
                  
                  if (log.action.includes("WARGA")) {
                    Icon = UserPlus; colorClass = "bg-blue-500";
                    if (log.action === "WARGA_CREATED") displayAction = "Tambah Warga";
                    else if (log.action === "WARGA_UPDATED") displayAction = "Update Warga";
                    else if (log.action === "WARGA_DELETED") displayAction = "Hapus Warga";
                  } else if (log.action.includes("SURAT")) {
                    Icon = FileText; colorClass = "bg-emerald-500";
                    if (log.action === "SURAT_CREATED") displayAction = "Cetak Surat";
                  } else if (log.action.includes("KAS")) {
                    Icon = CreditCard; colorClass = "bg-amber-500";
                    if (log.action === "KAS_CREATED") displayAction = "Transaksi Kas";
                    // Try to format kas description better if it has pipes
                    if (displayDesc && displayDesc.includes("|")) {
                      const parts = displayDesc.split("|").map(p => p.trim());
                      if (parts.length >= 3) {
                        displayDesc = `${parts[0]}: ${parts[1]} (${parts[2]})`;
                      }
                    }
                  } else if (log.action.includes("AI_CHAT_USAGE")) {
                    Icon = Bot; colorClass = "bg-cyan-500";
                    displayAction = "Tanya AI Chat";
                    displayDesc = `${log.description} token`;
                  } else if (log.action.includes("AI_REPORT_USAGE")) {
                    Icon = Bot; colorClass = "bg-cyan-500";
                    displayAction = "Laporan AI";
                    displayDesc = `${log.description} token`;
                  } else if (log.action.includes("AI_BROADCAST_USAGE")) {
                    Icon = Bot; colorClass = "bg-cyan-500";
                    displayAction = "Broadcast AI";
                    displayDesc = `${log.description} token`;
                  }

                  // Time ago logic
                  const diffMs = now.getTime() - new Date(log.createdAt).getTime();
                  const diffHrs = Math.floor(diffMs / 3600000);
                  const timeAgo = diffHrs === 0 ? 'Baru saja' : `${diffHrs} jam yang lalu`;

                  return (
                    <div key={log.id} className="relative flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`relative z-10 w-8 h-8 flex items-center justify-center bg-card border-2 border-background rounded-full ${colorClass} text-white shrink-0 shadow-sm`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-bold">{displayAction}</span>
                            <span className="text-muted-foreground mx-1">•</span>
                            <span className="text-muted-foreground">{displayDesc}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
