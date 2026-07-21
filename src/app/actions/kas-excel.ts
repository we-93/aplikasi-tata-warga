"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function importKasBulk(data: any[]) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.tenantId) {
      throw new Error("Unauthorized");
    }
    const tenantId = session.user.tenantId;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Data kosong atau format salah.");
    }

    let successCount = 0;

    for (const row of data) {
      // Validate minimum required fields
      if (!row.amount || !row.type) continue;

      const typeRaw = String(row.type).toUpperCase();
      const type = typeRaw === "PEMASUKAN" ? "PEMASUKAN" : "PENGELUARAN";
      
      const amount = Number(row.amount);
      if (isNaN(amount) || amount <= 0) continue;

      const category = row.category ? String(row.category) : "Lain-lain";
      const description = row.description ? String(row.description) : null;
      
      let date = new Date();
      if (row.date) {
        const parsedDate = new Date(row.date);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        }
      }

      await prisma.kasTransaction.create({
        data: {
          tenantId,
          type,
          amount,
          category,
          description,
          date
        }
      });

      successCount++;
    }

    revalidatePath("/dashboard/rt/kas");
    revalidatePath("/dashboard/rt");
    
    return { success: true, message: `Berhasil mengimpor ${successCount} transaksi kas.` };
  } catch (error: any) {
    console.error("Bulk Import Kas Error:", error);
    return { success: false, error: error.message || "Gagal mengimpor data kas." };
  }
}
