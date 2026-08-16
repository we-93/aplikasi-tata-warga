import { RtLetterList } from "@/components/rt/rt-letter-list";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function RtLettersPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId) {
    return <div>Akses Ditolak</div>;
  }

  const templates = await prisma.suratTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Template Surat Kustom</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Buat format surat sendiri yang hanya bisa digunakan oleh RT Anda.</p>
        </div>
      </div>
      <RtLetterList templates={templates as any} />
    </div>
  );
}
