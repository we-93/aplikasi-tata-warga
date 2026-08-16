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
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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

  const totalTenant = await prisma.tenant.count();
  const totalTenantGrowth = await getGrowth("tenant");
  
  const rtAktif = await prisma.tenant.count({ where: { status: "AKTIF" } });
  const rtAktifGrowth = await getGrowth("tenant", { status: "AKTIF" });

  const totalSurat = await prisma.suratArsip.count();
  const totalSuratGrowth = await getGrowth("suratArsip");

  const totalWarga = await prisma.warga.count();
  const totalWargaGrowth = await getGrowth("warga");

  const recentTenantsRaw = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      createdAt: true,
      status: true,
      aiChatCredits: true
    }
  });
  const recentTenants = recentTenantsRaw.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString()
  }));

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
    totalSurat, totalSuratGrowth,
    totalWarga, totalWargaGrowth,
    recentTenants,
    growthMonthly,
    growthYearly,
    recentActivities,
    filterMonth,
    filterYear
  };

  return <DashboardClient data={data} />;
}
