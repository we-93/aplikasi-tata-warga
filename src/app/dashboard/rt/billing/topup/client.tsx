"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PlusCircle, Mail, Zap } from "lucide-react";
import { createCheckoutInvoice } from "@/app/actions/billing";
import Link from "next/link";
import { PaymentMethodDialog } from "@/components/payment-dialog";

export function TopupClient({ initialData }: { initialData: any }) {
  const { addons } = initialData;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleTopupClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsPaymentDialogOpen(true);
  };

  const confirmTopup = async (paymentMethod: string) => {
    if (!selectedProductId) return;
    setIsLoading(selectedProductId);
    const res = await createCheckoutInvoice(selectedProductId, "TOPUP", paymentMethod);
    if (res.success) {
      router.push(`/dashboard/rt/billing/checkout/${res.invoiceId}`);
    } else {
      toast.error(res.error);
      setIsLoading(null);
      setIsPaymentDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Link href="/dashboard/rt/billing">
        <Button variant="ghost" className="mb-4">← Kembali ke Langganan</Button>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {addons.map((addon: any) => (
          <div key={addon.id} className="bg-card border border-dashed hover:border-solid hover:border-primary rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transition-all">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              {addon.maxSurat > 0 ? <Mail className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
            </div>
            <h3 className="font-bold text-lg mb-2">{addon.name}</h3>
            
            <div className="text-sm text-muted-foreground mb-6 space-y-1">
              {addon.maxSurat > 0 && <p>+{addon.maxSurat} Kuota Surat</p>}
              {addon.maxAiToken > 0 && <p>+{addon.maxAiToken} Token AI</p>}
            </div>
            
            <div className="text-2xl font-bold text-[#1b264f] dark:text-foreground mb-6">{formatRp(addon.hargaPendaftaran)}</div>
            
            <Button 
              className="w-full mt-auto bg-[#6419c1] hover:bg-[#7735d4] text-white border-transparent"
              onClick={() => handleTopupClick(addon.id)}
              disabled={isLoading === addon.id}
            >
              {isLoading === addon.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Beli Kuota
            </Button>
          </div>
        ))}
      </div>
      
      {addons.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
          Belum ada produk Topup / Ekstra yang tersedia saat ini.
        </div>
      )}

      <PaymentMethodDialog 
        isOpen={isPaymentDialogOpen} 
        onClose={() => setIsPaymentDialogOpen(false)} 
        onConfirm={confirmTopup} 
        isLoading={!!isLoading} 
      />
    </div>
  );
}
