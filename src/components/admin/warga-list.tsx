"use client";

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type WargaData = {
  id: string;
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  statusWarga: string;
  noHp: string | null;
  tenant: {
    name: string;
  };
};

export function WargaList({ wargas }: { wargas: WargaData[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Asal RT (Tenant)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wargas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Belum ada data warga terdaftar dari RT mana pun.
                </TableCell>
              </TableRow>
            ) : (
              wargas.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.namaLengkap}</TableCell>
                  <TableCell>{w.nik}</TableCell>
                  <TableCell>{w.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</TableCell>
                  <TableCell>{w.noHp || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{w.tenant.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {w.statusWarga === "AKTIF" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Aktif</Badge>
                    ) : w.statusWarga === "PINDAH" ? (
                      <Badge variant="secondary">Pindah</Badge>
                    ) : (
                      <Badge variant="destructive">Meninggal</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
