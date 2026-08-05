import { SettingsClient } from "./client";
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
    select: { name: true, email: true, phone: true, image: true }
  });

  if (!tenant) {
    return <div>Data kepengurusan tidak ditemukan.</div>;
  }

  return <SettingsClient tenant={tenant} user={user} />;
}
