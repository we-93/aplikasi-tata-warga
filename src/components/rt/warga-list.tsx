"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, FileText } from "lucide-react";
import Link from "next/link";

export function WargaListRt({ wargas }: { wargas: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 15;

  // 1. Group all wargas by noKk
  const wargasByKk: Record<string, any[]> = {};
  wargas.forEach(w => {
    if (!w.noKk) return;
    if (!wargasByKk[w.noKk]) wargasByKk[w.noKk] = [];
    wargasByKk[w.noKk].push(w);
  });

  // 2. Filter KKs based on search query
  // A KK is included if ANY of its members matches the search query
  const filteredKkKeys = Object.keys(wargasByKk).filter(noKk => {
    if (!search) return true;
    const members = wargasByKk[noKk];
    return members.some(w => 
      w.namaLengkap?.toLowerCase().includes(search.toLowerCase()) || 
      (w.nik && w.nik.toLowerCase().includes(search.toLowerCase())) ||
      (w.noKk && w.noKk.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredKkKeys.length / itemsPerPage);
  const currentKkKeys = filteredKkKeys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
            placeholder="Cari berdasarkan Nama, NIK Anggota, atau No KK..." 
            className="pl-9 bg-card border-slate-200 dark:border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
            <TableRow className="border-b-slate-200 dark:border-white/10">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-12 text-center">No</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">No. KK</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Kepala Keluarga</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Jml Anggota</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Alamat</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentKkKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                  Belum ada data Kartu Keluarga atau tidak ada hasil pencarian.
                </TableCell>
              </TableRow>
            ) : (
              currentKkKeys.map((noKk, index) => {
                const members = wargasByKk[noKk];
                // Try to find the actual kepala keluarga, fallback to the first member if not explicitly defined
                const kepalaKeluarga = members.find(m => m.hubunganKeluarga === "KEPALA_KELUARGA") || members[0];

                return (
                  <TableRow key={noKk} className="border-b-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="text-center font-medium text-slate-500 dark:text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium tracking-wide text-slate-900 dark:text-slate-100">{noKk}</TableCell>
                    <TableCell className="font-medium text-[#6419c1] dark:text-[#8b3ced]">
                      {kepalaKeluarga.namaLengkap}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                        {members.length} Orang
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {kepalaKeluarga.alamat || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" asChild className="h-8 hover:bg-[#6419c1]/10 hover:text-[#6419c1] hover:border-[#6419c1]/30 transition-colors">
                          <Link href={`/dashboard/rt/warga/kk/${noKk}`}>
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Detail
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground font-medium">
            Menampilkan <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredKkKeys.length)}</span> dari <span className="text-foreground">{filteredKkKeys.length}</span> KK
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
                          ? "bg-[#6419c1] hover:bg-[#6419c1]/90 text-white shadow-md shadow-[#6419c1]/20" 
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
