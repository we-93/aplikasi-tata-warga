import { Metadata } from "next";
import { getRtLogs } from "@/app/actions/logs";
import { RtLogsClient } from "./client";

export const metadata: Metadata = { title: "Log Aktivitas - Tata Warga" };

export default async function RtLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; action?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const data = await getRtLogs({
    page,
    perPage: 20,
    search: resolvedParams.search,
    action: resolvedParams.action,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Log Aktivitas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Riwayat seluruh aktivitas yang terjadi di dashboard RT Anda.
        </p>
      </div>
      <RtLogsClient data={data} currentPage={page} />
    </div>
  );
}
