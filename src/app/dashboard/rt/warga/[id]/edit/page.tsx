import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WargaEditorForm } from "@/components/rt/warga-editor-form";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditWargaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  const warga = await prisma.warga.findUnique({
    where: { id }
  });

  if (!warga || warga.tenantId !== session?.user?.tenantId) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/rt/warga">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Data Warga</h1>
          <p className="text-muted-foreground mt-1">Perbarui data kependudukan warga ini.</p>
        </div>
      </div>

      <WargaEditorForm initialData={warga} />
    </div>
  );
}
