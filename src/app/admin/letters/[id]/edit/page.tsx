import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LetterEditorForm } from "@/components/admin/letter-editor-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditLetterTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const template = await prisma.suratTemplate.findUnique({
    where: { id }
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/letters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Template Surat</h1>
          <p className="text-muted-foreground mt-1">Perbarui desain atau margin dari template yang sudah ada.</p>
        </div>
      </div>

      <LetterEditorForm 
        initialData={{
          id: template.id,
          name: template.name,
          code: template.code,
          contentHtml: template.contentHtml,
          paperSize: template.paperSize,
          marginTop: template.marginTop,
          marginBottom: template.marginBottom,
          marginLeft: template.marginLeft,
          marginRight: template.marginRight,
        }} 
      />
    </div>
  );
}
