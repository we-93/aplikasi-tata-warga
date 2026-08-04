"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { deleteWarga } from "@/app/actions/warga";
import { toast } from "sonner";

export function WargaListRt({ wargas }: { wargas: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [gender, setGender] = useState("ALL");
  const itemsPerPage = 20;

  // Filter wargas based on search, status, and gender
  const filteredWargas = wargas.filter((w) => {
    const matchSearch = w.namaLengkap?.toLowerCase().includes(search.toLowerCase()) || 
                        (w.nik && w.nik.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = status === "ALL" || w.statusWarga === status;
    const matchGender = gender === "ALL" || w.jenisKelamin === gender;
    
    return matchSearch && matchStatus && matchGender;
  });

  const totalPages = Math.ceil(filteredWargas.length / itemsPerPage);
  const currentData = filteredWargas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, gender]);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data warga ini? Data surat yang terkait akan kehilangan referensi nama.")) return;
    const res = await deleteWarga(id);
    if (res.success) toast.success("Data warga dihapus.");
    else toast.error(res.error);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau NIK..." 
            className="pl-9 bg-card border-slate-200 dark:border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={status} onValueChange={(v) => setStatus(v || "ALL")}>
            <SelectTrigger className="w-full sm:w-[150px] bg-card border-slate-200 dark:border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="TETAP">Tetap</SelectItem>
              <SelectItem value="KONTRAK_KOST">Kontrak/Kost</SelectItem>
              <SelectItem value="PINDAH">Pindah Domisili</SelectItem>
              <SelectItem value="MENINGGAL">Meninggal Dunia</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={gender} onValueChange={(v) => setGender(v || "ALL")}>
            <SelectTrigger className="w-full sm:w-[150px] bg-card border-slate-200 dark:border-white/10">
              <SelectValue placeholder="Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Gender</SelectItem>
              <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
              <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
            <TableRow className="border-b-slate-200 dark:border-white/10">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-12 text-center">No</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">NIK / No. KK</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">L/P</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">No. HP</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  Belum ada data warga terdaftar atau tidak ada hasil pencarian.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((w, index) => (
                <TableRow key={w.id} className="border-b-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="text-center font-medium text-slate-500 dark:text-slate-400">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{w.namaLengkap}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{w.nik}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide">KK: {w.noKk}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{w.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{w.noHp || "-"}</TableCell>
                  <TableCell>
                    {w.statusWarga === "TETAP" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 font-medium">Tetap</Badge>
                    ) : w.statusWarga === "KONTRAK_KOST" ? (
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20 font-medium">Kontrak/Kost</Badge>
                    ) : w.statusWarga === "PINDAH" ? (
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">Pindah</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20">Meninggal</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Link href={`/dashboard/rt/warga/${w.id}/edit`}><Pencil className="w-3.5 h-3.5" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground font-medium">
            Menampilkan <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredWargas.length)}</span> dari <span className="text-foreground">{filteredWargas.length}</span> warga
          </p>
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center px-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                // Show a small window around current page
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 p-0 rounded-lg font-medium text-xs transition-all ${
                        currentPage === page 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1.5 text-muted-foreground text-xs">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
