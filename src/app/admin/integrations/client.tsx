"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveAiSettings } from "@/app/actions/integrations";
import { toast } from "sonner";
import { Loader2, Bot, Eye, EyeOff, Key } from "lucide-react";

export function IntegrationsClient({ 
  aiSettings,
  initialTokenLogs
}: { 
  aiSettings: { openaiApiKey: string; openaiApiModel: string; qdrantUrl?: string; qdrantApiKey?: string; geminiApiKey: string; aiMasterPrompt: string; chatApiUrl: string; chatApiKey: string; chatApiModel: string; docApiUrl?: string; docApiKey?: string; docApiModel?: string; totalChatTokensUsed?: number; totalOcrTokensUsed?: number };
  initialTokenLogs: any[];
}) {
  // AI State
  const [aiConfig, setAiConfig] = useState<any>(aiSettings);
  const [isSavingAi, setIsSavingAi] = useState(false);
  
  // Visibility State
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const toggleKey = (k: string) => setShowKeys(p => ({...p, [k]: !p[k]}));

  const handleSaveAi = async () => {
    setIsSavingAi(true);
    const res = await saveAiSettings(aiConfig);
    if (res.success) {
      toast.success("Pengaturan OpenAI berhasil disimpan!");
    } else {
      toast.error(res.error);
    }
    setIsSavingAi(false);
  };

  const modelOptions = [
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano (Sangat Hemat)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Cepat & Hemat)" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini (Pintar)" },
    { value: "gpt-4.1", label: "GPT-4.1 (Kualitas Tinggi)" },
    { value: "gpt-4o", label: "GPT-4o (Multimodal Terbaik)" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Integrasi AI</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Konfigurasi API Key OpenAI dan pantau penggunaan token untuk fitur AI Tata Warga.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Kolom Konfigurasi */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141229] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)]">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#6419c1]" />
                Pengaturan OpenAI
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">API Key OpenAI</Label>
                <div className="relative">
                  <input 
                    type={showKeys['openai'] ? "text" : "password"} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white pr-10"
                    placeholder="sk-..." 
                    value={aiConfig.openaiApiKey || ""} 
                    onChange={e => setAiConfig({...aiConfig, openaiApiKey: e.target.value})}
                  />
                  <button type="button" onClick={() => toggleKey('openai')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showKeys['openai'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/40">Dapatkan API Key Anda dari <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">dashboard OpenAI</a>.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Model Utama</Label>
                <select
                  value={aiConfig.openaiApiModel || "gpt-4.1-nano"}
                  onChange={e => setAiConfig({...aiConfig, openaiApiModel: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white appearance-none"
                >
                  {modelOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="dark:bg-[#141229]">{opt.label} ({opt.value})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-white/40">Model ini akan digunakan untuk semua pemrosesan AI di aplikasi.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Pengaturan Vector DB (Qdrant)</h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-slate-900 dark:text-white font-semibold">Qdrant Cluster URL</Label>
                    <input 
                      type="url" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="https://xxx.qdrant.io" 
                      value={aiConfig.qdrantUrl || ""} 
                      onChange={e => setAiConfig({...aiConfig, qdrantUrl: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-900 dark:text-white font-semibold">Qdrant API Key</Label>
                    <div className="relative">
                      <input 
                        type={showKeys['qdrant'] ? "text" : "password"} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white pr-10"
                        placeholder="API Key dari Qdrant Cloud" 
                        value={aiConfig.qdrantApiKey || ""} 
                        onChange={e => setAiConfig({...aiConfig, qdrantApiKey: e.target.value})}
                      />
                      <button type="button" onClick={() => toggleKey('qdrant')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {showKeys['qdrant'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveAi} 
                disabled={isSavingAi} 
                className="w-full px-8 py-3 flex items-center justify-center gap-2 bg-[#6419c1] text-white rounded-xl shadow-md hover:bg-[#7735d4] transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Simpan Pengaturan
              </Button>
            </div>
          </div>
          
          {/* Card Statistik Token Keseluruhan */}
          <div className="bg-gradient-to-br from-[#6419c1] to-[#a05ce8] p-6 rounded-2xl shadow-md text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Total Penggunaan Token AI</h2>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <p className="text-sm text-white/90">Chat AI & Notulen</p>
                <p className="text-xl font-bold">{aiSettings.totalChatTokensUsed?.toLocaleString('id-ID') || 0}</p>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <p className="text-sm text-white/90">OCR Dokumen</p>
                <p className="text-xl font-bold">{aiSettings.totalOcrTokensUsed?.toLocaleString('id-ID') || 0}</p>
              </div>
              <div className="pt-2 border-t border-white/20 flex justify-between items-center mt-2">
                <p className="text-sm text-white font-medium">Total Seluruh User</p>
                <p className="text-2xl font-extrabold">{((aiSettings.totalChatTokensUsed || 0) + (aiSettings.totalOcrTokensUsed || 0)).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Log Token */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#141229] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)]">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Penggunaan Token</h2>
              <div className="text-sm font-medium bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full text-slate-600 dark:text-white/60">
                100 Aktivitas Terakhir
              </div>
            </div>

            <div className="overflow-x-auto">
              {initialTokenLogs && initialTokenLogs.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 dark:text-white/50 bg-slate-50 dark:bg-white/5 uppercase rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                      <th className="px-4 py-3">Tenant / RT</th>
                      <th className="px-4 py-3">Fitur (Aksi)</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">Token Terpakai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialTokenLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-slate-500 dark:text-white/50">
                          {new Date(log.date).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric', 
                            hour: '2-digit', minute:'2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-white/90">{log.tenantName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-[#6419c1]/10 text-[#6419c1] dark:text-[#a05ce8] rounded text-xs font-semibold">
                            {log.action.replace("AI_", "").replace("_USAGE", "")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-white/90">
                          {log.tokens.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 border-dashed">
                  <Bot className="w-10 h-10 text-slate-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-white/50 font-medium">Belum ada riwayat penggunaan token AI.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
