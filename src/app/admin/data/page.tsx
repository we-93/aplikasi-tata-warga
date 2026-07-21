import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTenants } from "@/app/actions/customer";
import { DataClient } from "./client";
import prisma from "@/lib/prisma";

export default async function AdminDataPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const tenants = await getTenants();
  const waDevices = await prisma.waDevice.findMany();

  return (
    <div className="p-6">
      <DataClient initialTenants={tenants} waDevices={waDevices} />
    </div>
  );
}
