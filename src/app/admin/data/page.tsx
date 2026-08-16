import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTenants } from "@/app/actions/customer";
import { DataClient } from "./client";

export default async function AdminDataPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const tenants = await getTenants();

  return (
    <div className="p-6">
      <DataClient initialTenants={tenants} />
    </div>
  );
}
