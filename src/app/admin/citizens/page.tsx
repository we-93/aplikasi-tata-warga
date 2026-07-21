import { WargaList } from "@/components/admin/warga-list";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CitizensPage() {
  const wargas = await prisma.warga.findMany({
    include: {
      tenant: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Limit for MVP performance
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warga Global</h1>
        <p className="text-muted-foreground mt-2">Database terpusat seluruh warga dari semua RT yang terdaftar.</p>
      </div>
      <WargaList wargas={wargas as any} />
    </div>
  );
}
