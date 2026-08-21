import { Metadata } from "next";
import { NotulenTabsNav } from "./nav";

export const metadata: Metadata = {
  title: "Notulen & Pengumuman - Tata Warga",
};

export default function NotulenDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col min-h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Notulen & Pengumuman</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rekam atau ketik hasil rapat RT, dan publikasikan pengumuman ke seluruh warga.
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <NotulenTabsNav />
        {children}
      </div>
    </div>
  );
}
