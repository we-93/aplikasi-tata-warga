import { SuratArsipList } from "@/components/rt/surat-arsip-list";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";
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
          <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Arsip Surat</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Buat surat pengantar otomatis dan lihat riwayat pembuatan dokumen warga.</p>
        </div>
        <div className="hidden md:flex flex-wrap items-center gap-2">
          <Link href="/dashboard/rt/surat/template">
            <Button variant="outline" className="text-xs md:text-sm h-9">
              <Settings2 className="w-4 h-4 mr-2" /> Kelola Template
            </Button>
          </Link>
          <Link href="/dashboard/rt/surat/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm h-9">
              <Plus className="w-4 h-4 mr-2" /> Buat Surat
            </Button>
          </Link>
        </div>
      </div>

      <SuratArsipList arsips={arsips} />
    </div>
  );
}
