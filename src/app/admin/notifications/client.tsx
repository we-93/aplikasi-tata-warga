"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Bell, Send, Trash2 } from "lucide-react";
import { broadcastNotification, deleteNotification } from "@/app/actions/notifications";

export function NotificationsClient({ initialNotifications, tenants }: { initialNotifications: any[], tenants: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetTenantId: "ALL"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Judul dan isi pesan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    const res = await broadcastNotification(formData);
    if (res.success) {
      toast.success("Notifikasi berhasil dikirim");
      setFormData({ title: "", message: "", targetTenantId: "ALL" });
      // In a real app, we'd fetch the updated list or let server action revalidatePath handle it.
      // Since revalidatePath works, the page will refresh on next navigation or we can just reload.
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus histori notifikasi ini?")) {
      const res = await deleteNotification(id);
      if (res.success) {
        setNotifications(notifications.filter((n: any) => n.id !== id));
        toast.success("Notifikasi dihapus");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Sistem Notifikasi</h2>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Kirim pemberitahuan langsung ke dashboard RT.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-[#6419c1]" /> Buat Pesan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Penerima</Label>
                <Select value={formData.targetTenantId} onValueChange={v => setFormData({...formData, targetTenantId: v || "ALL"})}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-black/20">
                    <SelectValue placeholder="Pilih Penerima" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua RT (Global)</SelectItem>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul Pesan</Label>
                <Input 
                  placeholder="Contoh: Info Update Sistem" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="bg-slate-50 dark:bg-black/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Isi Pesan</Label>
                <textarea 
                  className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm min-h-[120px]"
                  placeholder="Ketik pesan Anda di sini..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#6419c1] hover:bg-[#7735d4] text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                Kirim Notifikasi
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5">
              <h3 className="font-bold">Histori Pengiriman</h3>
            </div>
            <div className="p-0">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Belum ada histori pengiriman notifikasi.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.isGlobal ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {n.isGlobal ? "Semua RT" : n.tenant?.name || "RT Spesifik"}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <h4 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white mb-1">{n.title}</h4>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-white/70 whitespace-pre-wrap">{n.message}</p>
                      </div>
                      <button onClick={() => handleDelete(n.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
