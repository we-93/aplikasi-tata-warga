"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Helper: tulis log (dipanggil dari server actions lain) ──────────────────
export async function writeLog(data: {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  description?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        tenantId: data.tenantId ?? null,
        userId: data.userId ?? null,
        action: data.action,
        description: data.description ?? null,
      },
    });
  } catch {
    // Jangan crash jika log gagal — non-blocking
  }
}

// ─── Helper: resolve user & tenant dari session ──────────────────────────────
export async function resolveSession() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, tenantId: true, role: true, name: true },
  });
  return user;
}

// ─── Admin: ambil semua log (global audit trail) ─────────────────────────────
export async function getAdminLogs(filters: {
  page?: number;
  perPage?: number;
  search?: string;
  tenantId?: string;
  action?: string;
}) {
  const { page = 1, perPage = 50, search, tenantId, action } = filters;

  const where: any = {};
  if (tenantId && tenantId !== "all") where.tenantId = tenantId;
  if (action && action !== "all") where.action = action;
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { description: { contains: search } },
      { user: { name: { contains: search } } },
      { tenant: { name: { contains: search } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
        tenant: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.activityLog.count({ where }),
  ]);

  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return {
    logs: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      user: l.user,
      tenant: l.tenant,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    tenants,
  };
}

// ─── RT: ambil log milik tenant sendiri ──────────────────────────────────────
export async function getRtLogs(filters: { page?: number; perPage?: number; search?: string; action?: string }) {
  const user = await resolveSession();
  if (!user?.tenantId) throw new Error("Akses ditolak.");

  const { page = 1, perPage = 30, search, action } = filters;

  const where: any = { tenantId: user.tenantId };
  if (action && action !== "all") where.action = action;
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      user: l.user,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

// ─── Admin: hapus log lama (opsional, hanya admin) ───────────────────────────
export async function clearOldLogs(olderThanDays: number) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  if (user?.role !== "SUPER_ADMIN") throw new Error("Akses ditolak");

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const { count } = await prisma.activityLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  revalidatePath("/admin/logs");
  return { success: true, deleted: count };
}
