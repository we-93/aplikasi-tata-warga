import { RTLayoutShell } from "@/components/rt/rt-layout-shell";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function RTLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  
  // Jika Super Admin mencoba mengakses dashboard RT, redirect kembali ke admin
  if (session.user.role === "SUPER_ADMIN" && !session.user.tenantId) {
    redirect("/admin");
  }

  // Jika user biasa tapi tidak punya tenantId
  if (!session.user.tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="max-w-md text-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-sm text-slate-600 mb-6">Akun Anda belum terhubung dengan RT manapun.</p>
          <a href="/" className="px-4 py-2 bg-[#6419c1] text-white rounded-md text-sm font-medium">Kembali ke Beranda</a>
        </div>
      </div>
    );
  }

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

  // Fetch notifications for the specific tenant
  let notifications: any[] = [];
  if (session.user.tenantId) {
    notifications = await prisma.notification.findMany({
      where: { 
        OR: [
          { tenantId: session.user.tenantId },
          { isGlobal: true }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  }

  const serializedNotifs = notifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString()
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
      notifications={serializedNotifs}
    >
      {children}
    </RTLayoutShell>
  );
}

// Force rebuild
