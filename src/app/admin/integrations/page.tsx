import { IntegrationsClient } from "./client";
import { getAiSettings } from "@/app/actions/integrations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const aiSettings = await getAiSettings();

  return (
    <div className="p-4 md:p-8">
      <IntegrationsClient aiSettings={aiSettings} />
    </div>
  );
}
