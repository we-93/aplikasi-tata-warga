import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const isFirstDayOfMonth = now.getDate() === 1;

    let resetCount = 0;

    if (isFirstDayOfMonth) {
      // Reset credits for all tenants
      const result = await prisma.tenant.updateMany({
        data: {
          aiChatCredits: 30,
          aiDocCredits: 5,
          lastCreditResetDate: now
        }
      });
      resetCount = result.count;
    }

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      isFirstDayOfMonth,
      resetCount
    });

  } catch (error: any) {
    console.error("Cron Daily Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
