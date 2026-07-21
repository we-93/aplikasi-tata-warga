import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { AdminSettingsClient } from "./client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true }
  });

  const siteSettings = await prisma.siteSettings.findFirst({
    where: { tenant_id: null }
  });

  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Admin</h1>
        <p className="text-muted-foreground mt-1">Kelola profil, tampilan situs, dan konfigurasi server.</p>
      </div>

      <AdminSettingsClient 
        currentUser={currentUser} 
        siteSettings={siteSettings} 
        admins={admins} 
      />
    </div>
  );
}
