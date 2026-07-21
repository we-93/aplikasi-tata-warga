import { RTLayoutShell } from "@/components/rt/rt-layout-shell";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function RTLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  // Fetch logo and footer text from site settings
  const settings = await prisma.siteSettings.findFirst({ select: { logoUrl: true, logoUrlDark: true, footerText: true, maintenanceMode: true } });

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <h1 className="text-3xl font-bold">Sistem Sedang Dalam Perbaikan</h1>
          <p className="text-muted-foreground">
            Kami sedang melakukan peningkatan sistem untuk memberikan layanan yang lebih baik. Silakan kembali lagi nanti.
          </p>
          <div className="pt-8">
            <a href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
              Kunjungi Website Utama &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fetch 3 recent logs for notification bell (for the specific tenant)
  let recentLogs: any[] = [];
  if (session.user.tenantId) {
    recentLogs = await prisma.activityLog.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        tenant: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
  }

  const serializedLogs = recentLogs.map(l => ({
    id: l.id,
    action: l.action,
    description: l.description,
    createdAt: l.createdAt.toISOString(),
    tenantName: l.tenant?.name || null,
    userName: l.user?.name || null,
  }));

  // Fetch fresh user data for image (so we don't rely purely on stale JWT session)
  const userDb = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true }
  });

  return (
    <RTLayoutShell
      logoUrl={settings?.logoUrl || null}
      logoUrlDark={settings?.logoUrlDark || null}
      userName={session.user.name || "Ketua RT"}
      userEmail={session.user.email || ""}
      userImage={userDb?.image || session.user.image || null}
      footerText={settings?.footerText || "© 2026 Tata Warga."}
      recentLogs={serializedLogs}
    >
      {children}
    </RTLayoutShell>
  );
}

// Force rebuild
