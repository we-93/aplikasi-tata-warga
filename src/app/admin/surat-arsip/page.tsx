import { AdminSuratArsipList } from "@/components/admin/surat-arsip-list";
import { FileText } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AdminSuratArsipPage() {
  const arsips = await prisma.suratArsip.findMany({
    include: {
      template: true,
      warga: true,
      tenant: {
        include: {
          users: {
            where: { role: 'TENANT_ADMIN' },
            select: { email: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arsip Semua Surat</h1>
          <p className="text-muted-foreground mt-1">
            Pantau dan kelola semua riwayat pembuatan surat yang dilakukan oleh organisasi RT terdaftar.
          </p>
        </div>
        <div className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
          <div className="bg-[#6419c1]/10 text-[#6419c1] dark:text-[#a064fa] p-2 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Surat Dibuat</div>
            <div className="font-bold text-lg leading-none">{arsips.length}</div>
          </div>
        </div>
      </div>

      <AdminSuratArsipList arsips={arsips} />
    </div>
  );
}
