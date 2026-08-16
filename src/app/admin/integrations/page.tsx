import { IntegrationsClient } from "./client";
import { getAiSettings, getTokenUsageLogs } from "@/app/actions/integrations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const aiSettings = await getAiSettings();
  const tokenLogsRes = await getTokenUsageLogs();
  const tokenLogs = tokenLogsRes.success ? tokenLogsRes.logs : [];

  return (
    <div className="p-4 md:p-8">
      <IntegrationsClient aiSettings={aiSettings} initialTokenLogs={tokenLogs} />
    </div>
  );
}
