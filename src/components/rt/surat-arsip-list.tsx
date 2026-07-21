"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteSuratArsip } from "@/app/actions/surat";
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

export function SuratArsipList({ arsips }: { arsips: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(arsips.length / itemsPerPage);
  const currentData = arsips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nomor Surat</TableHead>
            <TableHead>Jenis Surat</TableHead>
            <TableHead>Nama Warga</TableHead>
            <TableHead>Tanggal Pembuatan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                Belum ada riwayat pembuatan surat.
              </TableCell>
            </TableRow>
          ) : (
            currentData.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{getFullNomorSurat(a)}</TableCell>
                <TableCell>{a.template?.name}</TableCell>
                <TableCell>{a.warga?.namaLengkap || <span className="text-muted-foreground italic">Warga Dihapus</span>}</TableCell>
                <TableCell>{new Date(a.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <a href={`/api/surat/${a.id}/download`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </a>
                    <a href={`/api/surat/${a.id}/download?download=1`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Unduh">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(a.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium">
            Menampilkan <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, arsips.length)}</span> dari <span className="text-foreground">{arsips.length}</span> surat
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
