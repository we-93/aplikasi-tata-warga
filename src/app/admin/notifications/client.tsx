"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveNotificationSettings } from "@/app/actions/notifications";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function NotificationsClient({ settings }: { settings: any }) {
  const [config, setConfig] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveNotificationSettings(config);
    if (res.success) {
      toast.success("Pengaturan Notifikasi Pusat berhasil disimpan!");
    } else {
      toast.error(res.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Notifikasi Pusat</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Konfigurasi notifikasi WhatsApp terpusat dari admin ke tenant.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 md:p-8 space-y-6 max-w-4xl">
        <div className="space-y-3">
          <Label className="text-slate-900 dark:text-white font-semibold">Provider Notifikasi Pusat</Label>
          <div className="w-full md:w-1/3">
            <Select value={config.waAdminProvider} onValueChange={(v) => setConfig({...config, waAdminProvider: v || "FONNTE"})}>
              <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl focus:ring-[#6419c1] text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FONNTE">Fonnte</SelectItem>
                <SelectItem value="APICOID">Api.co.id</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-900 dark:text-white font-semibold">Admin WA API Key (Token)</Label>
          <div className="relative w-full md:w-1/2">
            <input 
              type={showToken ? "text" : "password"} 
              placeholder="Token WA Pusat..." 
              value={config.waAdminApiKey} 
              onChange={e => setConfig({...config, waAdminApiKey: e.target.value})}
              className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-white/10 mt-8">
          <div className="space-y-3">
            <Label className="text-blue-600 dark:text-blue-400 font-bold text-base">Template WA Selamat Datang (Pendaftar Baru)</Label>
            <textarea 
              className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-light"
              value={config.waAdminWelcomeTemplate}
              onChange={e => setConfig({...config, waAdminWelcomeTemplate: e.target.value})}
            />
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">Variabel: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{nama}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{produk}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{invoice}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{harga}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{bank}}`}</code></p>
          </div>

          <div className="space-y-3">
            <Label className="text-emerald-600 dark:text-emerald-400 font-bold text-base">Template ACC Registrasi</Label>
            <textarea 
              className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white font-light"
              value={config.waAdminTemplate}
              onChange={e => setConfig({...config, waAdminTemplate: e.target.value})}
            />
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">Variabel: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{invoice}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{email}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{password}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{bot_wa}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{link_login}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{link_grup}}`}</code></p>
          </div>

          <div className="space-y-3">
            <Label className="text-[#6419c1] dark:text-[#a064fa] font-bold text-base">Template Invoice Tagihan Baru</Label>
            <textarea 
              className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white font-light"
              value={config.waAdminInvoiceTemplate}
              onChange={e => setConfig({...config, waAdminInvoiceTemplate: e.target.value})}
            />
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">Variabel: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{invoice}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{paket}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{harga}}`}</code></p>
          </div>

          <div className="space-y-3">
            <Label className="text-teal-600 dark:text-teal-400 font-bold text-base">Template ACC Pembayaran (Topup & Perpanjang)</Label>
            <textarea 
              className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white font-light"
              value={config.waAdminTopupTemplate || ""}
              onChange={e => setConfig({...config, waAdminTopupTemplate: e.target.value})}
            />
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">Variabel: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{nama}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{invoice}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{tanggal}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{produk}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{harga}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{link_login}}`}</code></p>
          </div>

          <div className="space-y-3">
            <Label className="text-orange-500 font-bold text-base">Template Peringatan H-7 Expired</Label>
            <textarea 
              className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-slate-900 dark:text-white font-light"
              value={config.waAdminExpired7DaysTemplate}
              onChange={e => setConfig({...config, waAdminExpired7DaysTemplate: e.target.value})}
            />
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">Variabel: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{paket}}`}</code>, <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{tanggal}}`}</code></p>
          </div>

          <div className="space-y-3">
            <Label className="text-red-500 font-bold text-base">Template Hari H Expired (Suspend)</Label>
            <textarea 
              className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all text-slate-900 dark:text-white font-light"
              value={config.waAdminExpiredTodayTemplate}
              onChange={e => setConfig({...config, waAdminExpiredTodayTemplate: e.target.value})}
            />
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">Variabel: <code className="text-[#6419c1] dark:text-[#a064fa] font-bold">{`{{paket}}`}</code></p>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full sm:w-auto px-8 py-3 mt-4 flex items-center justify-center gap-2 bg-[#6419c1] text-white rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Simpan Konfigurasi Notifikasi
        </button>
      </div>
    </div>
  );
}
