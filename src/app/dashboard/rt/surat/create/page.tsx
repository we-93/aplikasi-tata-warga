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
    where: { tenantId, statusWarga: "AKTIF" },
    orderBy: { namaLengkap: 'asc' }
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/rt/surat">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Surat Baru</h1>
          <p className="text-muted-foreground mt-1">Pilih jenis surat dan warga untuk meng-generate dokumen PDF secara otomatis.</p>
        </div>
      </div>

      <SuratCreator templates={templates} wargas={wargas} tenant={tenant} />
    </div>
  );
}
