import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WargaKkCheck } from "@/components/rt/warga-kk-check";

export default function CreateWargaPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10 w-full">
        <Link href="/dashboard/rt/warga" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-[#6519c2]">Pendaftaran Warga</h1>
      </div>

      <WargaKkCheck />
    </div>
  );
}
