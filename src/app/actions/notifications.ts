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
// ADMIN ACTIONS
// -----------------------------------------------------------------------------
export async function getAdminNotifications() {
  const session = await auth();
  checkSuperAdmin(session);
  
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: { tenant: { select: { name: true } } }
  });
  
  return notifications;
}

export async function broadcastNotification(data: { title: string; message: string; targetTenantId?: string }) {
  try {
    const session = await auth();
    checkSuperAdmin(session);

    if (data.targetTenantId && data.targetTenantId !== "ALL") {
      // Send to specific tenant
      await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          tenantId: data.targetTenantId,
          isGlobal: false
        }
      });
    } else {
      // Send to ALL tenants individually so they can mark it read independently
      const tenants = await prisma.tenant.findMany({ select: { id: true } });
      const notifs = tenants.map(t => ({
        title: data.title,
        message: data.message,
        tenantId: t.id,
        isGlobal: true
      }));

      if (notifs.length > 0) {
        await prisma.notification.createMany({ data: notifs });
      }
    }

    revalidatePath("/admin/notifications");
    // Also revalidate RT dashboard layout if possible, or just rely on client refresh
    return { success: true };
  } catch (error: any) {
    console.error("Failed to broadcast notification:", error);
    return { success: false, error: error.message || "Gagal mengirim notifikasi." };
  }
}

export async function deleteNotification(id: string) {
  try {
    const session = await auth();
    checkSuperAdmin(session);
    await prisma.notification.delete({ where: { id } });
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -----------------------------------------------------------------------------
// TENANT (RT) ACTIONS
// -----------------------------------------------------------------------------
export async function getTenantNotifications() {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  const notifications = await prisma.notification.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
    take: 50 // Limit to recent 50
  });

  return notifications;
}

export async function markNotificationRead(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return { success: false };

    await prisma.notification.update({
      where: { id, tenantId: session.user.tenantId },
      data: { isRead: true }
    });
    
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsRead() {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return { success: false };

    await prisma.notification.updateMany({
      where: { tenantId: session.user.tenantId, isRead: false },
      data: { isRead: true }
    });
    
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
