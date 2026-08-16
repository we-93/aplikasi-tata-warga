import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WargaKkCheck } from "@/components/rt/warga-kk-check";

export default function CreateWargaPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/rt/warga">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Warga</h1>
          <p className="text-muted-foreground mt-1">Cek atau tambahkan data Kartu Keluarga baru ke dalam sistem RT.</p>
        </div>
      </div>

      <WargaKkCheck />
    </div>
  );
}
