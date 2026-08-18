import { AccountForm } from "@/components/rt/account-form";
import { AvatarUpload } from "@/components/rt/avatar-upload";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AkunPage() {
  const session = await auth();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session?.user?.tenantId || undefined }
  });
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { name: true, email: true, phone: true, image: true }
  });

  if (!tenant || !user) {
    return <div>Data tidak ditemukan.</div>;
  }

  const accountData = {
    ...user,
    phone: user.phone || tenant.noHpRt || ""
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
        <Link href="/dashboard/rt/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-[#6519c2]">Pengaturan Akun</h1>
      </div>
      <AvatarUpload currentImage={user?.image} />
      <AccountForm initialData={accountData} />
    </div>
  );
}
