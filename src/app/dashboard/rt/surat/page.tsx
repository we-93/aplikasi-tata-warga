import { SuratArsipList } from "@/components/rt/surat-arsip-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function RtSuratPage() {
  const session = await auth();
  const arsips = await prisma.suratArsip.findMany({
    where: { tenantId: session?.user?.tenantId || undefined },
    include: {
      template: true,
      warga: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pelayanan Surat</h1>
          <p className="text-muted-foreground mt-1">Buat surat pengantar otomatis dan lihat riwayat pembuatan dokumen warga.</p>
        </div>
        <Link href="/dashboard/rt/surat/create" className="w-full md:w-auto">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
            <Plus className="w-4 h-4 mr-2" /> Buat Surat Baru
          </Button>
        </Link>
      </div>

      <SuratArsipList arsips={arsips} />
    </div>
  );
}
