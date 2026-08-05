"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSuperAdminProfile, updateSystemSettings, addSuperAdmin, removeSuperAdmin } from "@/app/actions/admin-settings";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Trash2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export function AdminSettingsClient({ currentUser, siteSettings, admins }: { currentUser: any, siteSettings: any, admins: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  
  // Handlers for profile
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSuperAdminProfile(formData);
    if (res.success) {
      toast.success("Profil berhasil diperbarui!");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "avatar");
      if (currentUser?.image) uploadData.append("oldUrl", currentUser.image);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.success && data.url) {
        // Because updateUserAvatar is inside user actions, we can just fetch the generic update setting
        // Or directly use a dedicated action if we had one. Let's reuse updateSuperAdminProfile by modifying it if needed.
        // Wait, updateSuperAdminProfile doesn't accept image. Let's just create an action for it or update the DB directly via a fetch
        // Actually, we can just use the existing updateUserAvatar from @/app/actions/user
        const { updateUserAvatar } = await import("@/app/actions/user");
        const fd = new FormData();
        fd.append("imageUrl", data.url);
        await updateUserAvatar(fd);
        toast.success("Foto profil diperbarui!");
        window.location.reload();
      } else {
        toast.error("Gagal unggah foto");
      }
    } catch (err) {
      toast.error("Error upload");
    }
    setIsLoading(false);
  };

  // Handlers for System Settings
  const handleUpdateSystem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSystemSettings(formData);
    if (res.success) {
      toast.success("Pengaturan sistem berhasil disimpan!");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "system");
      if (siteSettings?.faviconUrl) uploadData.append("oldUrl", siteSettings.faviconUrl);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.success && data.url) {
        const fd = new FormData();
        fd.append("faviconUrl", data.url);
        fd.append("maintenanceMode", String(siteSettings?.maintenanceMode || false)); // preserve existing
        await updateSystemSettings(fd);
        toast.success("Favicon diperbarui!");
        window.location.reload();
      } else {
        toast.error("Gagal unggah favicon");
      }
    } catch (err) {
      toast.error("Error upload");
    }
    setIsLoading(false);
  };

  // Handlers for Admin Team
  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addSuperAdmin(formData);
    if (res.success) {
      toast.success("Admin berhasil ditambahkan!");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    setIsLoading(true);
    const res = await removeSuperAdmin(id);
    if (res.success) {
      toast.success("Admin dihapus!");
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="flex w-full md:w-max overflow-x-auto gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl justify-start">
        <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap">Profil Saya</TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap">Tampilan (Favicon)</TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap">Tim Admin</TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2 rounded-lg data-active:bg-[#6419c1] data-active:text-white dark:data-active:bg-[#6419c1] dark:data-active:text-white transition-all shadow-none data-active:shadow-sm whitespace-nowrap">Sistem & Server</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="profile">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto Profil</CardTitle>
                <CardDescription>Foto ini akan muncul di pojok kanan atas layar.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-emerald-100">
                  <AvatarImage src={currentUser?.image || ""} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-emerald-50 text-emerald-600">
                    {currentUser?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadPhoto} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Unggah Foto Baru
                </Button>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleUpdateProfile}>
                <CardHeader>
                  <CardTitle>Informasi Akun</CardTitle>
                  <CardDescription>Perbarui alamat email atau kata sandi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" defaultValue={currentUser?.email} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password Baru (Opsional)</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showProfilePassword ? "text" : "password"} placeholder="Kosongkan jika tidak ingin mengubah" className="pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowProfilePassword(!showProfilePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>Simpan Perubahan</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Favicon Website</CardTitle>
              <CardDescription>Icon kecil yang muncul di tab browser saat website dibuka.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded overflow-hidden border shadow-sm bg-muted flex items-center justify-center">
                {siteSettings?.faviconUrl ? (
                  <img src={siteSettings.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No Icon</span>
                )}
              </div>
              <input type="file" ref={faviconInputRef} className="hidden" accept=".ico,.png,.svg" onChange={handleUploadFavicon} />
              <Button variant="outline" onClick={() => faviconInputRef.current?.click()} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Unggah Favicon (.png / .ico)
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Rekomendasi ukuran: 32x32px atau 64x64px.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Daftar Super Admin</CardTitle>
                <CardDescription>Orang yang memiliki akses penuh ke Dashboard Pusat ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={admin.image || ""} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary">{admin.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{admin.name} {admin.id === currentUser.id && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-2">Anda</span>}</p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                      {admin.id !== currentUser.id && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAdmin(admin.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleAddAdmin}>
                <CardHeader>
                  <CardTitle>Tambah Admin</CardTitle>
                  <CardDescription>Berikan akses ke rekan tim Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Nama Lengkap</Label>
                    <Input id="adminName" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input id="adminEmail" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <div className="relative">
                      <Input id="adminPassword" name="password" type={showNewAdminPassword ? "text" : "password"} required className="pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>Tambah Admin</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <form onSubmit={handleUpdateSystem}>
            <Card className="max-w-2xl border-orange-200">
              <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 mb-4 rounded-t-lg">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <ShieldAlert className="w-5 h-5" />
                  <CardTitle>Sistem Inti & Keamanan</CardTitle>
                </div>
                <CardDescription>Hati-hati saat mengubah pengaturan ini karena berdampak ke seluruh aplikasi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg bg-red-50/30 dark:bg-red-950/10 border-red-100 dark:border-red-900/30">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-red-600 dark:text-red-400">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Kunci aplikasi untuk seluruh pengguna RT. Hanya Super Admin yang bisa masuk.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{siteSettings?.maintenanceMode ? "AKTIF" : "NONAKTIF"}</span>
                    <Switch name="maintenanceMode" value="true" defaultChecked={siteSettings?.maintenanceMode} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxUploadSizeMb">Batas Ukuran Upload (MB)</Label>
                    <Input id="maxUploadSizeMb" name="maxUploadSizeMb" type="number" min="1" max="50" defaultValue={siteSettings?.maxUploadSizeMb || 5} required />
                    <p className="text-xs text-muted-foreground">Maksimal ukuran lampiran per file (Standar: 5 MB).</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionExpiryDays">Kedaluwarsa Sesi (Hari)</Label>
                    <Input id="sessionExpiryDays" name="sessionExpiryDays" type="number" min="1" max="30" defaultValue={siteSettings?.sessionExpiryDays || 7} required />
                    <p className="text-xs text-muted-foreground">Pengguna akan otomatis ter-logout setelah hari ini berlalu.</p>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-muted/30 border-t mt-6">
                <Button type="submit" disabled={isLoading} className="mt-4">Simpan Konfigurasi Server</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </div>
    </Tabs>
  );
}
