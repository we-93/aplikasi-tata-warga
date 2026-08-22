import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SuratDetailClient } from "./client";

export default async function SuratDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/auth/login");

  const arsip = await prisma.suratArsip.findFirst({
    where: { 
      id: id,
      tenantId: session.user.tenantId // Security check to ensure RT only views their own letters
    },
    include: {
      template: true,
      warga: true,
      tenant: true,
    }
  });

  if (!arsip) {
    redirect("/dashboard/rt/surat");
  }

  return <SuratDetailClient arsip={arsip} />;
}
