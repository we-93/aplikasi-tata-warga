"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addWaDevice, updateWaDevice, deleteWaDevice, pingWaDevice, saveAiSettings } from "@/app/actions/integrations";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, RefreshCw, MessageSquare, Bot, Wifi, WifiOff, Edit, Eye } from "lucide-react";

export function IntegrationsClient({ 
  devices, 
  aiSettings 
}: { 
  devices: any[]; 
  aiSettings: { openaiApiKey: string; geminiApiKey: string; aiMasterPrompt: string; chatApiUrl: string; chatApiKey: string; chatApiModel: string; docApiUrl?: string; docApiKey?: string; docApiModel?: string; totalChatTokensUsed?: number; totalOcrTokensUsed?: number } 
}) {
  const [activeTab, setActiveTab] = useState("whatsapp");

  // WA State
  const [isAddingWa, setIsAddingWa] = useState(false);
  const [isPinging, setIsPinging] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState<{
    name: string, provider: string, apiKey: string, slotLimit: number, phoneNumber: string, 
    groups: { id?: string, name: string, groupId: string, groupInviteLink: string }[]
  }>({ name: "", provider: "FONNTE", apiKey: "", slotLimit: 50, phoneNumber: "", groups: [] });
  
  const [viewingDevice, setViewingDevice] = useState<any>(null);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [editForm, setEditForm] = useState<{
    name: string, provider: string, apiKey: string, slotLimit: number, phoneNumber: string, 
    groups: { id?: string, name: string, groupId: string, groupInviteLink: string }[]
  }>({ name: "", provider: "FONNTE", apiKey: "", slotLimit: 50, phoneNumber: "", groups: [] });
  const [isEditingWa, setIsEditingWa] = useState(false);

  // AI State
  const [aiConfig, setAiConfig] = useState<any>(aiSettings);
  const [isSavingAi, setIsSavingAi] = useState(false);

  // WA Handlers
  const handleAddDevice = async () => {
    if (!newDevice.name || !newDevice.apiKey) {
      toast.error("Nama dan API Key wajib diisi.");
      return;
    }
    setIsAddingWa(true);
    const res = await addWaDevice(newDevice);
    if (res.success) {
      toast.success("Perangkat berhasil ditambahkan!");
      setNewDevice({ name: "", provider: "FONNTE", apiKey: "", slotLimit: 50, phoneNumber: "", groups: [] });
      // Close dialog (handled by radix primitive if we bind state, but for simplicity we reload or rely on revalidatePath)
    } else {
      toast.error(res.error);
    }
    setIsAddingWa(false);
  };

  const handleUpdateDevice = async () => {
    if (!editForm.name || !editForm.apiKey) {
      toast.error("Nama dan API Key wajib diisi.");
      return;
    }
    setIsEditingWa(true);
    const res = await updateWaDevice(editingDevice.id, editForm);
    if (res.success) {
      toast.success("Perangkat berhasil diperbarui!");
      setEditingDevice(null);
    } else {
      toast.error(res.error);
    }
    setIsEditingWa(false);
  };

  const handleDeleteDevice = async (id: string) => {
    if (confirm("Yakin ingin menghapus perangkat ini?")) {
      const res = await deleteWaDevice(id);
      if (res.success) toast.success("Berhasil dihapus.");
      else toast.error(res.error);
    }
  };

  const handlePing = async (id: string) => {
    setIsPinging(id);
    const res = await pingWaDevice(id);
    if (res.success) {
      if (res.status === "ONLINE") toast.success(res.message);
      else toast.warning(res.message);
    } else {
      toast.error(res.error);
    }
    setIsPinging(null);
  };

  // AI Handlers
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
          <div className="flex justify-between items-center bg-white dark:bg-[#141229] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)]">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Device Manager</h2>
              <p className="text-sm text-slate-500 dark:text-white/50">Kelola armada Bot WhatsApp untuk melayani seluruh RT.</p>
            </div>
            <Dialog>
              <DialogTrigger className="flex items-center gap-2 bg-[#6419c1] text-white px-5 py-2.5 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah Perangkat</span>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Perangkat WA</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nama Perangkat</Label>
                    <Input placeholder="Misal: Bot Utama 1" value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={newDevice.provider} onValueChange={v => setNewDevice({...newDevice, provider: v || ""})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FONNTE">Fonnte</SelectItem>
                        <SelectItem value="APICOID">Api.co.id</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input placeholder="Token dari provider" value={newDevice.apiKey} onChange={e => setNewDevice({...newDevice, apiKey: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor WhatsApp (Opsional)</Label>
                    <Input placeholder="Misal: 081234567890" value={newDevice.phoneNumber} onChange={e => setNewDevice({...newDevice, phoneNumber: e.target.value})} />
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <Label>Daftar Grup RT (Alokasi Kuota)</Label>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs" 
                        onClick={() => setNewDevice({ ...newDevice, groups: [...newDevice.groups, { id: "", name: "", groupId: "", groupInviteLink: "" }] })}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Tambah Grup
                      </Button>
                    </div>
                    {newDevice.groups.length === 0 && (
                      <div className="text-xs text-muted-foreground italic bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-dashed">
                        Belum ada grup. Tambahkan grup untuk menentukan kuota RT pada bot ini.
                      </div>
                    )}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {newDevice.groups.map((g, i) => (
                        <div key={i} className="flex gap-2 items-start bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/10 relative group">
                          <div className="flex-1 space-y-2">
                            <Input placeholder="Judul (Grup A)" value={g.name} onChange={e => { const arr = [...newDevice.groups]; arr[i].name = e.target.value; setNewDevice({...newDevice, groups: arr}) }} className="h-8 text-xs" />
                            <Input placeholder="ID Grup (123@g.us)" value={g.groupId} onChange={e => { const arr = [...newDevice.groups]; arr[i].groupId = e.target.value; setNewDevice({...newDevice, groups: arr}) }} className="h-8 text-xs" />
                            <Input placeholder="Link Undangan" value={g.groupInviteLink} onChange={e => { const arr = [...newDevice.groups]; arr[i].groupInviteLink = e.target.value; setNewDevice({...newDevice, groups: arr}) }} className="h-8 text-xs" />
                          </div>
                          <button 
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors"
                            onClick={() => { const arr = [...newDevice.groups]; arr.splice(i, 1); setNewDevice({...newDevice, groups: arr}) }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddDevice} disabled={isAddingWa} className="w-full">
                    {isAddingWa ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Simpan Perangkat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(device => (
              <div key={device.id} className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] p-6 relative hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      {device.name}
                      {device.status === "ONLINE" ? (
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        </span>
                      ) : (
                        <span className="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      )}
                    </h3>
                    <p className="text-xs font-medium text-[#6419c1] dark:text-[#a064fa] mt-1">{device.provider} • {device.phoneNumber || "No Number"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingDevice(device)} 
                      className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors border border-transparent dark:border-white/5"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingDevice(device);
                        setEditForm({
                          name: device.name,
                          provider: device.provider,
                          apiKey: device.apiKey,
                          slotLimit: device.slotLimit,
                          phoneNumber: device.phoneNumber || "",
                          groups: device.groups || []
                        });
                      }} 
                      className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors border border-transparent dark:border-white/5"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteDevice(device.id)} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-transparent dark:border-white/5">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between mb-2 text-sm text-slate-600 dark:text-white/70">
                      <span className="font-semibold">Beban RT Terhubung:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {device.groups?.filter((g: any) => g.tenantId).length || 0} / {device.groups?.length || 0}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-[#6419c1] dark:bg-[#a064fa] h-2 rounded-full" 
                        style={{ width: `${(device.groups?.length || 0) > 0 ? ((device.groups?.filter((g: any) => g.tenantId).length || 0) / device.groups.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <button 
                    className={`w-full flex justify-center items-center gap-2 font-medium py-2.5 rounded-xl transition-colors border ${device.status === "ONLINE" ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10' : 'bg-[#6419c1] border-transparent text-white shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4]'}`}
                    onClick={() => handlePing(device.id)}
                    disabled={isPinging === device.id}
                  >
                    {isPinging === device.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Cek Status Ping
                  </button>
                </div>
              </div>
            ))}
            
            {devices.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed rounded-lg text-muted-foreground">
                <WifiOff className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Belum ada perangkat WhatsApp yang terdaftar.</p>
              </div>
            )}
          </div>

          {/* VIEW DIALOG */}
          <Dialog open={!!viewingDevice} onOpenChange={(o) => !o && setViewingDevice(null)}>
            <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detail Perangkat WA</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Nama Perangkat:</span><br/><span className="font-semibold">{viewingDevice?.name}</span></div>
                  <div><span className="text-slate-500">Provider:</span><br/><span className="font-semibold">{viewingDevice?.provider}</span></div>
                  <div><span className="text-slate-500">API Key:</span><br/><span className="font-semibold text-slate-900/50 dark:text-white/50">{viewingDevice?.apiKey.substring(0, 4)}••••••••</span></div>
                  <div><span className="text-slate-500">No. WhatsApp:</span><br/><span className="font-semibold">{viewingDevice?.phoneNumber || "-"}</span></div>
                </div>
                
                <div className="space-y-2 pt-2 border-t dark:border-white/10">
                  <Label>Daftar Grup RT (Kuota: {viewingDevice?.groups?.length || 0})</Label>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 mt-2">
                    {viewingDevice?.groups?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Belum ada grup.</p>
                    ) : (
                      viewingDevice?.groups?.map((g: any, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border text-sm overflow-hidden ${g.tenantId ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
                          <div className="font-semibold flex justify-between items-start">
                            <span>{g.name}</span>
                            {g.tenantId ? (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">Terpakai</span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Tersedia</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 truncate">ID: {g.groupId}</div>
                          {g.groupInviteLink && <div className="text-xs text-blue-500 mt-0.5 break-all hover:underline cursor-pointer">{g.groupInviteLink}</div>}
                          {g.tenantId && (
                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                              Oleh: {g.tenant?.name || g.tenantId}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingDevice} onOpenChange={(o) => !o && setEditingDevice(null)}>
            <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Perangkat WA</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Perangkat</Label>
                  <Input placeholder="Misal: Bot Utama 1" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={editForm.provider} onValueChange={v => setEditForm({...editForm, provider: v || ""})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FONNTE">Fonnte</SelectItem>
                      <SelectItem value="APICOID">Api.co.id</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input placeholder="Token dari provider" value={editForm.apiKey} onChange={e => setEditForm({...editForm, apiKey: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Nomor WhatsApp (Opsional)</Label>
                  <Input placeholder="Misal: 081234567890" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <Label>Daftar Grup RT (Alokasi Kuota)</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs" 
                      onClick={() => setEditForm({ ...editForm, groups: [...editForm.groups, { id: "", name: "", groupId: "", groupInviteLink: "" }] })}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Tambah Grup
                    </Button>
                  </div>
                  {editForm.groups.length === 0 && (
                    <div className="text-xs text-muted-foreground italic bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-dashed">
                      Belum ada grup. Tambahkan grup untuk menentukan kuota RT pada bot ini.
                    </div>
                  )}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {editForm.groups.map((g: any, i) => (
                      <div key={i} className={`flex gap-2 items-start p-3 rounded-xl border relative group ${g.tenantId ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
                        <div className="flex-1 space-y-2">
                          <Input placeholder="Judul (Grup A)" value={g.name} onChange={e => { const arr = [...editForm.groups]; arr[i].name = e.target.value; setEditForm({...editForm, groups: arr}) }} className="h-8 text-xs" disabled={!!g.tenantId} />
                          <Input placeholder="ID Grup (123@g.us)" value={g.groupId} onChange={e => { const arr = [...editForm.groups]; arr[i].groupId = e.target.value; setEditForm({...editForm, groups: arr}) }} className="h-8 text-xs" disabled={!!g.tenantId} />
                          <Input placeholder="Link Undangan" value={g.groupInviteLink || ""} onChange={e => { const arr = [...editForm.groups]; arr[i].groupInviteLink = e.target.value; setEditForm({...editForm, groups: arr}) }} className="h-8 text-xs" disabled={!!g.tenantId} />
                          
                          {g.tenantId && (
                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                              Terpakai oleh: {g.tenant?.name || g.tenantId}
                            </div>
                          )}
                        </div>
                        {!g.tenantId && (
                          <button 
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md transition-colors"
                            onClick={() => { const arr = [...editForm.groups]; arr.splice(i, 1); setEditForm({...editForm, groups: arr}) }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleUpdateDevice} disabled={isEditingWa} className="w-full">
                  {isEditingWa ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Bearer API Key dari WeizeRouter" 
                  value={aiConfig.chatApiKey || ""} 
                  onChange={e => setAiConfig({...aiConfig, chatApiKey: e.target.value})}
                />
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
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white"
                  placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx" 
                  value={aiConfig.openaiApiKey || ""} 
                  onChange={e => setAiConfig({...aiConfig, openaiApiKey: e.target.value})}
                />
                <p className="text-xs text-slate-500 dark:text-white/40">Digunakan untuk Notulen Rapat AI.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-900 dark:text-white font-semibold">Google Gemini API Key</Label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white"
                  placeholder="AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxx" 
                  value={aiConfig.geminiApiKey || ""} 
                  onChange={e => setAiConfig({...aiConfig, geminiApiKey: e.target.value})}
                />
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
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#6419c1]/50 focus:border-[#6419c1] outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Bearer API Key khusus Dokumentasi" 
                  value={aiConfig.docApiKey || ""} 
                  onChange={e => setAiConfig({...aiConfig, docApiKey: e.target.value})}
                />
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
