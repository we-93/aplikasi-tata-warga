import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { AdminStatistikClient } from "./client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminStatistikPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  // Fetch all wargas and include their tenant to filter by location
  const wargas = await prisma.warga.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          district: true,
          village: true,
        }
      }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/data">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Statistik Global</h2>
            <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Pantau statistik data demografi seluruh warga lintas kecamatan dan desa.</p>
          </div>
        </div>
      </div>
      
      <AdminStatistikClient wargas={wargas as any} />
    </div>
  );
}
