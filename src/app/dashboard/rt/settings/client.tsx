"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "@/components/rt/settings-form";
import { AccountForm } from "@/components/rt/account-form";
import { AvatarUpload } from "@/components/rt/avatar-upload";
import { Building, UserCircle } from "lucide-react";

export function SettingsClient({ tenant, user }: { tenant: any, user: any }) {
  // Combine user data and tenant's noHpRt for the AccountForm
  const accountData = {
    ...user,
    phone: user.phone || tenant.noHpRt || ""
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Lengkapi data wilayah kepengurusan dan kelola privasi akun Anda.</p>
      </div>

      <Tabs defaultValue="rt" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="rt" className="flex items-center gap-2 data-active:bg-[#6519c2] data-active:!text-white dark:data-active:bg-[#6519c2] dark:data-active:!text-white">
            <Building className="w-4 h-4" />
            <span>Profil RT</span>
          </TabsTrigger>
          <TabsTrigger value="akun" className="flex items-center gap-2 data-active:bg-[#6519c2] data-active:!text-white dark:data-active:bg-[#6519c2] dark:data-active:!text-white">
            <UserCircle className="w-4 h-4" />
            <span>Akun Saya</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rt" className="space-y-6">
          <SettingsForm key={tenant.updatedAt?.toString() || tenant.id} initialData={tenant} />
        </TabsContent>
        
        <TabsContent value="akun" className="space-y-6">
          <AvatarUpload currentImage={user?.image} />
          <AccountForm initialData={accountData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
