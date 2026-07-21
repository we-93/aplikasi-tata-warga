import prisma from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = 'force-dynamic';

export default async function AdminLandingPage() {
  const settings = await prisma.siteSettings.findFirst({
    where: { tenant_id: null }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <SettingsForm initialData={settings || {}} />
    </div>
  );
}
