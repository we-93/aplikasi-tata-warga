import { IntegrationsClient } from "./client";
import { getWaDevices, getAiSettings } from "@/app/actions/integrations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const devices = await getWaDevices();
  const aiSettings = await getAiSettings();

  return (
    <IntegrationsClient devices={devices} aiSettings={aiSettings} />
  );
}
