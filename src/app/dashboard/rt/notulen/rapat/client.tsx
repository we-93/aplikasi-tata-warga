"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, Plus, Bot, FileText, Trash2, ChevronRight, ChevronLeft,
  Mic, Upload, Save, Eye, Calendar, Users, Image as ImageIcon, Type, Copy
} from "lucide-react";
import { generateNotulen, saveNotulen, deleteNotulen } from "@/app/actions/notulen";
import { transcribeImage } from "@/app/actions/ai";

type Notulen = {
  id: string;
  judulRapat: string;
  tanggalRapat: string;
  peserta: string | null;
  agendaRapat: string | null;
  hasilRapat: string | null;
  tindakLanjut: string | null;
  fullNotulen: string;
  tokenUsed: number;
  createdAt: string;
};

export function NotulenClient({ initialNotulens = [] }: { initialNotulens?: any[] }) {
  const [notulens, setNotulens] = useState<any[]>(initialNotulens);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(notulens.length / itemsPerPage);
  const currentData = notulens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Modal / Detail state
  const [selectedNotulen, setSelectedNotulen] = useState<Notulen | null>(null);

  // Form state (Left Column)
  const [judulRapat, setJudulRapat] = useState("");
  const [tanggalRapat, setTanggalRapat] = useState(new Date().toISOString().split("T")[0]);
  
  // Input Modes: "image" | "text"
  const [inputMode, setInputMode] = useState<"image" | "text">("text");
  
  const [rawInput, setRawInput] = useState("");
  
  // Loading states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Review state (Right Column)
  const [reviewData, setReviewData] = useState<{
    peserta: string;
    agendaRapat: string;
    hasilRapat: string;
    tindakLanjut: string;
    fullNotulen: string;
    tokenUsed: number;
    rawTranskrip: string;
    logId?: string;
  } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsTranscribing(true);
    const id = toast.loading("Membaca teks dari gambar... ⏳");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await transcribeImage(formData);
      if (res?.success) {
        setRawInput(prev => prev + (prev ? "\n\n" : "") + res.text);
        setInputMode("text"); // Switch back to text tab to show result
        toast.success("Teks dari gambar berhasil diekstrak!", { id });
      } else {
        toast.error(res?.error || "Gagal ekstrak gambar", { id });
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.", { id });
    } finally {
      setIsTranscribing(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!judulRapat.trim()) return toast.error("Judul rapat wajib diisi!");
    if (!rawInput.trim()) return toast.error("Catatan mentah (atau hasil transkripsi) tidak boleh kosong!");
    setIsGenerating(true);
    const id = toast.loading("Sekretaris AI sedang menyusun notulen... 🤖");
    try {
      const res = await generateNotulen({ judulRapat, tanggalRapat, rawInput });
      if (res.success && res.data) {
        setReviewData({
          peserta: res.data.peserta || "",
          agendaRapat: res.data.agendaRapat || "",
          hasilRapat: res.data.hasilRapat || "",
          tindakLanjut: res.data.tindakLanjut || "",
          fullNotulen: res.data.fullNotulen || "",
          tokenUsed: res.tokenUsed || 0,
          logId: res.logId,
          rawTranskrip: rawInput
        });
        toast.success(`Notulen berhasil disusun! (${res.tokenUsed} token terpakai)`, { id });
      } else {
        toast.error(res.error || "Gagal membuat notulen", { id });
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.", { id });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!reviewData) return;
    setIsSaving(true);
    const id = toast.loading("Menyimpan notulen ke arsip...");
    try {
      const res = await saveNotulen({
        judulRapat,
        tanggalRapat,
        peserta: reviewData.peserta,
        agendaRapat: reviewData.agendaRapat,
        hasilRapat: reviewData.hasilRapat,
        tindakLanjut: reviewData.tindakLanjut,
        fullNotulen: reviewData.fullNotulen,
        rawTranskrip: reviewData.rawTranskrip,
        tokenUsed: reviewData.tokenUsed,
        logId: reviewData.logId
      });
      if (res.success) {
        toast.success("Notulen berhasil disimpan ke arsip! ✅", { id });
        setJudulRapat("");
        setTanggalRapat(new Date().toISOString().split("T")[0]);
        setRawInput("");
        setReviewData(null);
        window.location.reload();
      } else {
        toast.error(res.error || "Gagal menyimpan", { id });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus notulen ini dari arsip?")) return;
    const res = await deleteNotulen(id);
    if (res.success) {
      setNotulens(prev => prev.filter(n => n.id !== id));
      if (selectedNotulen?.id === id) { setSelectedNotulen(null); }
      toast.success("Notulen dihapus.");
    } else {
      toast.error(res.error || "Gagal menghapus");
    }
  };

  const handleCopyText = () => {
    if (!reviewData?.fullNotulen) return;
    navigator.clipboard.writeText(reviewData.fullNotulen);
    toast.success("Teks berhasil disalin! Siap di-paste ke WhatsApp.");
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 2 COLUMNS LAYOUT */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* KOLOM KIRI: INPUT */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col space-y-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Informasi Rapat</h2>
            <p className="text-sm text-muted-foreground mt-1">Isi judul dan tanggal, lalu sediakan teks mentah/rekaman/foto catatan.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Judul / Nama Rapat <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Misal: Rapat Bulanan RT, Musyawarah Iuran..."
                value={judulRapat}
                onChange={e => setJudulRapat(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Rapat <span className="text-red-500">*</span></Label>
              <Input type="date" value={tanggalRapat} onChange={e => setTanggalRapat(e.target.value)} />
            </div>
          </div>

          {/* Mode Input Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Metode Input Catatan Mentah</Label>
            <div className="flex bg-muted p-1 rounded-xl">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${inputMode === "text" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"}`}
                onClick={() => setInputMode("text")}
              >
                <Type className="w-4 h-4"/> Teks Manual
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${inputMode === "image" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"}`}
                onClick={() => setInputMode("image")}
              >
                <ImageIcon className="w-4 h-4"/> Gambar
              </button>
            </div>

            {/* Input Areas depending on mode */}


            {inputMode === "image" && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3 text-center">
                <ImageIcon className="w-10 h-10 text-primary mx-auto opacity-50" />
                <p className="text-sm font-medium text-primary">Upload Foto Catatan Papan Tulis / Kertas</p>
                <p className="text-xs text-muted-foreground">Upload foto. AI akan membaca teks dari gambar tersebut (OCR).</p>
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <Button
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 mt-2"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isTranscribing ? "Membaca Gambar..." : "Pilih File Gambar"}
                </Button>
              </div>
            )}

            {inputMode === "text" && (
              <div className="space-y-2 mt-4">
                <Label>Teks Catatan Mentah</Label>
                <Textarea
                  className="min-h-[180px] resize-none text-sm"
                  placeholder="Ketik catatan disini (AI akan menyusun notulen Anda)..."
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-2 mt-auto">
            <Button
              className="w-full py-6 text-base font-semibold"
              onClick={handleGenerate}
              disabled={isGenerating || !judulRapat.trim() || !rawInput.trim()}
            >
              {isGenerating
                ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sedang Menyusun Notulen...</>
                : <><Bot className="w-5 h-5 mr-2" /> Generate Notulen Otomatis</>
              }
            </Button>
          </div>
        </div>


        {/* KOLOM KANAN: OUTPUT & REVIEW */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col space-y-4 relative">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Bot className="w-5 h-5 text-emerald-600"/> Hasil Generate (Review & Edit)</h2>
            <p className="text-sm text-muted-foreground mt-1">Dokumen notulen lengkap yang siap disalin ke grup WhatsApp.</p>
          </div>

          {!reviewData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl p-8 bg-muted/20 opacity-60">
              <Bot className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg text-muted-foreground">Belum ada hasil</h3>
              <p className="text-sm text-muted-foreground">Isi form di sebelah kiri dan klik Generate Notulen untuk melihat hasilnya di sini.</p>
            </div>
          ) : (
            <>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3 text-sm text-emerald-700 dark:text-emerald-300">
                ✅ AI berhasil menyusun notulen (<strong>{reviewData.tokenUsed} token</strong>). Anda bisa mengeditnya langsung di bawah ini.
              </div>
              
              <Textarea
                className="flex-1 min-h-[350px] resize-none text-sm font-mono leading-relaxed"
                value={reviewData.fullNotulen}
                onChange={e => setReviewData({ ...reviewData, fullNotulen: e.target.value })}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleCopyText}>
                  <Copy className="w-4 h-4 mr-2" /> Salin Teks (WhatsApp)
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan ke Arsip
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* KOLOM BAWAH: ARSIP NOTULEN */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">🗂️ Arsip Notulen Rapat</h2>
          <span className="text-sm bg-muted px-3 py-1 rounded-full font-medium">{notulens.length} Arsip</span>
        </div>

        {currentData.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 border border-dashed rounded-xl">
            <h3 className="font-semibold text-muted-foreground">Arsip masih kosong</h3>
          </div>
        ) : (
          <div className="grid gap-3">
            {currentData.map(n => (
              <div key={n.id} className="bg-background border rounded-xl p-4 hover:border-primary transition-all flex items-center justify-between gap-4 cursor-pointer" onClick={() => setSelectedNotulen(n)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{n.judulRapat}</h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(n.tanggalRapat).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); setSelectedNotulen(n); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 border-t pt-4">
            <p className="text-xs text-muted-foreground font-medium">
              Menampilkan <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, notulens.length)}</span> dari <span className="text-foreground">{notulens.length}</span> arsip
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

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedNotulen} onOpenChange={(open) => !open && setSelectedNotulen(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedNotulen && (
            <>
              <DialogHeader className="mb-4 border-b pb-4">
                <DialogTitle className="text-2xl">{selectedNotulen.judulRapat}</DialogTitle>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedNotulen.tanggalRapat).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="bg-muted/30 rounded-xl p-5 border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">📄 Dokumen Notulen</h3>
                  <div className="whitespace-pre-wrap break-words text-sm font-mono leading-relaxed selection:bg-primary/20">
                    {selectedNotulen.fullNotulen}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(selectedNotulen.fullNotulen);
                    toast.success("Teks disalin ke clipboard!");
                  }}>
                    <Copy className="w-4 h-4 mr-2" /> Salin Teks
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(selectedNotulen.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Arsip
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
