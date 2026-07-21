"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteSuratArsipAdmin } from "@/app/actions/surat-admin";
import { toast } from "sonner";

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

export function AdminSuratArsipList({ arsips }: { arsips: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus riwayat surat ini secara permanen? File tidak akan bisa diakses lagi.")) return;
    const res = await deleteSuratArsipAdmin(id);
    if (res.success) {
      toast.success("Surat berhasil dihapus.");
    } else {
      toast.error(res.error);
    }
  };

  const filteredArsips = arsips.filter(a => {
    const term = searchTerm.toLowerCase();
    const namaWarga = a.warga?.namaLengkap?.toLowerCase() || "";
    const emailRt = a.tenant?.users?.[0]?.email?.toLowerCase() || "";
    const nomor = a.nomorSurat?.toLowerCase() || "";
    const rt = a.tenant?.rt?.toLowerCase() || "";
    const rw = a.tenant?.rw?.toLowerCase() || "";

    return namaWarga.includes(term) || emailRt.includes(term) || nomor.includes(term) || rt.includes(term) || rw.includes(term);
  });

  const totalPages = Math.ceil(filteredArsips.length / itemsPerPage);
  const currentData = filteredArsips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm w-full md:w-96">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <Input 
          placeholder="Cari warga, email RT, nomor surat..." 
          className="border-0 focus-visible:ring-0 p-0 h-auto bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#141229] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
              <TableRow className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <TableHead className="h-10">Asal RT/RW</TableHead>
                <TableHead className="h-10">Email Akun RT</TableHead>
                <TableHead className="h-10">Nomor & Jenis Surat</TableHead>
                <TableHead className="h-10">Data Warga</TableHead>
                <TableHead className="h-10">Tanggal Pembuatan</TableHead>
                <TableHead className="h-10 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    Tidak ada arsip surat yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((a) => (
                  <TableRow key={a.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-slate-200 dark:border-white/5">
                    <TableCell className="font-medium whitespace-nowrap text-sm">
                      RT {a.tenant?.rt || '-'} / RW {a.tenant?.rw || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {a.tenant?.users?.[0]?.email || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{getFullNomorSurat(a)}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{a.template?.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{a.warga?.namaLengkap || <span className="italic">Warga Dihapus</span>}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">NIK: {a.warga?.nik || '-'}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                          asChild
                        >
                          <a href={`/api/surat/${a.id}/download?download=1`} target="_blank" rel="noreferrer">
                            <Download className="w-3.5 h-3.5 mr-1" /> Unduh
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-slate-200 dark:border-white/10"
                          onClick={() => handleDelete(a.id)}
                        >
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
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
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
