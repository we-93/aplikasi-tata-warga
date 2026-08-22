"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Eye, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { deleteSuratArsip } from "@/app/actions/surat";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const getFullNomorSurat = (a: any) => {
  if (!a.nomorSurat) return '-';
  if (a.kodeSurat) return `${a.nomorSurat}/${a.kodeSurat}`;
  
  const date = new Date(a.createdAt);
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const month = romanMonths[date.getMonth()];
  const year = date.getFullYear();
  const rt = a.tenant?.rt || '000';
  const rw = a.tenant?.rw || '000';
  return `${a.nomorSurat}/${a.template?.code || ''}/RT${rt}-RW${rw}/${month}/${year}`;
};

export function SuratArsipList({ arsips }: { arsips: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("SEMUA");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const uniqueTemplates = Array.from(new Set(arsips.map(a => a.template?.name).filter(Boolean)));

  const filteredArsips = arsips.filter(a => {
    if (filterTemplate !== "SEMUA" && a.template?.name !== filterTemplate) return false;

    const term = searchTerm.toLowerCase();
    const namaWarga = a.warga?.namaLengkap?.toLowerCase() || "";
    const nomor = a.nomorSurat?.toLowerCase() || "";
    
    return namaWarga.includes(term) || nomor.includes(term);
  });

  const totalPages = Math.ceil(filteredArsips.length / itemsPerPage);
  const currentData = filteredArsips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus riwayat surat ini? File PDF tidak akan bisa diakses lagi.")) return;
    const res = await deleteSuratArsip(id);
    if (res.success) {
      toast.success("Surat berhasil dihapus.");
    } else {
      toast.error(res.error);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm w-full md:w-96 flex-1">
          <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
          <Input 
            placeholder="Cari nama warga atau nomor surat..." 
            className="border-0 focus-visible:ring-0 p-0 h-auto bg-transparent text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex-none">
          <Select value={filterTemplate} onValueChange={(v) => { setFilterTemplate(v || "SEMUA"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[220px] h-[38px] bg-white dark:bg-[#141229] border-slate-200 dark:border-white/10 rounded-xl text-sm">
              <SelectValue placeholder="Jenis Surat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMUA">Semua Jenis Surat</SelectItem>
              {uniqueTemplates.map((t: any) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MOBILE: Card Layout */}
      <div className="md:hidden space-y-4">
        {currentData.length === 0 ? (
          <div className="bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            Belum ada riwayat pembuatan surat.
          </div>
        ) : (
          currentData.map((a, index) => (
            <div key={a.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-md">
                    #{((currentPage - 1) * itemsPerPage) + index + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {getFullNomorSurat(a)}
                  </span>
                </div>
                <div className="text-xs text-black bg-[#fad700] px-2 py-1 rounded-md border border-[#fad700]/20 font-medium">
                  {new Date(a.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-slate-500">Jenis Surat</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100">{a.template?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-slate-500">Pemohon</span>
                  <span className="col-span-2 font-medium text-[#6419c1] dark:text-[#8b3ced]">{a.warga?.namaLengkap || <span className="text-slate-400 italic">Dihapus</span>}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/rt/surat/${a.id}`)} className="h-8 flex-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                  <div className="flex items-center justify-center w-full">
                    <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" /> <span className="truncate">Lihat Detail</span>
                  </div>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)} className="h-8 flex-1 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP: Table Layout */}
      <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-white/10 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
            <TableRow className="border-b-slate-200 dark:border-white/10">
              <TableHead className="w-12 text-center font-semibold text-slate-700 dark:text-slate-300">NO</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nomor Surat</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Jenis Surat</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nama Warga</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Pembuatan</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                Belum ada riwayat pembuatan surat.
              </TableCell>
            </TableRow>
          ) : (
            currentData.map((a, index) => (
              <TableRow key={a.id} className="border-b-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <TableCell className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="font-medium tracking-wide text-slate-900 dark:text-slate-100">{getFullNomorSurat(a)}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-300">{a.template?.name}</TableCell>
                <TableCell className="font-medium text-[#6419c1] dark:text-[#8b3ced]">{a.warga?.namaLengkap || <span className="text-slate-400 italic">Warga Dihapus</span>}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-300">{new Date(a.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/rt/surat/${a.id}`)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(a.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium">
            Menampilkan <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredArsips.length)}</span> dari <span className="text-foreground">{filteredArsips.length}</span> surat
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
