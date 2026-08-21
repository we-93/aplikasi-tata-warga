import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SuratCreator } from "@/components/rt/surat-creator";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function CreateSuratPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId || undefined;

  // Fetch Global templates or tenant specific templates
  const templates = await prisma.suratTemplate.findMany({
    where: {
      OR: [
        { tenantId: null },
        { tenantId }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch active wargas
  const wargas = await prisma.warga.findMany({
    where: { 
      tenantId, 
      statusWarga: {
        in: ["TETAP", "KONTRAK_KOST"]
      } 
    },
    orderBy: { namaLengkap: 'asc' }
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10 w-full">
        <Link href="/dashboard/rt/surat" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Buat Surat Baru</h1>
      </div>

      <SuratCreator templates={templates} wargas={wargas} tenant={tenant} />
    </div>
  );
}
