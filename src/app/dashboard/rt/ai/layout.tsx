import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { AiTabsNav } from "./nav";

export const metadata: Metadata = {
  title: "Pusat Kendali AI - Tata Warga",
};

export default async function AiDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">AI Assistan RT</h1>
        <p className="text-sm text-muted-foreground mt-1">Silakan bertanya apa saja tentang data RT Anda atau produk hukum daerah.</p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
