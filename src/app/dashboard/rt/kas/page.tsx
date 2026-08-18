import { Metadata } from "next";
import { getKasSummary, getKasTransactions, getKasChartData } from "@/app/actions/kas";
import { KasClient } from "./client";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
export const metadata: Metadata = {
  title: "Kas RT - Tata Warga",
};

export default async function KasPage() {
  const [summary, transactions, chartData] = await Promise.all([
    getKasSummary(),
    getKasTransactions(),
    getKasChartData(),
  ]);

  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  let initialPengumuman: any[] = [];
  if (tenantId) {
    initialPengumuman = await prisma.pengumuman.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  const serializedTransactions = transactions.map(t => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString()
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <KasClient 
        initialSummary={summary} 
        initialTransactions={serializedTransactions} 
        chartData={chartData} 
        initialPengumuman={initialPengumuman} 
      />
    </div>
  );
}
