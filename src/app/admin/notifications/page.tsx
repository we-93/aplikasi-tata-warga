import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminNotifications } from "@/app/actions/notifications";
import { getTenants } from "@/app/actions/customer";
import { NotificationsClient } from "./client";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const notifications = await getAdminNotifications();
  const tenants = await getTenants();

  return (
    <div className="p-6">
      <NotificationsClient initialNotifications={notifications} tenants={tenants} />
    </div>
  );
}
