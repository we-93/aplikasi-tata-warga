import { AccountForm } from "@/components/rt/account-form";
import { AvatarUpload } from "@/components/rt/avatar-upload";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

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
      <AvatarUpload currentImage={user?.image} />
      <AccountForm initialData={accountData} />
    </div>
  );
}
