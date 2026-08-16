import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WargaEditorForm } from "@/components/rt/warga-editor-form";

export default async function AddKeluargaMemberPage({ params }: { params: { noKk: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) return notFound();

  const { noKk } = await params;

  // We need to fetch Kepala Keluarga to get the default alamat
  const kepalaKeluarga = await prisma.warga.findFirst({
    where: {
      tenantId: session.user.tenantId,
      noKk: noKk,
      hubunganKeluarga: "KEPALA_KELUARGA"
    }
  });

  const fallbackWarga = await prisma.warga.findFirst({
    where: {
      tenantId: session.user.tenantId,
      noKk: noKk,
    }
  });

  const refWarga = kepalaKeluarga || fallbackWarga;

  if (!refWarga) {
    return notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/rt/warga/kk/${noKk}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Anggota Keluarga</h1>
          <p className="text-muted-foreground mt-1">
            Menambahkan anggota baru ke dalam Kartu Keluarga <strong className="text-foreground tracking-wider">{noKk}</strong>
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-lg">
        <p className="text-amber-800 dark:text-amber-400 text-sm">
          <strong>Perhatian:</strong> Karena Anda menambahkan anggota ke KK yang sudah ada, nomor KK dan Alamat Lengkap dikunci mengikuti profil Kepala Keluarga.
        </p>
      </div>

      <WargaEditorForm 
        initialData={{ 
          noKk: noKk, 
          alamat: refWarga.alamat,
          hubunganKeluarga: "ISTRI" // Default suggestion for second member
        }} 
        isKkLocked={true} 
      />
    </div>
  );
}
