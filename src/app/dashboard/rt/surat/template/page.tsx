import { RtLetterList } from "@/components/rt/rt-letter-list";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6 max-w-7xl mx-auto w-full text-slate-900 dark:text-white pb-10">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10 w-full">
        <Link href="/dashboard/rt/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Template Surat Kustom</h1>
      </div>
      <RtLetterList templates={templates as any} />
    </div>
  );
}
