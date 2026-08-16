"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

function checkSuperAdmin(session: any) {
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }
}

// -----------------------------------------------------------------------------
// TAB 1: TENANTS (RT)
// -----------------------------------------------------------------------------
export async function getTenants() {
  const session = await auth();
  checkSuperAdmin(session);
  const tenants = await prisma.tenant.findMany({
    include: {
      users: { select: { email: true, name: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return tenants;
}

// -----------------------------------------------------------------------------
// TAB 2: WARGA (GLOBAL SEARCH)
// -----------------------------------------------------------------------------
export async function searchWargaGlobal(query: string) {
  const session = await auth();
  checkSuperAdmin(session);
  if (!query || query.length < 3) return [];
  
  const wargas = await prisma.warga.findMany({
    where: {
      OR: [
        { nik: { contains: query } },
        { namaLengkap: { contains: query } }
      ]
    },
    include: { tenant: true },
    take: 50
  });
  
  return wargas;
}

export async function deleteWargaGlobal(wargaId: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    
    await prisma.warga.delete({
      where: { id: wargaId }
    });
    
    revalidatePath("/admin/data");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// TAB 3: USAGE STATS (AJAX)
// -----------------------------------------------------------------------------
export async function getTenantUsageStats(tenantId: string) {
  const session = await auth();
  checkSuperAdmin(session);
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalWarga = await prisma.warga.count({ where: { tenantId } });
  const totalSurat = await prisma.suratArsip.count({ where: { tenantId, createdAt: { gte: startOfMonth } } });
  
  const notulens = await prisma.notulenAi.findMany({ where: { tenantId, createdAt: { gte: startOfMonth } } });
  const aiChatLogs = await prisma.activityLog.findMany({ where: { tenantId, action: { in: ["AI_CHAT_USAGE", "AI_BROADCAST_USAGE", "AI_REPORT_USAGE", "AI_OCR_USAGE", "AI_AUDIO_USAGE", "AI_DRAFT_USAGE"] }, createdAt: { gte: startOfMonth } } });
  
  const aiChatUsed = aiChatLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0);
  const totalAi = notulens.reduce((acc, curr) => acc + curr.tokenUsed, 0) + aiChatUsed;
  
  const allKas = await prisma.kasTransaction.findMany({ where: { tenantId } });
  let kasSaldo = 0;
  allKas.forEach(k => {
    const amt = Number(k.amount);
    if (k.type === "PEMASUKAN") kasSaldo += amt;
    else kasSaldo -= amt;
  });

  return { success: true, totalWarga, totalSurat, totalAi, kasSaldo };
}
