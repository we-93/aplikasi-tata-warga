import { DashboardClient } from "./client";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const resolvedParams = await searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const now = new Date();
  
  const filterMonth = resolvedParams.month ? parseInt(resolvedParams.month) : now.getMonth() + 1; // 1-12
  const filterYear = resolvedParams.year ? parseInt(resolvedParams.year) : now.getFullYear();
  // Tanggal 1 bulan ini
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Tanggal 1 bulan lalu
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Helper untuk mendapatkan kenaikan % (bulan ini dibanding bulan lalu)
  async function getGrowth(modelName: any, condition = {}) {
    const totalThisMonth = await (prisma as any)[modelName].count({
      where: { ...condition, createdAt: { gte: startOfThisMonth } }
    });
    const totalLastMonth = await (prisma as any)[modelName].count({
      where: { ...condition, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    
    if (totalLastMonth === 0) return totalThisMonth > 0 ? 100 : 0;
    return Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100);
  }

  // --- STATISTIK UTAMA ---
  const totalTenant = await prisma.tenant.count();
  const totalTenantGrowth = await getGrowth("tenant");
  
  const rtAktif = await prisma.tenant.count({ where: { status: "AKTIF" } });
  const rtAktifGrowth = await getGrowth("tenant", { status: "AKTIF" });

  const { getAiSettings } = await import("@/app/actions/integrations");
  const aiSettings = await getAiSettings();
  const totalTokensUsed = (aiSettings.totalChatTokensUsed || 0) + (aiSettings.totalOcrTokensUsed || 0);

  // Calculate total revenue
  const revenueAgg = await prisma.invoice.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED" }
  });
  const pendapatan = Number(revenueAgg._sum.amount || 0);
  
  const revThisMonth = await prisma.invoice.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED", createdAt: { gte: startOfThisMonth } }
  });
  const revLastMonth = await prisma.invoice.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED", createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
  });
  const pThis = Number(revThisMonth._sum.amount || 0);
  const pLast = Number(revLastMonth._sum.amount || 0);
  const pendapatanGrowth = pLast === 0 ? (pThis > 0 ? 100 : 0) : Math.round(((pThis - pLast) / pLast) * 100);

  const totalSurat = await prisma.suratArsip.count();
  const totalSuratGrowth = await getGrowth("suratArsip");

  const totalWarga = await prisma.warga.count();
  const totalWargaGrowth = await getGrowth("warga");
  
  const totalBot = await prisma.waDevice.count();
  const botOnline = await prisma.waDevice.count({ where: { status: "ONLINE" } });

  // Get 10 recent tenants for the table
  const recentTenantsRaw = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      createdAt: true,
      status: true,
      subscriptionPlan: true
    }
  });
  const recentTenants = recentTenantsRaw.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString()
  }));

  // --- GRAFIK: Tren Pertumbuhan RT ---
  // Bulanan (12 bulan terakhir untuk tahun ini)
  const currentYear = now.getFullYear();
  const growthMonthlyRaw = await prisma.$queryRaw`
    SELECT MONTH(createdAt) as month, COUNT(*) as count 
    FROM tenants 
    WHERE YEAR(createdAt) = ${currentYear} 
    GROUP BY MONTH(createdAt) 
    ORDER BY month ASC
  `;
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const growthMonthly = months.map((m, i) => {
    const found = (growthMonthlyRaw as any[]).find(x => x.month === i + 1);
    return { name: m, RT: found ? Number(found.count) : 0 };
  });

  // Tahunan (5 tahun terakhir)
  const growthYearlyRaw = await prisma.$queryRaw`
    SELECT YEAR(createdAt) as year, COUNT(*) as count 
    FROM tenants 
    WHERE YEAR(createdAt) >= ${currentYear - 4} 
    GROUP BY YEAR(createdAt) 
    ORDER BY year ASC
  `;
  const growthYearly = [];
  for (let y = currentYear - 4; y <= currentYear; y++) {
    const found = (growthYearlyRaw as any[]).find(x => x.year === y);
    growthYearly.push({ name: y.toString(), RT: found ? Number(found.count) : 0 });
  }

  // --- GRAFIK: Distribusi Pendapatan (Bulan yang Dipilih) ---
  const startDate = new Date(filterYear, filterMonth - 1, 1);
  const nextMonthDate = new Date(filterYear, filterMonth, 1);
  
  const revenueRaw = await prisma.$queryRaw`
    SELECT DATE(createdAt) as date, SUM(amount) as total 
    FROM invoices 
    WHERE status = 'COMPLETED' 
      AND createdAt >= ${startDate} 
      AND createdAt < ${nextMonthDate}
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `;
  
  const revenueDaily = [];
  let totalRevenueThisMonth = 0;
  
  // Hitung jumlah hari dalam bulan yang dipilih
  const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(filterYear, filterMonth - 1, i, 12, 0, 0); // set ke jam 12 siang agar hindari masalah timezone shift
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const found = (revenueRaw as any[]).find(x => x.date.toISOString().split("T")[0] === dateStr);
    const amount = found ? Number(found.total) : 0;
    totalRevenueThisMonth += amount;
    revenueDaily.push({ 
      name: i.toString(), 
      Pendapatan: amount 
    });
  }

  // --- GRAFIK: Status Langganan ---
  const rtNonaktif = await prisma.tenant.count({ where: { status: "NONAKTIF" } });
  
  // Asumsi paket didapat dari subscriptionPlan. Untuk simplicity, kita group by status dari tenant (Aktif, Pending, Nonaktif)
  // Atau kita group berdasarkan paket (Trial, Pro, Premium, Platinum)
  const subPlanRaw = await prisma.tenant.groupBy({
    by: ['subscriptionPlan'],
    _count: { id: true }
  });
  
  const subscriptionStatus = subPlanRaw.map(s => ({
    name: s.subscriptionPlan || "Trial",
    value: s._count.id
  }));

  // --- AKTIVITAS TERBARU ---
  const recentActivitiesRaw = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true } }
    }
  });
  const recentActivities = recentActivitiesRaw.map(a => ({
    id: a.id,
    action: a.action,
    description: a.description,
    tenantName: a.tenant?.name || "Global",
    userName: a.user?.name || "Sistem",
    createdAt: a.createdAt.toISOString()
  }));

  const data = {
    totalTenant, totalTenantGrowth,
    rtAktif, rtAktifGrowth,
    totalTokensUsed,
    pendapatan, pendapatanGrowth,
    totalSurat, totalSuratGrowth,
    totalWarga, totalWargaGrowth,
    totalBot, botOnline,
    recentTenants,
    growthMonthly,
    growthYearly,
    revenueDaily,
    totalRevenueThisMonth,
    subscriptionStatus,
    recentActivities,
    filterMonth,
    filterYear
  };

  return <DashboardClient data={data} />;
}
