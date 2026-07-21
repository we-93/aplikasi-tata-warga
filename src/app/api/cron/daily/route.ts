import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage } from "@/lib/whatsapp";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication (Secret Key)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Settings
    const settings = await prisma.siteSettings.findFirst();
    if (!settings || !settings.waAdminApiKey) {
      return NextResponse.json({ error: "WA Admin API Key is not configured." }, { status: 500 });
    }

    const provider = settings.waAdminProvider || "FONNTE";
    const apiKey = settings.waAdminApiKey;

    const template7Days = settings.waAdminExpired7DaysTemplate || "Peringatan! Paket {{paket}} Anda akan kedaluwarsa dalam 7 hari pada {{tanggal}}. Segera lakukan perpanjangan agar sistem tetap berjalan.";
    const templateToday = settings.waAdminExpiredTodayTemplate || "Perhatian! Paket {{paket}} Anda telah KEDALUWARSA hari ini. Sistem telah dinonaktifkan sementara. Segera lakukan perpanjangan.";

    // 3. Find target dates
    const now = new Date();
    
    // For H-7: activeUntil is exactly 7 days from now (within the 7th day)
    const target7DaysStart = new Date(now);
    target7DaysStart.setDate(target7DaysStart.getDate() + 7);
    target7DaysStart.setHours(0, 0, 0, 0);
    
    const target7DaysEnd = new Date(target7DaysStart);
    target7DaysEnd.setHours(23, 59, 59, 999);

    // For H-0 (Today): activeUntil is exactly today (within today) or in the past
    // The user requested: "ya otomatis mengubah statusnya menjadi KADALUARSA kecuali dia memperpanjang paket sebelum Hari H"
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    let sent7DaysCount = 0;
    let sentTodayCount = 0;
    let expiredCount = 0;

    // --- 4. Process H-7 Warning ---
    const tenants7Days = await prisma.tenant.findMany({
      where: {
        status: "AKTIF",
        activeUntil: {
          gte: target7DaysStart,
          lte: target7DaysEnd
        }
      }
    });

    for (const tenant of tenants7Days) {
      if (tenant.noHpRt) {
        let msg = template7Days.replace(/{{paket}}/g, tenant.subscriptionPlan || "Layanan");
        msg = msg.replace(/{{tanggal}}/g, tenant.activeUntil ? new Date(tenant.activeUntil).toLocaleDateString('id-ID') : "-");
        
        try {
          await sendMessage(apiKey, tenant.noHpRt, msg, provider);
          sent7DaysCount++;
        } catch (e) {
          console.error(`Failed to send H-7 WA to ${tenant.noHpRt}`, e);
        }
      }
    }

    // --- 5. Process H-0 Expired & Update Status ---
    // Find all active tenants whose activeUntil is today or already passed
    const tenantsExpired = await prisma.tenant.findMany({
      where: {
        status: "AKTIF",
        activeUntil: {
          lte: todayEnd // Any activeUntil that is before the end of today
        }
      }
    });

    for (const tenant of tenantsExpired) {
      // Send WA Notification
      if (tenant.noHpRt) {
        let msg = templateToday.replace(/{{paket}}/g, tenant.subscriptionPlan || "Layanan");
        msg = msg.replace(/{{tanggal}}/g, tenant.activeUntil ? new Date(tenant.activeUntil).toLocaleDateString('id-ID') : "-");
        
        try {
          await sendMessage(apiKey, tenant.noHpRt, msg, provider);
          sentTodayCount++;
        } catch (e) {
          console.error(`Failed to send Expired WA to ${tenant.noHpRt}`, e);
        }
      }

      // Automatically change status to KADALUARSA
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { status: "KADALUARSA" }
      });
      expiredCount++;
    }

    return NextResponse.json({
      success: true,
      summary: {
        notified7Days: sent7DaysCount,
        notifiedExpired: sentTodayCount,
        statusUpdatedToKadaluarsa: expiredCount
      }
    });

  } catch (error: any) {
    console.error("Cron Daily Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
