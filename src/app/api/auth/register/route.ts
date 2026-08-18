import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Tenant for this RT
    const slug = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 50);

    // Ensure slug is unique
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    const finalSlug = existingTenant ? `${slug}-${Date.now()}` : slug;

    const tenant = await prisma.tenant.create({
      data: {
        name: `RT - ${name}`,
        slug: finalSlug,
        noHpRt: phone,
        aiChatCredits: 30,
        aiDocCredits: 5,
        status: "AKTIF",
      },
    });

    // Create the user as TENANT_ADMIN
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
