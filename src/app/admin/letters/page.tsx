import { LetterList } from "@/components/admin/letter-list";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function LettersPage() {
  const templates = await prisma.suratTemplate.findMany({
    where: { tenantId: null }, // Only global templates
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manajemen Template Surat</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Kelola master template surat untuk seluruh RT atau template spesifik.</p>
        </div>
      </div>
      <LetterList templates={templates as any} />
    </div>
  );
}
