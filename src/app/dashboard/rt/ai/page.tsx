import { Metadata } from "next";
import { AiClient } from "./client";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Pusat Kendali AI - Tata Warga",
};

export default async function AiDashboardPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  let initialPengumuman: any[] = [];
  
  if (tenantId) {
    initialPengumuman = await prisma.pengumuman.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1b264f] dark:text-foreground">Pusat Kendali AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Asisten pintar untuk membantu pengurus RT mengelola warga, menyusun pengumuman, dan laporan.</p>
      </div>

      <AiClient initialPengumuman={initialPengumuman} />
    </div>
  );
}
