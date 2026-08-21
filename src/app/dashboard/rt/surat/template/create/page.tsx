import { RtLetterEditorForm } from "@/components/rt/rt-letter-editor-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateRtTemplatePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/rt/surat/template">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Tambah Template Kustom</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Buat format surat spesifik untuk RT Anda.</p>
        </div>
      </div>
      
      <RtLetterEditorForm />
    </div>
  );
}
