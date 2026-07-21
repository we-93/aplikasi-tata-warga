import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LetterEditorForm } from "@/components/admin/letter-editor-form";

export default function CreateLetterTemplatePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/letters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Template Surat</h1>
          <p className="text-muted-foreground mt-1">Desain master template menggunakan Editor Visual dan atur ukuran cetaknya.</p>
        </div>
      </div>

      <LetterEditorForm />
    </div>
  );
}
