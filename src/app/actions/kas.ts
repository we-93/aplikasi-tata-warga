"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeLog, resolveSession } from "./logs";

// Ensure user is authorized and get tenant ID
async function getAuthTenant() {
  const session = await auth();
  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true, role: true }
  });

  if (!user || !user.tenantId) {
    throw new Error("User tidak memiliki akses Tenant RT.");
  }

  return user.tenantId;
}

export async function getKasSummary() {
  const tenantId = await getAuthTenant();

  // Get start of the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate Total Saldo (All Time)
  const allTransactions = await prisma.kasTransaction.groupBy({
    by: ['type'],
    where: { tenantId },
    _sum: { amount: true }
  });

  let totalPemasukanAll = 0;
  let totalPengeluaranAll = 0;

  allTransactions.forEach(t => {
    const sum = Number(t._sum.amount || 0);
    if (t.type === 'PEMASUKAN') totalPemasukanAll = sum;
    if (t.type === 'PENGELUARAN') totalPengeluaranAll = sum;
  });

  const saldoSaatIni = totalPemasukanAll - totalPengeluaranAll;

  // Calculate Total Pemasukan & Pengeluaran (This Month Only)
  const monthlyTransactions = await prisma.kasTransaction.groupBy({
    by: ['type'],
    where: { 
      tenantId,
      date: { gte: startOfMonth }
    },
    _sum: { amount: true }
  });

  let pemasukanBulanIni = 0;
  let pengeluaranBulanIni = 0;

  monthlyTransactions.forEach(t => {
    const sum = Number(t._sum.amount || 0);
    if (t.type === 'PEMASUKAN') pemasukanBulanIni = sum;
    if (t.type === 'PENGELUARAN') pengeluaranBulanIni = sum;
  });

  return {
    saldoSaatIni,
    pemasukanBulanIni,
    pengeluaranBulanIni
  };
}

export async function getKasTransactions() {
  const tenantId = await getAuthTenant();
  
  const transactions = await prisma.kasTransaction.findMany({
    where: { tenantId },
    orderBy: { date: 'desc' },
  });

  // Convert Decimal to Number for Client Component compatibility
  return transactions.map(t => ({
    ...t,
    amount: Number(t.amount)
  }));
}

export async function createKasTransaction(data: {
  type: "PEMASUKAN" | "PENGELUARAN";
  amount: number;
  category: string;
  description: string;
  date: Date;
}) {
  try {
    const tenantId = await getAuthTenant();
    const user = await resolveSession();

    await prisma.kasTransaction.create({
      data: {
        tenantId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description || "",
        date: data.date
      }
    });

    await writeLog({ tenantId, userId: user?.id, action: "KAS_CREATED", description: `${data.type} | ${data.category} | Rp${data.amount}` });
    revalidatePath("/dashboard/rt/kas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteKasTransaction(id: string) {
  try {
    const tenantId = await getAuthTenant();
    const user = await resolveSession();
    const tx = await prisma.kasTransaction.findUnique({ where: { id } });
    if (!tx || tx.tenantId !== tenantId) throw new Error("Data tidak ditemukan atau akses ditolak");

    await prisma.kasTransaction.delete({ where: { id } });
    await writeLog({ tenantId, userId: user?.id, action: "KAS_DELETED", description: `${tx.type} | ${tx.category} | Rp${Number(tx.amount)}` });
    revalidatePath("/dashboard/rt/kas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateKasTransaction(id: string, data: {
  type: "PEMASUKAN" | "PENGELUARAN";
  amount: number;
  category: string;
  description: string;
  date: Date;
}) {
  try {
    const tenantId = await getAuthTenant();

    const tx = await prisma.kasTransaction.findUnique({ where: { id } });
    if (!tx || tx.tenantId !== tenantId) throw new Error("Data tidak ditemukan atau akses ditolak");

    await prisma.kasTransaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description || "",
        date: data.date
      }
    });

    revalidatePath("/dashboard/rt/kas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get 6-month chart data for visualization
export async function getKasChartData() {
  const tenantId = await getAuthTenant();

  const months: { label: string; pemasukan: number; pengeluaran: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const txs = await prisma.kasTransaction.groupBy({
      by: ["type"],
      where: { tenantId, date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    });

    let pemasukan = 0;
    let pengeluaran = 0;
    txs.forEach(t => {
      if (t.type === "PEMASUKAN") pemasukan = Number(t._sum.amount || 0);
      if (t.type === "PENGELUARAN") pengeluaran = Number(t._sum.amount || 0);
    });

    months.push({
      label: startOfMonth.toLocaleString("id-ID", { month: "short", year: "2-digit" }),
      pemasukan,
      pengeluaran
    });
  }

  return months;
}

