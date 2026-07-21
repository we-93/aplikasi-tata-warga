"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, FileText, Bot, Users, QrCode, Building2, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { registerAndCheckout } from "@/app/actions/billing";
import { signIn } from "next-auth/react";

export function CheckoutPublicClient({ product }: { product: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerAndCheckout({
        ...formData,
        productId: product.id,
        paymentMethod
      });

      if (res.success) {
        toast.success("Checkout berhasil!");
        
        // Auto Login quietly
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        router.push(`/checkout/success/${res.invoiceId}`);
      } else {
        toast.error(res.error || "Terjadi kesalahan saat pendaftaran");
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses checkout");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">CHECKOUT</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">NAMA PRODUK</p>
              <h2 className="text-3xl font-bold text-foreground">{product.name}</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatRp(Number(product.hargaPendaftaran))}</div>
              <p className="text-sm text-muted-foreground">per bulan</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-xl text-muted-foreground">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Kuota Surat {product.maxSurat === -1 ? 'Unlimited' : product.maxSurat}</h4>
                <p className="text-sm text-muted-foreground">Pembuatan surat otomatis per bulan</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-xl text-muted-foreground">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Kuota AI {product.maxAiToken === -1 ? 'Unlimited' : (product.maxAiToken >= 1000 ? (product.maxAiToken/1000) + 'k' : product.maxAiToken)}</h4>
                <p className="text-sm text-muted-foreground">Token untuk menggunakan fitur AI</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-xl text-muted-foreground">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Kuota Warga</h4>
                <p className="text-sm text-muted-foreground">{product.maxWarga === 0 ? "Unlimited" : product.maxWarga}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatRp(Number(product.hargaPendaftaran))}</span>
            </div>
            <div className="flex justify-between text-muted-foreground pb-4 border-b border-border">
              <span>Pajak (0%)</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">TOTAL PEMBAYARAN</span>
              <span className="text-2xl font-bold text-foreground">{formatRp(Number(product.hargaPendaftaran))}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-emerald-500 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Pembayaran dienkripsi dan aman.</span>
          </div>
        </div>

        {/* Right Side: Billing Form */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-6">Informasi Penagihan</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase text-muted-foreground font-semibold">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  className="bg-background"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase text-muted-foreground font-semibold">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  className="bg-background"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase text-muted-foreground font-semibold">Nomor Telepon</Label>
              <Input 
                id="phone" 
                placeholder="+62 812 3456 7890" 
                className="bg-background"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase text-muted-foreground font-semibold">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="bg-background pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Label className="text-xs uppercase text-muted-foreground font-semibold mb-4 block">Pilih Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "qris" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <QrCode className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">QRIS</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === "transfer" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Building2 className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">Transfer Bank</span>
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              {isLoading ? "Memproses..." : "Bayar Sekarang"} 
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Dengan membayar, Anda menyetujui <a href="#" className="underline hover:text-primary">Syarat dan Ketentuan</a> Tata Warga.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
