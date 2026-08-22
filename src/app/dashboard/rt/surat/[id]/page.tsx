import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { SuratDetailClient } from "./client";

export default async function SuratDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) redirect("/auth/login");

  const arsip = await prisma.suratArsip.findUnique({
    where: { 
      id: params.id,
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
