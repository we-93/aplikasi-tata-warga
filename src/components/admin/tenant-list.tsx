"use client";

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTenant } from "@/app/actions/tenant";
import { toast } from "sonner";
import { Loader2, Plus, Edit } from "lucide-react";

type TenantData = {
  id: string;
  name: string;
  users: { name: string; email: string }[];
  subscriptions: { status: string; product: { name: string }; expiresAt: Date | null }[];
  createdAt: Date;
};

export function TenantList({ tenants, products }: { tenants: TenantData[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createTenant(formData);
    
    if (res.success) {
      toast.success("Pelanggan (RT) berhasil didaftarkan!");
      setIsOpen(false);
    } else {
      toast.error(res.error || "Gagal mendaftarkan RT");
    }
    setIsPending(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className={buttonVariants({ className: "bg-[#21b7b1] hover:bg-[#21b7b1]/90 text-white" })}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah RT (Pelanggan)
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Daftarkan RT Baru</DialogTitle>
              <DialogDescription>
                Masukkan data pengurus RT dan pilih paket langganan.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama RT (Cth: RT 04 / RW 08)</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Nama Ketua/Admin RT</Label>
                <Input id="adminName" name="adminName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Login Admin</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productId">Paket Langganan</Label>
                <Select name="productId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih paket..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - {p.price == 0 ? "Gratis" : `Rp${Number(p.price).toLocaleString()}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota/Kabupaten</Label>
                  <Input id="city" name="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input id="province" name="province" />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isPending} className="bg-[#1b264f] hover:bg-[#1b264f]/90 text-white">
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Daftarkan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama RT</TableHead>
              <TableHead>Admin (Ketua)</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Belum ada pelanggan terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((t) => {
                const sub = t.subscriptions[0];
                const active = sub?.status === "ACTIVE";
                const adminUser = t.users.find(u => true); // just take first
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      {adminUser?.name}<br/>
                      <span className="text-xs text-muted-foreground">{adminUser?.email}</span>
                    </TableCell>
                    <TableCell>
                      {sub ? sub.product.name : "-"}
                    </TableCell>
                    <TableCell>
                      {active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">Non Aktif</Badge>
                      )}
                      {sub?.expiresAt && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          S/d {new Date(sub.expiresAt).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
