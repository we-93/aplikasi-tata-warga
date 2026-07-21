"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { createCheckoutInvoice } from "@/app/actions/billing";
import Link from "next/link";
import { PaymentMethodDialog } from "@/components/payment-dialog";

export function UpgradeClient({ initialData }: { initialData: any }) {
  const { tenant, mainPlans } = initialData;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const PLAN_HIERARCHY: Record<string, number> = {
    "TRIAL": 1,
    "STARTER": 2,
    "PRO": 3,
    "PREMIUM": 4,
    "PLATINUM": 5
  };

  const currentPlanLevel = PLAN_HIERARCHY[tenant.subscriptionPlan] || 0;
  
  const availablePlans = mainPlans.filter((p: any) => {
    const planLevel = PLAN_HIERARCHY[p.name] || 0;
    return planLevel > currentPlanLevel;
  });

  const handleUpgradeClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsPaymentDialogOpen(true);
  };

  const confirmUpgrade = async (paymentMethod: string) => {
    if (!selectedProductId) return;
    setIsLoading(selectedProductId);
    const res = await createCheckoutInvoice(selectedProductId, "UPGRADE", paymentMethod);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePlans.length > 0 ? availablePlans.map((plan: any) => (
          <div key={plan.id} className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col hover:border-primary transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{formatRp(plan.hargaPendaftaran)}</span>
                <span className="text-sm text-muted-foreground font-medium">/ {plan.masaAktifBulan} bln</span>
              </div>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-start text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mr-3" />
                <span>Kapasitas {plan.maxWarga === 0 ? 'Unlimited' : plan.maxWarga} Warga</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mr-3" />
                <span>Kuota Surat: {plan.maxSurat === 0 ? 'Unlimited' : plan.maxSurat + ' /bln'}</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mr-3" />
                <span>Token AI: {plan.maxAiToken === 0 ? 'Unlimited' : plan.maxAiToken + ' /bln'}</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-[#6419c1] hover:bg-[#7735d4] text-white border-transparent"
              onClick={() => handleUpgradeClick(plan.id)}
              disabled={isLoading === plan.id}
            >
              {isLoading === plan.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpCircle className="w-4 h-4 mr-2" />}
              Pilih {plan.name}
            </Button>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Tidak ada paket yang tersedia untuk diupgrade. Anda sudah berada di paket tertinggi.
          </div>
        )}
      </div>
      
      {mainPlans.length === 0 && (
        <div className="text-center text-muted-foreground p-8 bg-card border rounded-2xl">
          Belum ada paket utama yang tersedia saat ini.
        </div>
      )}

      <PaymentMethodDialog 
        isOpen={isPaymentDialogOpen} 
        onClose={() => setIsPaymentDialogOpen(false)} 
        onConfirm={confirmUpgrade} 
        isLoading={!!isLoading} 
      />
    </div>
  );
}
