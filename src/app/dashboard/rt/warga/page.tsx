import { WargaListRt } from "@/components/rt/warga-list";
import { WargaHeaderActions } from "@/components/rt/warga-header-actions";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function RtWargaPage() {
  const session = await auth();
  const wargas = await prisma.warga.findMany({
    where: { tenantId: session?.user?.tenantId || undefined },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Data Warga</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Kelola data seluruh penduduk di lingkungan RT Anda.</p>
        </div>
        <WargaHeaderActions wargas={wargas} />
      </div>

      <WargaListRt wargas={wargas} />
    </div>
  );
}
