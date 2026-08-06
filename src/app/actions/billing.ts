"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendMessage } from "@/lib/whatsapp";
import { getCycleStart } from "@/lib/utils";

async function getAuthTenant() {
  const session = await auth();
  if (!session || !session.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  });
  if (!user || !user.tenantId) throw new Error("Akses ditolak.");
  return user.tenantId;
}

export async function getBillingDashboard() {
  const tenantId = await getAuthTenant();
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      subscriptionPlan: true,
      activeUntil: true,
      maxWarga: true,
      addonMaxSurat: true,
      addonMaxAiToken: true,
    }
  });

  if (!tenant) throw new Error("Tenant tidak ditemukan.");

  // Get active products
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { hargaPendaftaran: 'asc' }
  });

  // Filter by the new 'type' field instead of 'billingPeriod'
  const mainPlans = allProducts.filter(p => p.type === 'NEW');
  const addons = allProducts.filter(p => p.type === 'ADDON');

  // Get current active product details based on tenant's subscriptionPlan
  const currentProduct = await prisma.product.findFirst({ 
    where: { name: tenant.subscriptionPlan } 
  });

  // Calculate the start date of the current billing cycle
  const cycleStart = getCycleStart(tenant.activeUntil, currentProduct?.masaAktifBulan || 30);
  cycleStart.setHours(0, 0, 0, 0);

  const suratCount = await prisma.suratArsip.count({
    where: {
      tenantId,
      createdAt: { gte: cycleStart }
    }
  });

  // Get current cycle's AI usage
  const notulens = await prisma.notulenAi.findMany({ where: { tenantId, createdAt: { gte: cycleStart } } });
  const aiChatLogs = await prisma.activityLog.findMany({ 
    where: { 
      tenantId, 
      action: { in: ["AI_CHAT_USAGE", "AI_BROADCAST_USAGE", "AI_REPORT_USAGE", "AI_OCR_USAGE", "AI_AUDIO_USAGE", "AI_DRAFT_USAGE"] }, 
      createdAt: { gte: cycleStart } 
    } 
  });
  const aiChatUsed = aiChatLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0);
  const aiUsed = notulens.reduce((acc, curr) => acc + curr.tokenUsed, 0) + aiChatUsed;

  // Get invoice history
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    include: { product: true },
    orderBy: { date: 'desc' }
  });

  return {
    tenant: {
      ...tenant,
      // Calculate remaining days
      daysRemaining: tenant.activeUntil 
        ? Math.ceil((tenant.activeUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        : 0
    },
    currentProduct: currentProduct ? { 
      ...currentProduct, 
      price: Number(currentProduct.price),
      hargaPendaftaran: Number(currentProduct.hargaPendaftaran),
      hargaPerpanjangan: Number(currentProduct.hargaPerpanjangan)
    } : null,
    usage: {
      surat: suratCount,
      aiToken: aiUsed
    },
    invoices: invoices.map(i => ({
      ...i,
      amount: Number(i.amount),
      product: i.product ? { 
        ...i.product, 
        price: Number(i.product.price),
        hargaPendaftaran: Number(i.product.hargaPendaftaran),
        hargaPerpanjangan: Number(i.product.hargaPerpanjangan)
      } : null
    })),
    mainPlans: mainPlans.map(p => ({
      ...p, 
      price: Number(p.price),
      hargaPendaftaran: Number(p.hargaPendaftaran),
      hargaPerpanjangan: Number(p.hargaPerpanjangan)
    })),
    addons: addons.map(p => ({
      ...p, 
      price: Number(p.price),
      hargaPendaftaran: Number(p.hargaPendaftaran),
      hargaPerpanjangan: Number(p.hargaPerpanjangan)
    }))
  };
}

export async function createCheckoutInvoice(productId: string, orderType: "UPGRADE" | "RENEW" | "TOPUP", paymentMethod: string = "transfer") {
  try {
    const tenantId = await getAuthTenant();
    
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Produk tidak ditemukan.");

    // Generate Invoice Number
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV/${dateStr}/${randomStr}`;
    
    // Gunakan hargaPendaftaran untuk UPGRADE/TOPUP/NEW, hargaPerpanjangan untuk RENEW
    const hargaPerpanjang = Number(product.hargaPerpanjangan) > 0 ? product.hargaPerpanjangan : product.hargaPendaftaran;
    const finalAmount = orderType === "RENEW" ? hargaPerpanjang : product.hargaPendaftaran;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        tenantId,
        productId,
        orderType,
        amount: finalAmount,
        status: "PENDING",
        paymentMethod
      },
      include: { tenant: true }
    });

    // Send automated invoice WA
    try {
      if (invoice.tenant.noHpRt) {
        const settings = await prisma.siteSettings.findFirst();
        if (settings?.waAdminApiKey) {
          let invTemplate = settings.waAdminInvoiceTemplate || "Halo Kak! Pesanan Tata Warga Anda telah kami terima.\nNo Invoice: {{invoice}}\nPaket: {{paket}}\nTotal: Rp {{harga}}\n\nSilakan transfer ke rekening BCA 123456 a.n. Tata Warga, lalu balas pesan ini dengan menyertakan bukti transfer agar akun segera diaktifkan.";
          let bankStr = "- BCA 1234 567 890 a.n PT Tata Warga Digital"; // fallback
          if (settings.bankInstructions) {
            try {
              const parsedBanks = typeof settings.bankInstructions === 'string' 
                ? JSON.parse(settings.bankInstructions) 
                : settings.bankInstructions;
              if (Array.isArray(parsedBanks) && parsedBanks.length > 0) {
                bankStr = parsedBanks.map((b: any) => `- ${b.bank}: ${b.account} (a.n ${b.name})`).join('\n');
              }
            } catch(e) {}
          }
          
          invTemplate = invTemplate.replace(/{{nama}}/gi, invoice.tenant.name || "-");
          invTemplate = invTemplate.replace(/{{invoice}}/gi, invoiceNumber);
          invTemplate = invTemplate.replace(/{{paket}}/gi, product.name);
          invTemplate = invTemplate.replace(/{{produk}}/gi, product.name);
          invTemplate = invTemplate.replace(/{{harga}}/gi, new Intl.NumberFormat("id-ID").format(Number(finalAmount)));
          invTemplate = invTemplate.replace(/{{bank}}/gi, bankStr);
          invTemplate = invTemplate.replace(/{{tanggal}}/gi, new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }));
          invTemplate = invTemplate.replace(/{{email}}/gi, "-");
          invTemplate = invTemplate.replace(/{{password}}/gi, "-");
          invTemplate = invTemplate.replace(/{{bot_wa}}/gi, invoice.tenant.whatsappBotNo || "-");
          invTemplate = invTemplate.replace(/{{link_login}}/gi, "https://tatawarga.biz.id/login");
          invTemplate = invTemplate.replace(/{{link_grup}}/gi, "-");

          const { sendMessage } = await import("@/lib/whatsapp");
          sendMessage(
            settings.waAdminApiKey, 
            invoice.tenant.noHpRt, 
            invTemplate, 
            settings.waAdminProvider || "FONNTE"
          ).catch(e => console.error("Error sending WA invoice notification:", e));
        }
      }
    } catch (e) {
      console.error("Failed to send WA Invoice Notification", e);
    }

    return { success: true, invoiceId: invoice.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInvoiceDetails(invoiceId: string) {
  const tenantId = await getAuthTenant();
  
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId },
    include: {
      product: true,
      tenant: true
    }
  });

  if (!invoice) throw new Error("Invoice tidak ditemukan.");

  const settings = await prisma.siteSettings.findFirst();

  return {
    invoice: {
      ...invoice,
      amount: Number(invoice.amount),
      product: invoice.product ? {
        ...invoice.product,
        price: Number(invoice.product.price),
        hargaPendaftaran: Number(invoice.product.hargaPendaftaran),
        hargaPerpanjangan: Number(invoice.product.hargaPerpanjangan)
      } : null
    },
    adminWa: settings?.waAdminApiKey || "628000000000",
    invoiceTemplate: settings?.waAdminInvoiceTemplate || "Halo Admin, berikut adalah pembayaran untuk invoice saya.",
    bankInstructions: settings?.bankInstructions || null,
    qrisUrl: settings?.qrisUrl || null,
    paymentMethod: invoice.paymentMethod
  };
}
export async function registerAndCheckout(data: any) {
  try {
    const { name, email, phone, password, productId, paymentMethod } = data;

    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau login.");
    }

    // 2. Get Product Details
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) throw new Error("Produk tidak ditemukan.");

    const invoiceNumber = `INV/${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;


    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Tenant
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
      const tenant = await tx.tenant.create({
        data: {
          name: `RT Baru - ${name}`,
          slug,
          noHpRt: phone, // Save phone to tenant as requested
          status: "PENDING",
        }
      });

      // Create User
      const { hash } = await import("bcryptjs");
      const hashedPassword = await hash(password, 10);
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          plainPassword: password, // Store plain text for WA notifications as requested
          role: "TENANT_ADMIN",
          tenantId: tenant.id
        }
      });

      // Create Subscription
      const sub = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          productId: product.id,
          status: "PENDING"
        }
      });



      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          tenantId: tenant.id,
          productId: product.id,
          amount: product.hargaPendaftaran,
          status: "PENDING",
          orderType: "NEW",
          paymentMethod
        }
      });

      return invoice;
    });

    // Send WhatsApp Notification to the new customer
    try {
      const settings = await prisma.siteSettings.findFirst();
      if (settings?.waAdminApiKey) {
        let welcomeMessage = settings.waAdminWelcomeTemplate || "Halo {{NAMA}},\n\nTerima kasih telah mendaftar di Tata Warga! Pendaftaran akun Anda untuk paket *{{PRODUK}}* telah kami terima.\n\nNomor Invoice: *{{INVOICE}}*\nTotal Tagihan: *Rp {{HARGA}}*\n\nSilakan transfer ke salah satu rekening berikut:\n{{BANK}}\n\nMohon segera selesaikan pembayaran agar akun Anda dapat diaktifkan. Terima kasih!";
        let bankStr = "- BCA 1234 567 890 a.n PT Tata Warga Digital"; // fallback
        if (settings.bankInstructions) {
          try {
            const parsedBanks = typeof settings.bankInstructions === 'string' 
              ? JSON.parse(settings.bankInstructions) 
              : settings.bankInstructions;
            if (Array.isArray(parsedBanks) && parsedBanks.length > 0) {
              bankStr = parsedBanks.map((b: any) => `- ${b.bank}: ${b.account} (a.n ${b.name})`).join('\n');
            }
          } catch(e) {}
        }
        
        welcomeMessage = welcomeMessage.replace(/{{nama}}/gi, name);
        welcomeMessage = welcomeMessage.replace(/{{produk}}/gi, product.name);
        welcomeMessage = welcomeMessage.replace(/{{paket}}/gi, product.name);
        welcomeMessage = welcomeMessage.replace(/{{invoice}}/gi, invoiceNumber);
        welcomeMessage = welcomeMessage.replace(/{{harga}}/gi, new Intl.NumberFormat("id-ID").format(Number(product.hargaPendaftaran)));
        welcomeMessage = welcomeMessage.replace(/{{bank}}/gi, bankStr);
        welcomeMessage = welcomeMessage.replace(/{{tanggal}}/gi, new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }));
        welcomeMessage = welcomeMessage.replace(/{{email}}/gi, email);
        welcomeMessage = welcomeMessage.replace(/{{password}}/gi, password);
        welcomeMessage = welcomeMessage.replace(/{{bot_wa}}/gi, "-");
        welcomeMessage = welcomeMessage.replace(/{{link_login}}/gi, "https://tatawarga.biz.id/login");
        welcomeMessage = welcomeMessage.replace(/{{link_grup}}/gi, "-");
        // Asynchronously send the message (don't block the return)
        sendMessage(
          settings.waAdminApiKey, 
          phone, 
          welcomeMessage, 
          settings.waAdminProvider || "FONNTE"
        ).catch(e => console.error("Error sending WA notification:", e));
      }
    } catch (waError) {
      console.error("Error fetching settings for WA:", waError);
    }

    return { success: true, invoiceId: result.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

