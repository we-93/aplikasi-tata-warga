"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, FileText, UploadCloud, File, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadKnowledgeDocument, deleteKnowledgeDocument } from "@/app/actions/knowledge";
import Link from "next/link";

export function KnowledgeClient({ 
  initialDocuments,
  qdrantConfigured
}: { 
  initialDocuments: any[];
  qdrantConfigured: boolean;
}) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.name.endsWith(".txt")) {
      toast.error("Hanya file PDF dan TXT yang didukung saat ini.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ukuran file maksimal adalah 20MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    toast.info("Mengunggah dan memproses dokumen... (Bisa memakan waktu beberapa menit)");
    
    try {
      const res = await uploadKnowledgeDocument(formData);
      if (res.success) {
        toast.success("Dokumen berhasil diproses dan disimpan ke Qdrant.");
        router.refresh(); // Refresh data from server
        // Update local state optimistic
        setDocuments([{...res.doc}, ...documents]);
      } else {
        toast.error(res.error || "Gagal memproses dokumen.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat memproses dokumen.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus dokumen ini dari Knowledge Base?")) return;
    
    const toastId = toast.loading("Menghapus dokumen...");
    try {
      const res = await deleteKnowledgeDocument(id);
      if (res.success) {
        toast.success("Dokumen berhasil dihapus", { id: toastId });
        setDocuments(documents.filter(d => d.id !== id));
      } else {
        toast.error(res.error || "Gagal menghapus", { id: toastId });
      }
    } catch(err) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Knowledge Base AI</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Unggah dokumen Perda, Perbup, atau aturan lainnya untuk dipelajari oleh Chatbot.</p>
        </div>
      </div>

      {!qdrantConfigured && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">Qdrant Belum Dikonfigurasi</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Anda perlu mengisi URL dan API Key Qdrant di halaman Pengaturan Integrasi sebelum bisa mengunggah dokumen.</p>
            <Link href="/admin/integrations">
              <Button size="sm" variant="outline" className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/20">Buka Integrasi</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Upload */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141229] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] text-center">
            <div className="w-16 h-16 bg-[#6419c1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-[#6419c1] dark:text-[#a05ce8]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload Dokumen</h2>
            <p className="text-xs text-slate-500 dark:text-white/50 mb-6">File PDF dan TXT didukung (Maks. 20MB).</p>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileUpload} 
                disabled={!qdrantConfigured || isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button className="w-full bg-[#6419c1] hover:bg-[#6419c1]/90 text-white rounded-xl py-6" disabled={!qdrantConfigured || isUploading}>
                {isUploading ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                ) : (
                  "Pilih File..."
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Kolom Daftar Dokumen */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#141229] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)]">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dokumen Tersimpan</h2>
              <div className="text-sm font-medium bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full text-slate-600 dark:text-white/60">
                {documents.length} Dokumen
              </div>
            </div>

            <div className="overflow-x-auto">
              {documents && documents.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 dark:text-white/50 bg-slate-50 dark:bg-white/5 uppercase rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Nama File</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Tgl Upload</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc: any) => (
                      <tr key={doc.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-white/90 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="truncate max-w-[150px]" title={doc.filename}>{doc.filename}</span>
                        </td>
                        <td className="px-4 py-3">
                          {doc.status === 'READY' ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs font-semibold">Ready</span>
                          ) : doc.status === 'FAILED' ? (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded text-xs font-semibold" title={doc.error}>Gagal</span>
                          ) : (
                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded text-xs font-semibold">Proses</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/50">
                          {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 border-dashed">
                  <File className="w-10 h-10 text-slate-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-white/50 font-medium">Belum ada dokumen yang diunggah.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
