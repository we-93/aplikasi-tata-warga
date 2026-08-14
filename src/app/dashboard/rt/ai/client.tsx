"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Send, Bot, User, Mic, Image as ImageIcon, Copy, Paperclip, X, Save, Eye, Trash2 } from "lucide-react";
import { chatWithAi, generateAiBroadcast, generateAiReport } from "@/app/actions/ai";
import { terbitkanPengumuman, hapusPengumuman } from "@/app/actions/pengumuman";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AiClient({ initialPengumuman = [] }: { initialPengumuman?: any[] }) {
  // Chat State
  const [messages, setMessages] = useState<{ role: string; content: any }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Broadcast State
  const [broadcastForm, setBroadcastForm] = useState({ topic: "", tone: "Formal & Sopan", kegiatan: "", waktu: "", lokasi: "" });
  const [broadcastResult, setBroadcastResult] = useState("");
  const [isBroadcastLoading, setIsBroadcastLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Report State
  const [reportForm, setReportForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [reportResult, setReportResult] = useState("");
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Archive State
  const [pengumumans, setPengumumans] = useState<any[]>(initialPengumuman);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      // Convert to base64 for vision
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast.success("Gambar berhasil dilampirkan");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Format file tidak didukung. Harap pilih gambar.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() && !attachedImage) return;

    // Build the user message content
    let userContent: any = chatInput;
    if (attachedImage) {
      userContent = [
        { type: "text", text: chatInput || "Tolong jelaskan gambar ini" },
        { type: "image_url", image_url: { url: attachedImage } }
      ];
    }

    const newMessage = { role: "user", content: userContent };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setChatInput("");
    setAttachedImage(null);
    setIsChatLoading(true);

    try {
      const res = await chatWithAi(newMessages);
      if (res.success) {
        setMessages([...newMessages, res.message]);
      } else {
        toast.error(res.error || "Gagal menghubungi AI");
        // Remove the message if failed so they can try again? Or just leave it.
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsChatLoading(false);
    }
  };

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
      
      // Update local state without refresh
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
    <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="flex w-full justify-start md:grid md:grid-cols-3 mb-4 overflow-x-auto h-auto p-1">
        <TabsTrigger value="chat" className="data-active:!bg-[#6419c1] data-active:!text-white">Chat AI</TabsTrigger>
        <TabsTrigger value="broadcast" className="data-active:!bg-[#6419c1] data-active:!text-white">Broadcast Pengumuman</TabsTrigger>
        <TabsTrigger value="report" className="data-active:!bg-[#6419c1] data-active:!text-white">Laporan Kas</TabsTrigger>
      </TabsList>

      {/* CHAT TAB */}
      <TabsContent value="chat" className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm mt-0">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
              <Bot className="w-16 h-16 mb-4 text-primary" />
              <p>Mulai obrolan dengan AI Assistant.</p>
              <p className="text-sm">Bisa kirim teks atau foto laporan.</p>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && <div className="w-8 h-8 rounded-full bg-card border border-border-card-foreground shrink-0 flex items-center justify-center text-primary"><Bot className="w-4 h-4" /></div>}
              
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                {typeof m.content === 'string' ? (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {m.content.map((c: any, i: number) => {
                      if (c.type === 'text') return <div key={i} className="whitespace-pre-wrap">{c.text}</div>;
                      if (c.type === 'image_url') return <img key={i} src={c.image_url.url} alt="Uploaded" className="max-w-[250px] rounded-lg border border-white/20" />;
                      return null;
                    })}
                  </div>
                )}
              </div>

              {m.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 shrink-0"><User className="w-4 h-4" /></div>}
            </div>
          ))}
          {isChatLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-card border border-border-card-foreground shrink-0 flex items-center justify-center text-primary"><Bot className="w-4 h-4" /></div>
              <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                Asisten RT sedang mengetik....
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t bg-muted/30">
          {attachedImage && (
            <div className="mb-3 relative inline-block">
              <img src={attachedImage} alt="Preview" className="h-20 w-auto rounded-md border shadow-sm" />
              <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-foreground rounded-full p-1 shadow hover:bg-red-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileAttach} />
            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Lampirkan Foto">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input 
              placeholder="Tanya sesuatu ke AI atau minta rangkum catatan..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') handleSendChat() }}
              className="flex-1 bg-white dark:bg-black"
            />
            <Button className="bg-[#6419c1] hover:bg-[#7735d4] text-white" onClick={handleSendChat} disabled={isChatLoading || (!chatInput.trim() && !attachedImage)}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* BROADCAST TAB */}
      <TabsContent value="broadcast" className="flex flex-col gap-6 mt-0 overflow-y-auto">
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

        {/* Arsip Pengumuman Table */}
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
      </TabsContent>

      {/* REPORT TAB */}
      <TabsContent value="report" className="flex flex-col gap-6 mt-0 overflow-y-auto">
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

        {/* Arsip Laporan Table */}
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
      </TabsContent>
    </Tabs>

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
  </>);
}
