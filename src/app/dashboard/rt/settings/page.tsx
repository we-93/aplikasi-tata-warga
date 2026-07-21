import { SettingsForm } from "@/components/rt/settings-form";
import { AvatarUpload } from "@/components/rt/avatar-upload";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function RtSettingsPage() {
  const session = await auth();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session?.user?.tenantId || undefined }
  });
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { image: true }
  });

  if (!tenant) {
    return <div>Data kepengurusan tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Kepengurusan RT</h1>
        <p className="text-muted-foreground mt-1">Lengkapi data wilayah dan identitas pengurus untuk keperluan otomatisasi Kop Surat.</p>
      </div>

      <AvatarUpload currentImage={user?.image || session?.user?.image} />

      <SettingsForm key={tenant.updatedAt?.toString() || tenant.id} initialData={tenant} />
    </div>
  );
}
