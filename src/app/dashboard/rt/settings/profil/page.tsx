import { SettingsForm } from "@/components/rt/settings-form";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const session = await auth();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session?.user?.tenantId || undefined }
  });

  if (!tenant) {
    return <div>Data kepengurusan tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <SettingsForm key={tenant.updatedAt?.toString() || tenant.id} initialData={tenant} />
    </div>
  );
}
