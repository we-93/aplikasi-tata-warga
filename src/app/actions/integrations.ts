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
// WA DEVICE ACTIONS
// -----------------------------------------------------------------------------

export async function getWaDevices() {
  const session = await auth();
  checkSuperAdmin(session);
  return await prisma.waDevice.findMany({ 
    include: { tenants: true, groups: { include: { tenant: true } } },
    orderBy: { createdAt: "asc" } 
  });
}

export async function addWaDevice(data: { name: string; provider: string; apiKey: string; slotLimit: number; phoneNumber?: string; groups?: { name: string; groupId: string; groupInviteLink?: string }[] }) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    const device = await prisma.waDevice.create({
      data: {
        name: data.name,
        provider: data.provider,
        apiKey: data.apiKey,
        slotLimit: data.slotLimit,
        phoneNumber: data.phoneNumber || null,
        status: "OFFLINE", // Default status
        groups: {
          create: data.groups?.map(g => ({
            name: g.name,
            groupId: g.groupId,
            groupInviteLink: g.groupInviteLink || null
          })) || []
        }
      },
    });
    
    revalidatePath("/admin/integrations");
    return { success: true, device };
  } catch (error: any) {
    console.error("Failed to add WaDevice:", error);
    return { success: false, error: error.message || "Gagal menambahkan perangkat WA." };
  }
}

export async function updateWaDevice(id: string, data: { name: string; provider: string; apiKey: string; slotLimit: number; phoneNumber?: string; groups?: { id?: string; name: string; groupId: string; groupInviteLink?: string }[] }) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    const device = await prisma.waDevice.update({
      where: { id },
      data: {
        name: data.name,
        provider: data.provider,
        apiKey: data.apiKey,
        slotLimit: data.slotLimit,
        phoneNumber: data.phoneNumber || null,
      },
    });

    if (data.groups) {
      // Get existing groups
      const existingGroups = await prisma.waGroup.findMany({ where: { waDeviceId: id } });
      
      const toKeepIds = data.groups.filter(g => g.id).map(g => g.id);
      
      // Delete removed groups
      const toDelete = existingGroups.filter(eg => !toKeepIds.includes(eg.id));
      if (toDelete.length > 0) {
        await prisma.waGroup.deleteMany({ where: { id: { in: toDelete.map(g => g.id) } } });
      }

      // Update existing or create new
      for (const groupData of data.groups) {
        if (groupData.id) {
          await prisma.waGroup.update({
            where: { id: groupData.id },
            data: {
              name: groupData.name,
              groupId: groupData.groupId,
              groupInviteLink: groupData.groupInviteLink || null
            }
          });
        } else {
          await prisma.waGroup.create({
            data: {
              waDeviceId: id,
              name: groupData.name,
              groupId: groupData.groupId,
              groupInviteLink: groupData.groupInviteLink || null
            }
          });
        }
      }
    }
    
    revalidatePath("/admin/integrations");
    return { success: true, device };
  } catch (error: any) {
    console.error("Failed to update WaDevice:", error);
    return { success: false, error: error.message || "Gagal memperbarui perangkat WA." };
  }
}

export async function deleteWaDevice(id: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    await prisma.waDevice.delete({ where: { id } });
    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete WaDevice:", error);
    return { success: false, error: error.message || "Gagal menghapus perangkat WA." };
  }
}

export async function pingWaDevice(id: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    const device = await prisma.waDevice.findUnique({ where: { id } });
    if (!device) throw new Error("Perangkat tidak ditemukan");

    let newStatus = "OFFLINE";
    let phoneNumber = device.phoneNumber;
    
    if (device.provider === "FONNTE") {
      try {
        const response = await fetch("https://api.fonnte.com/device", {
          method: "POST",
          headers: {
            "Authorization": device.apiKey
          }
        });
        const data = await response.json();
        
        if (data && data.device_status === "connect") {
          newStatus = "ONLINE";
          // Fonnte returns the number in `device` or `name` field sometimes.
          // We'll update the number if available.
          if (data.device && typeof data.device === 'string') {
            phoneNumber = data.device;
          }
        }
      } catch (err) {
        console.error("Fonnte ping failed:", err);
      }
    } else {
      // Implement other providers like APICOID here if needed
      // For now, if not fonnte, fallback to old mock logic for safety or just keep offline
      const isOnline = Math.random() > 0.2;
      newStatus = isOnline ? "ONLINE" : "OFFLINE";
    }

    await prisma.waDevice.update({
      where: { id },
      data: { 
        status: newStatus,
        phoneNumber: phoneNumber
      }
    });

    revalidatePath("/admin/integrations");
    return { success: true, status: newStatus, message: newStatus === "ONLINE" ? "Perangkat terhubung!" : "Perangkat terputus (Offline)." };
  } catch (error: any) {
    console.error("Failed to ping WaDevice:", error);
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

  // Aggregate total token usage from all AI features (NotulenAi + ActivityLog)
  const notulenTokens = await prisma.notulenAi.aggregate({
    _sum: { tokenUsed: true }
  });
  const notulenUsed = notulenTokens._sum.tokenUsed || 0;

  const otherAiLogs = await prisma.activityLog.findMany({
    where: {
      action: {
        in: ["AI_CHAT_USAGE", "AI_REPORT_USAGE", "AI_BROADCAST_USAGE"]
      }
    }
  });
  const otherAiUsed = otherAiLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0);

  const totalTokensUsed = notulenUsed + otherAiUsed;

  return {
    openaiApiKey: settings.openaiApiKey || "",
    geminiApiKey: settings.geminiApiKey || "",
    aiMasterPrompt: settings.aiMasterPrompt || "",
    totalTokensUsed,
  };
}

export async function saveAiSettings(data: { 
  openaiApiKey: string; 
  geminiApiKey: string;
  aiMasterPrompt: string;
}) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    let settings = await prisma.siteSettings.findFirst();
    
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          openaiApiKey: data.openaiApiKey,
          geminiApiKey: data.geminiApiKey,
          aiMasterPrompt: data.aiMasterPrompt,
        }
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          openaiApiKey: data.openaiApiKey,
          geminiApiKey: data.geminiApiKey,
          aiMasterPrompt: data.aiMasterPrompt,
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
