import { BroadcastClient } from "./client";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function BroadcastPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  let initialPengumuman: any[] = [];
  
  if (tenantId) {
    initialPengumuman = await prisma.pengumuman.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  return <BroadcastClient initialPengumuman={initialPengumuman} />;
}
