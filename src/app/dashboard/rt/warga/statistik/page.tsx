import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StatistikDashboard } from "@/components/rt/statistik-dashboard";

export const dynamic = 'force-dynamic';

export default async function StatistikWargaPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const wargas = await prisma.warga.findMany({
    where: { tenantId: session.user.tenantId },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Statistik Warga</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisasi dan demografi kependudukan di lingkungan RT Anda.
          </p>
        </div>
      </div>

      <StatistikDashboard wargas={wargas} />
    </div>
  );
}
