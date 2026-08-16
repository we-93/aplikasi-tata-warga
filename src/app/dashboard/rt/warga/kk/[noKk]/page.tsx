import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function KartuKeluargaDetailPage({ params }: { params: { noKk: string } }) {
  const session = await auth();
  if (!session?.user?.tenantId) return notFound();

  const { noKk } = await params;

  const wargas = await prisma.warga.findMany({
    where: {
      tenantId: session.user.tenantId,
      noKk: noKk,
    },
    orderBy: {
      createdAt: 'asc', // Kepala keluarga is usually created first
    }
  });

  if (!wargas || wargas.length === 0) {
    return notFound();
  }

  const kepalaKeluarga = wargas.find(w => w.hubunganKeluarga === "KEPALA_KELUARGA") || wargas[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/rt/warga">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Kartu Keluarga</h1>
            <p className="text-muted-foreground mt-1">No KK: <strong className="text-foreground tracking-wider">{noKk}</strong></p>
          </div>
        </div>
        
        <Button className="bg-[#6419c1] hover:bg-[#6419c1]/90" asChild>
          <Link href={`/dashboard/rt/warga/kk/${noKk}/add`} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota Keluarga</span>
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informasi KK</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-muted-foreground">Kepala Keluarga</span>
            <span className="col-span-2 font-medium">{kepalaKeluarga.namaLengkap}</span>
            
            <span className="text-muted-foreground">Alamat</span>
            <span className="col-span-2">{kepalaKeluarga.alamat || "-"}</span>
            
            <span className="text-muted-foreground">Total Anggota</span>
            <span className="col-span-2 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-2 py-0.5 rounded-md">{wargas.length} Orang</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <h3 className="font-semibold">Daftar Anggota Keluarga</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Hubungan</TableHead>
              <TableHead>L/P</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wargas.map((w, i) => (
              <TableRow key={w.id}>
                <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium tracking-wide">{w.nik}</TableCell>
                <TableCell className="font-medium text-foreground">{w.namaLengkap}</TableCell>
                <TableCell>
                  <Badge variant={w.hubunganKeluarga === "KEPALA_KELUARGA" ? "default" : "secondary"} className={w.hubunganKeluarga === "KEPALA_KELUARGA" ? "bg-[#21b7b1] hover:bg-[#21b7b1]/90" : ""}>
                    {w.hubunganKeluarga.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{w.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}</TableCell>
                <TableCell>{w.noHp || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600">
                      <Link href={`/dashboard/rt/warga/${w.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                    </Button>
                    <form action={async () => {
                      "use server";
                      const { deleteWarga } = await import("@/app/actions/warga");
                      await deleteWarga(w.id);
                    }}>
                      <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
