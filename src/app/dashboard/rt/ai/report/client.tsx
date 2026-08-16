"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Bot, Copy, Save, Eye, Trash2 } from "lucide-react";
import { generateAiReport } from "@/app/actions/ai";
import { terbitkanPengumuman, hapusPengumuman } from "@/app/actions/pengumuman";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ReportClient({ initialPengumuman = [] }: { initialPengumuman?: any[] }) {
  const [reportForm, setReportForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [reportResult, setReportResult] = useState("");
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [pengumumans, setPengumumans] = useState<any[]>(initialPengumuman);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setReportResult("");
    
    const res = await generateAiReport(reportForm.month, reportForm.year);
    if (res.success) {
      setReportResult(res.text);
      toast.success("Draf laporan berhasil dibuat!");
    } else {
      toast.error(res.error);
    }
    setIsReportLoading(false);
  };

  const handlePublishReport = async () => {
    if (!reportResult) return;
    setIsPublishing(true);
    const id = toast.loading("Menerbitkan laporan ke pengumuman...");
    const monthName = new Date(0, reportForm.month - 1).toLocaleString('id-ID', { month: 'long' });
    const title = `Laporan Kas Bulan ${monthName} ${reportForm.year}`;
    
    const res = await terbitkanPengumuman({ title, content: reportResult });
    if (res.success) {
      toast.success("Laporan berhasil diterbitkan ke Dashboard RT!", { id });
      
      const newP = {
        id: Math.random().toString(),
        title,
        content: reportResult,
        createdAt: new Date().toISOString()
      };
      setPengumumans([newP, ...pengumumans]);

      setReportResult("");
    } else {
      toast.error(res.error || "Gagal menerbitkan laporan", { id });
    }
    setIsPublishing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Teks disalin ke clipboard");
  };

  const handleDeleteArchive = async (id: string) => {
    if (!confirm("Hapus arsip ini? Data yang sudah dihapus tidak bisa dikembalikan.")) return;
    
    setIsDeleting(id);
    const toastId = toast.loading("Menghapus arsip...");
    
    const res = await hapusPengumuman(id);
    if (res.success) {
      toast.success("Arsip berhasil dihapus.", { id: toastId });
      setPengumumans(pengumumans.filter(p => p.id !== id));
    } else {
      toast.error(res.error || "Gagal menghapus arsip", { id: toastId });
    }
    setIsDeleting(null);
  };

  return (
    <>
    <div className="flex flex-col gap-6 mt-0 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h2 className="text-xl font-bold border-b pb-2">Opsi Laporan</h2>
        
          <div className="space-y-2">
            <Label>Bulan</Label>
            <Select value={reportForm.month.toString()} onValueChange={(v) => setReportForm({...reportForm, month: parseInt(v || "1")})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i+1} value={(i+1).toString()}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tahun</Label>
            <Input type="number" value={reportForm.year} onChange={e => setReportForm({...reportForm, year: parseInt(e.target.value)})} />
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4" onClick={handleGenerateReport} disabled={isReportLoading}>
            {isReportLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            Buat Laporan AI
          </Button>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Laporan Naratif AI</h2>
          {reportResult ? (
            <div className="flex-1 flex flex-col gap-4">
              <Textarea 
                value={reportResult} 
                onChange={(e) => setReportResult(e.target.value)}
                className="flex-1 min-h-[300px] resize-none font-mono text-sm leading-relaxed" 
              />
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(reportResult)} className="flex-1 bg-card border border-border-card-foreground">
                  <Copy className="w-4 h-4 mr-2" /> Salin Laporan
                </Button>
                <Button onClick={handlePublishReport} disabled={isPublishing} className="flex-1 bg-primary text-primary-foreground">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Terbitkan di Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-center px-8">
              Pilih bulan dan tahun, lalu AI akan merangkum seluruh transaksi keuangan kas Anda menjadi laporan naratif yang siap dibagikan ke warga.
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b pb-2 mb-4">Arsip Laporan Terbit</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Tanggal Terbit</th>
                <th className="px-5 py-3 font-semibold">Judul Laporan</th>
                <th className="px-5 py-3 font-semibold">Isi (Pratinjau)</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengumumans.filter(p => p.title.toLowerCase().includes('laporan')).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">Belum ada laporan yang diterbitkan.</td>
                </tr>
              ) : (
                pengumumans.filter(p => p.title.toLowerCase().includes('laporan')).map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-5 py-3 font-medium">{p.title}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <div className="line-clamp-2">{p.content}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewItem(p)} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteArchive(p.id)} disabled={isDeleting === p.id} className="h-8 w-8 p-0">
                          {isDeleting === p.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{viewItem?.title}</DialogTitle>
          <DialogDescription>
            Diterbitkan pada: {viewItem ? new Date(viewItem.createdAt).toLocaleString('id-ID') : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 p-4 rounded-md border">
            {viewItem?.content}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => copyToClipboard(viewItem?.content || "")}>
            <Copy className="w-4 h-4 mr-2" /> Salin Teks
          </Button>
          <Button onClick={() => setViewItem(null)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
