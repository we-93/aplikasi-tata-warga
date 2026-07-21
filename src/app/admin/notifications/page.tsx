import { NotificationsClient } from "./client";
import { getNotificationSettings } from "@/app/actions/notifications";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const settings = await getNotificationSettings();

  return (
    <NotificationsClient settings={settings} />
  );
}
