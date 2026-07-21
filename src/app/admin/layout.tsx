import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/auth/login");

  // Fetch logo and footer text from site settings
  const settings = await prisma.siteSettings.findFirst({ select: { logoUrl: true, logoUrlDark: true, footerText: true } });

  // Fetch 3 recent logs for notification bell
  const recentLogs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const serializedLogs = recentLogs.map(l => ({
    id: l.id,
    action: l.action,
    description: l.description,
    createdAt: l.createdAt.toISOString(),
    tenantName: l.tenant?.name || null,
    userName: l.user?.name || null,
  }));

  const userDb = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true }
  });

  return (
    <AdminLayoutShell
      logoUrl={settings?.logoUrl || null}
      logoUrlDark={settings?.logoUrlDark || null}
      userName={session.user.name || "Admin"}
      userEmail={session.user.email || ""}
      userImage={userDb?.image || session.user.image || null}
      footerText={settings?.footerText || "© 2026 Tata Warga."}
      recentLogs={serializedLogs}
    >
      {children}
    </AdminLayoutShell>
  );
}
