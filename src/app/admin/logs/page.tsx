import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminLogs } from "@/app/actions/logs";
import { AdminLogsClient } from "./client";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; tenantId?: string; action?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/auth/login");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const data = await getAdminLogs({
    page,
    perPage: 50,
    search: params.search,
    tenantId: params.tenantId,
    action: params.action,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Log Aktivitas (Audit Trail)</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">
            Pantau seluruh aktivitas pengguna dan perubahan sistem secara global.
          </p>
        </div>
      </div>
      <AdminLogsClient data={data} currentPage={page} />
    </div>
  );
}
