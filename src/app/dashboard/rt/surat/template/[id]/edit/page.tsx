import { RtLetterEditorForm } from "@/components/rt/rt-letter-editor-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function EditRtTemplatePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId) {
    return <div>Akses Ditolak</div>;
  }

  const template = await prisma.suratTemplate.findUnique({
    where: { id: params.id }
  });

  if (!template || template.tenantId !== tenantId) {
    notFound();
  }

  const initialData = {
    ...template,
    marginTop: template.marginTop,
    marginBottom: template.marginBottom,
    marginLeft: template.marginLeft,
    marginRight: template.marginRight,
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/rt/surat/template">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Edit Template Kustom</h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Perbarui kerangka surat RT Anda.</p>
        </div>
      </div>
      
      <RtLetterEditorForm initialData={initialData} />
    </div>
  );
}
