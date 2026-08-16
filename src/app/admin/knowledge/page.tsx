import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { KnowledgeClient } from "./client";

export const metadata = {
  title: "Knowledge Base AI - Super Admin",
};

export default async function KnowledgePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "SUPER_ADMIN") redirect("/dashboard/rt");

  const settings = await prisma.siteSettings.findFirst();
  const qdrantConfigured = !!(settings?.qdrantUrl && settings?.qdrantApiKey);
  
  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 md:p-8">
      <KnowledgeClient 
        initialDocuments={documents} 
        qdrantConfigured={qdrantConfigured}
      />
    </div>
  );
}
