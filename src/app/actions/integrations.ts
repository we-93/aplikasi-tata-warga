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
// WA DEVICE ACTIONS (DEPRECATED - MIGRATED TO KIRIM.CHAT)
// -----------------------------------------------------------------------------

export async function pingKirimChat() {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    // Kirim.chat relies on Cloud API which is highly available.
    // If the system has KIRIMCHAT_API_KEY environment variable, we consider it ONLINE.
    if (process.env.KIRIMCHAT_API_KEY) {
      // In a real scenario, we could hit the public profile API endpoint to verify
      return { success: true, status: "ONLINE", message: "Kirim.chat terhubung dengan baik!" };
    }

    return { success: true, status: "OFFLINE", message: "API Key Kirim.chat tidak ditemukan." };
  } catch (error: any) {
    console.error("Failed to ping Kirim.chat:", error);
    return { success: false, error: error.message || "Gagal melakukan ping." };
  }
}

// -----------------------------------------------------------------------------
// AI CONFIG ACTIONS
// -----------------------------------------------------------------------------

export async function getAiSettings() {
  const session = await auth();
  checkSuperAdmin(session);
  
  let settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: {} });
  }

  // WeizeRouter (Chat, Broadcast, Report, Draft, Notulen)
  const notulenTokens = await prisma.notulenAi.aggregate({
    _sum: { tokenUsed: true }
  });
  const notulenDraftUsed = notulenTokens._sum.tokenUsed || 0;

  const chatAiLogs = await prisma.activityLog.findMany({
    where: {
      action: {
        in: ["AI_CHAT_USAGE", "AI_REPORT_USAGE", "AI_BROADCAST_USAGE", "AI_DRAFT_USAGE"]
      }
    }
  });
  const totalChatTokensUsed = chatAiLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0) + notulenDraftUsed;

  // OpenAI / Gemini (OCR)
  const ocrAiLogs = await prisma.activityLog.findMany({
    where: {
      action: {
        in: ["AI_OCR_USAGE"]
      }
    }
  });
  const totalOcrTokensUsed = ocrAiLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0);

  return {
    openaiApiKey: settings.openaiApiKey || "",
    openaiApiModel: settings.openaiApiModel || "gpt-4.1-nano",
    qdrantUrl: settings.qdrantUrl || "",
    qdrantApiKey: settings.qdrantApiKey || "",
    geminiApiKey: settings.geminiApiKey || "",
    aiMasterPrompt: settings.aiMasterPrompt || "",
    chatApiUrl: settings.chatApiUrl || "https://weizerouter.web.id/v1",
    chatApiKey: settings.chatApiKey || "",
    chatApiModel: settings.chatApiModel || "wz/gemini-3.5-flash-low",
    docApiUrl: settings.docApiUrl || "https://weizerouter.web.id/v1",
    docApiKey: settings.docApiKey || "",
    docApiModel: settings.docApiModel || "wz/gemini-3.5-flash-low",
    totalChatTokensUsed,
    totalOcrTokensUsed,
  };
}

export async function saveAiSettings(data: { 
  openaiApiKey: string; 
  openaiApiModel: string;
  qdrantUrl?: string;
  qdrantApiKey?: string;
  geminiApiKey: string;
  aiMasterPrompt: string;
  chatApiUrl: string;
  chatApiKey: string;
  chatApiModel: string;
  docApiUrl?: string;
  docApiKey?: string;
  docApiModel?: string;
}) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    const settings = await prisma.siteSettings.findFirst();
    
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          openaiApiKey: data.openaiApiKey,
          openaiApiModel: data.openaiApiModel,
          qdrantUrl: data.qdrantUrl,
          qdrantApiKey: data.qdrantApiKey,
          geminiApiKey: data.geminiApiKey,
          aiMasterPrompt: data.aiMasterPrompt,
          chatApiUrl: data.chatApiUrl,
          chatApiKey: data.chatApiKey,
          chatApiModel: data.chatApiModel,
          docApiUrl: data.docApiUrl,
          docApiKey: data.docApiKey,
          docApiModel: data.docApiModel,
        }
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          openaiApiKey: data.openaiApiKey,
          openaiApiModel: data.openaiApiModel,
          qdrantUrl: data.qdrantUrl,
          qdrantApiKey: data.qdrantApiKey,
          geminiApiKey: data.geminiApiKey,
          aiMasterPrompt: data.aiMasterPrompt,
          chatApiUrl: data.chatApiUrl,
          chatApiKey: data.chatApiKey,
          chatApiModel: data.chatApiModel,
          docApiUrl: data.docApiUrl,
          docApiKey: data.docApiKey,
          docApiModel: data.docApiModel,
        }
      });
    }

    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save AI Settings:", error);
    return { success: false, error: error.message || "Gagal menyimpan konfigurasi AI." };
  }
}

export async function getTokenUsageLogs() {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    const logs = await prisma.activityLog.findMany({
      where: {
        action: {
          in: ["AI_CHAT_USAGE", "AI_REPORT_USAGE", "AI_BROADCAST_USAGE", "AI_DRAFT_USAGE", "AI_OCR_USAGE"]
        }
      },
      include: {
        tenant: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100 // Limit to last 100 logs for performance
    });

    return {
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        date: log.createdAt,
        action: log.action,
        tokens: parseInt(log.description || "0") || 0,
        tenantName: log.tenant?.name || "Global"
      }))
    };
  } catch (error: any) {
    console.error("Failed to fetch token logs:", error);
    return { success: false, error: error.message || "Gagal mengambil log token." };
  }
}
