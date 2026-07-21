import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PaymentMethodDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
  isLoading: boolean;
}) {
  const [method, setMethod] = useState("qris");

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if(!v && !isLoading) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div 
            className={`p-4 border rounded-xl cursor-pointer transition-colors ${method === 'qris' ? 'border-primary bg-primary/5' : 'border-border hover:bg-slate-50 dark:hover:bg-slate-900'}`}
            onClick={() => { if(!isLoading) setMethod('qris') }}
          >
            <div className="font-bold">QRIS</div>
            <div className="text-sm text-muted-foreground">Pembayaran cepat via E-Wallet / M-Banking</div>
          </div>
          <div 
            className={`p-4 border rounded-xl cursor-pointer transition-colors ${method === 'transfer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-slate-50 dark:hover:bg-slate-900'}`}
            onClick={() => { if(!isLoading) setMethod('transfer') }}
          >
            <div className="font-bold">Transfer Bank Manual</div>
            <div className="text-sm text-muted-foreground">Transfer via ATM atau Internet Banking</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
          <Button onClick={() => onConfirm(method)} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lanjutkan Pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}