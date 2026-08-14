"use client";
// Imports and logic...
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pingKirimChat, saveAiSettings } from "@/app/actions/integrations";
import { toast } from "sonner";
import { Loader2, RefreshCw, MessageSquare, Bot, Eye, EyeOff, ShieldCheck } from "lucide-react";

export function IntegrationsClient({ 
  aiSettings 
}: { 
  aiSettings: { openaiApiKey: string; geminiApiKey: string; aiMasterPrompt: string; chatApiUrl: string; chatApiKey: string; chatApiModel: string; docApiUrl?: string; docApiKey?: string; docApiModel?: string; totalChatTokensUsed?: number; totalOcrTokensUsed?: number } 
}) {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // AI State
  const [aiConfig, setAiConfig] = useState<any>(aiSettings);
  const [isSavingAi, setIsSavingAi] = useState(false);
  
  // Visibility State
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const toggleKey = (k: string) => setShowKeys(p => ({...p, [k]: !p[k]}));

  const handlePing = async () => {
    setIsPinging(true);
    const res = await pingKirimChat();
    if (res.success) {
      if (res.status === "ONLINE") toast.success(res.message);
      else toast.warning(res.message);
      setPingStatus(res.status);
    } else {
      toast.error(res.error);
    }
    setIsPinging(false);
  };

  const handleSaveAi = async () => {
    setIsSavingAi(true);
    const res = await saveAiSettings(aiConfig);
    if (res.success) {
      toast.success("Pengaturan AI berhasil disimpan!");
    } else {
      toast.error(res.error);
    }
    setIsSavingAi(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Pusat Integrasi</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Konfigurasi Gateway WhatsApp dan Asisten AI Global.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full md:w-max overflow-x-auto gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl justify-start">
          <TabsTrigger 
            value="whatsapp" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 shrink-0" /> WA Gateway
          </TabsTrigger>
          <TabsTrigger 
            value="chat_ai" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Bot className="w-4 h-4 shrink-0" /> API Chat
          </TabsTrigger>
          <TabsTrigger 
            value="notulen_ai" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Bot className="w-4 h-4 shrink-0" /> API Notulen
          </TabsTrigger>
          <TabsTrigger 
            value="doc_ai" 
            className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap"
          >
            <Bot className="w-4 h-4 shrink-0" /> API Doc
          </TabsTrigger>
        </TabsList>

        {/* WHATSAPP TAB */}
        <TabsContent value="whatsapp" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] max-w-3xl">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Kirim.chat (Official Cloud API)
                  {pingStatus === "ONLINE" && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative ml-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Gateway WhatsApp Sentral untuk seluruh RT/RW di sistem Tata Warga.</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-20" />
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/30 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-200">
                <p><strong>Info:</strong> API Key Kirim.chat tidak lagi disimpan di database, melainkan disuntikkan secara aman langsung via <i>Environment Variables</i> (<code className="bg-indigo-100 dark:bg-indigo-800 px-1 py-0.5 rounded">KIRIMCHAT_API_KEY</code>).</p>
                <p className="mt-2">Semua pesan dari seluruh RT akan dikelola secara terpusat tanpa memerlukan manajemen multi-device (Fonnte) lagi.</p>
              </div>

              <Button 
                onClick={handlePing} 
                disabled={isPinging} 
                className={`w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 rounded-xl transition-all text-sm font-semibold border ${pingStatus === "ONLINE" ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10' : 'bg-[#6419c1] text-white shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4]'}`}
              >
                {isPinging ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Cek Status Ping
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* CHAT AI TAB */}
        <TabsContent value="chat_ai" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] max-w-3xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Chat (WeizeRouter)</h2>
              <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Konfigurasi API untuk fitur Chat AI, Broadcast Pengumuman, dan Laporan Kas.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Base URL</Label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="https://weizerouter.web.id/v1" 
                  value={aiConfig.chatApiUrl} 
                  onChange={e => setAiConfig({...aiConfig, chatApiUrl: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">API Key</Label>
                <div className="relative">
                  <input 
                    type={showKeys['chat'] ? "text" : "password"} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white pr-10"
                    placeholder="Bearer API Key dari WeizeRouter" 
                    value={aiConfig.chatApiKey || ""} 
                    onChange={e => setAiConfig({...aiConfig, chatApiKey: e.target.value})}
                  />
                  <button type="button" onClick={() => toggleKey('chat')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showKeys['chat'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Model Name</Label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="wz/gemini-3.5-flash-low" 
                  value={aiConfig.chatApiModel || ""} 
                  onChange={e => setAiConfig({...aiConfig, chatApiModel: e.target.value})}
                />
              </div>

              {aiSettings.totalChatTokensUsed !== undefined && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Total Penggunaan Token Chat</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">Jumlah token WeizeRouter yang digunakan (Chat, Broadcast, Laporan, Draft Notulen).</p>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {aiSettings.totalChatTokensUsed.toLocaleString("id-ID")}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSaveAi} 
                disabled={isSavingAi} 
                className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 bg-[#6419c1] text-white rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingAi && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Konfigurasi Chat
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* NOTULEN AI TAB */}
        <TabsContent value="notulen_ai" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] max-w-3xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Notulen (OpenAI / Gemini)</h2>
              <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Konfigurasi AI khusus untuk Notulen Rapat dan Penalaran Panjang.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">OpenAI API Key</Label>
                <div className="relative">
                  <input 
                    type={showKeys['openai'] ? "text" : "password"} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white pr-10"
                    placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx" 
                    value={aiConfig.openaiApiKey || ""} 
                    onChange={e => setAiConfig({...aiConfig, openaiApiKey: e.target.value})}
                  />
                  <button type="button" onClick={() => toggleKey('openai')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showKeys['openai'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/40">Digunakan untuk Notulen Rapat AI.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Google Gemini API Key</Label>
                <div className="relative">
                  <input 
                    type={showKeys['gemini'] ? "text" : "password"} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white pr-10"
                    placeholder="AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxx" 
                    value={aiConfig.geminiApiKey || ""} 
                    onChange={e => setAiConfig({...aiConfig, geminiApiKey: e.target.value})}
                  />
                  <button type="button" onClick={() => toggleKey('gemini')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showKeys['gemini'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/40">Alternatif OpenAI. Digunakan jika Anda ingin menggunakan model Gemini.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Master System Prompt (Perilaku Dasar AI)</Label>
                <textarea 
                  className="w-full h-64 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white font-mono"
                  placeholder="Kamu adalah asisten pengurus RT yang cerdas..."
                  value={aiConfig.aiMasterPrompt}
                  onChange={e => setAiConfig({...aiConfig, aiMasterPrompt: e.target.value})}
                />
                <div className="text-xs text-slate-600 dark:text-white/60 space-y-1.5 mt-2 bg-indigo-50 dark:bg-[#6419c1]/10 border border-indigo-100 dark:border-[#6419c1]/20 p-4 rounded-xl">
                  <p className="font-bold text-indigo-900 dark:text-[#a064fa]">Variabel Dinamis yang disuntikkan sistem saat runtime:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Data Kas & Transaksi terakhir</li>
                    <li>Ringkasan Demografi Warga</li>
                    <li>Daftar Surat yang baru dibuat</li>
                  </ul>
                </div>
              </div>

              {aiSettings.totalOcrTokensUsed !== undefined && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Total Penggunaan Token OCR</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">Jumlah token OpenAI / Gemini yang digunakan khusus untuk fitur Baca Gambar.</p>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {aiSettings.totalOcrTokensUsed.toLocaleString("id-ID")}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSaveAi} 
                disabled={isSavingAi} 
                className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 bg-[#6419c1] text-white rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingAi && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Konfigurasi AI
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* API DOC TAB */}
        <TabsContent value="doc_ai" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#141229] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] max-w-3xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">API Chat Dokumentasi (Docusaurus)</h2>
              <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Konfigurasi API AI terpisah khusus untuk Chatbot di halaman tutorial/dokumentasi. Penggunaan token di sini tidak akan dihitung ke kuota Tenant mana pun.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Base URL API Doc</Label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="https://weizerouter.web.id/v1" 
                  value={aiConfig.docApiUrl || ""} 
                  onChange={e => setAiConfig({...aiConfig, docApiUrl: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">API Key Doc</Label>
                <div className="relative">
                  <input 
                    type={showKeys['doc'] ? "text" : "password"} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white pr-10"
                    placeholder="Bearer API Key khusus Dokumentasi" 
                    value={aiConfig.docApiKey || ""} 
                    onChange={e => setAiConfig({...aiConfig, docApiKey: e.target.value})}
                  />
                  <button type="button" onClick={() => toggleKey('doc')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showKeys['doc'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Model Name Doc</Label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="wz/gemini-3.5-flash-low" 
                  value={aiConfig.docApiModel || ""} 
                  onChange={e => setAiConfig({...aiConfig, docApiModel: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleSaveAi} 
                disabled={isSavingAi} 
                className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 bg-[#6419c1] text-white rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingAi && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Konfigurasi Doc API
              </Button>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
