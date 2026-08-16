"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Bot, Copy, Save, Eye, Trash2 } from "lucide-react";
import { generateAiBroadcast } from "@/app/actions/ai";
import { terbitkanPengumuman, hapusPengumuman } from "@/app/actions/pengumuman";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function BroadcastClient({ initialPengumuman = [] }: { initialPengumuman?: any[] }) {
  const [broadcastForm, setBroadcastForm] = useState({ topic: "", tone: "Formal & Sopan", kegiatan: "", waktu: "", lokasi: "" });
  const [broadcastResult, setBroadcastResult] = useState("");
  const [isBroadcastLoading, setIsBroadcastLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [pengumumans, setPengumumans] = useState<any[]>(initialPengumuman);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleGenerateBroadcast = async () => {
    if (!broadcastForm.topic) return toast.error("Topik pengumuman wajib diisi");
    
    setIsBroadcastLoading(true);
    setBroadcastResult("");
    
    const res = await generateAiBroadcast(broadcastForm);
    if (res.success) {
      setBroadcastResult(res.text);
      toast.success("Draf pengumuman berhasil dibuat!");
    } else {
      toast.error(res.error);
    }
    setIsBroadcastLoading(false);
  };

  const handlePublishBroadcast = async () => {
    if (!broadcastResult) return;
    setIsPublishing(true);
    const id = toast.loading("Menerbitkan pengumuman...");
    const title = broadcastForm.topic || "Pengumuman Warga";
    
    const res = await terbitkanPengumuman({ title, content: broadcastResult });
    if (res.success) {
      toast.success("Pengumuman berhasil diterbitkan ke Dashboard RT!", { id });
      
      const newP = {
        id: Math.random().toString(),
        title,
        content: broadcastResult,
        createdAt: new Date().toISOString()
      };
      setPengumumans([newP, ...pengumumans]);

      setBroadcastResult("");
      setBroadcastForm({ topic: "", tone: "Formal & Sopan", kegiatan: "", waktu: "", lokasi: "" });
    } else {
      toast.error(res.error || "Gagal menerbitkan pengumuman", { id });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Buat Pengumuman</h2>
        
          <div className="space-y-2">
            <Label>Topik Utama / Pesan <span className="text-red-500">*</span></Label>
            <Input placeholder="Contoh: Kerja Bakti Membersihkan Selokan" value={broadcastForm.topic} onChange={e => setBroadcastForm({...broadcastForm, topic: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Kegiatan (Opsional)</Label>
              <Input placeholder="Kerja Bakti Rutin" value={broadcastForm.kegiatan || ""} onChange={e => setBroadcastForm({...broadcastForm, kegiatan: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Waktu (Opsional)</Label>
              <Input placeholder="Minggu, 08:00 WIB" value={broadcastForm.waktu || ""} onChange={e => setBroadcastForm({...broadcastForm, waktu: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lokasi (Opsional)</Label>
              <Input placeholder="Fasum RT 01" value={broadcastForm.lokasi || ""} onChange={e => setBroadcastForm({...broadcastForm, lokasi: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Gaya Bahasa</Label>
              <Select value={broadcastForm.tone || ""} onValueChange={(v) => setBroadcastForm({...broadcastForm, tone: v || ""})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal & Sopan">Formal & Sopan</SelectItem>
                  <SelectItem value="Santai & Ramah">Santai & Ramah</SelectItem>
                  <SelectItem value="Tegas & Mendesak">Tegas & Mendesak</SelectItem>
                  <SelectItem value="Singkat & Padat">Singkat & Padat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4" onClick={handleGenerateBroadcast} disabled={isBroadcastLoading}>
            {isBroadcastLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            Generate Teks AI
          </Button>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Hasil Draft</h2>
          {broadcastResult ? (
            <div className="flex-1 flex flex-col gap-4">
              <Textarea 
                value={broadcastResult} 
                onChange={(e) => setBroadcastResult(e.target.value)}
                className="flex-1 min-h-[300px] resize-none font-mono text-sm" 
              />
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(broadcastResult)} className="flex-1 bg-card border border-border-card-foreground">
                  <Copy className="w-4 h-4 mr-2" /> Salin WA
                </Button>
                <Button onClick={handlePublishBroadcast} disabled={isPublishing} className="flex-1 bg-primary text-primary-foreground">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Terbitkan di Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Isi form di samping untuk membuat draft pengumuman.
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b pb-2 mb-4">Arsip Pengumuman Diterbitkan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Tanggal Terbit</th>
                <th className="px-5 py-3 font-semibold">Judul Pengumuman</th>
                <th className="px-5 py-3 font-semibold">Isi (Pratinjau)</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengumumans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">Belum ada pengumuman yang diterbitkan.</td>
                </tr>
              ) : (
                pengumumans.map((p) => (
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

    <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{viewItem?.title}</DialogTitle>
          <DialogDescription>Diterbitkan pada: {viewItem?.createdAt && new Date(viewItem.createdAt).toLocaleDateString('id-ID')}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg whitespace-pre-wrap font-mono text-sm max-h-[60vh] overflow-y-auto">
          {viewItem?.content}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => copyToClipboard(viewItem?.content || "")} className="bg-card border border-border-card-foreground">
            <Copy className="w-4 h-4 mr-2" /> Salin WA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
