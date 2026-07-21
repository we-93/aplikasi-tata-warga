"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Internal helper to get Tenant context and API keys
export async function getAiConfigAndContext(passedTenantId?: string) {
  let tenantId = passedTenantId;

  if (!tenantId) {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true, role: true }
    });

    if (!user || !user.tenantId) throw new Error("User tidak memiliki akses Tenant RT.");
    tenantId = user.tenantId;
  }

  // Get global API Key from SiteSettings
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    throw new Error("Konfigurasi global belum diatur.");
  }
  
  if (!settings.openaiApiKey && !settings.geminiApiKey) {
    throw new Error("API Key (OpenAI / Gemini) belum dikonfigurasi. Hubungi Admin Pusat.");
  }

  // Build Context Summary
  const tenantInfo = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const wargaCount = await prisma.warga.count({ where: { tenantId } });
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const kasSummary = await prisma.kasTransaction.groupBy({
    by: ['type'],
    where: { tenantId },
    _sum: { amount: true }
  });

  const kasMonthly = await prisma.kasTransaction.groupBy({
    by: ['type'],
    where: { tenantId, date: { gte: startOfMonth } },
    _sum: { amount: true }
  });

  // Calculate AI Usage and Limits
  const currentProduct = await prisma.product.findFirst({ where: { name: tenantInfo?.subscriptionPlan } });
  const baseAi = currentProduct?.maxAiToken === -1 ? 9999999 : (currentProduct?.maxAiToken || 0);
  const totalLimit = baseAi + (tenantInfo?.addonMaxAiToken || 0);

  const notulens = await prisma.notulenAi.findMany({ where: { tenantId, createdAt: { gte: startOfMonth } } });
  const aiChatLogs = await prisma.activityLog.findMany({ 
    where: { 
      tenantId, 
      action: { in: ["AI_CHAT_USAGE", "AI_BROADCAST_USAGE", "AI_REPORT_USAGE", "AI_OCR_USAGE", "AI_AUDIO_USAGE", "AI_DRAFT_USAGE"] }, 
      createdAt: { gte: startOfMonth } 
    } 
  });
  const aiChatUsed = aiChatLogs.reduce((acc, curr) => acc + (parseInt(curr.description || "0") || 0), 0);
  const aiUsed = notulens.reduce((acc, curr) => acc + curr.tokenUsed, 0) + aiChatUsed;

  if (totalLimit !== 9999999 && aiUsed >= totalLimit) {
    throw new Error("Kuota Token AI Anda telah habis. Silakan Upgrade Paket atau Topup Kuota untuk melanjutkan.");
  }

  let saldo = 0;
  kasSummary.forEach((t: any) => {
    if (t.type === 'PEMASUKAN') saldo += Number(t._sum.amount || 0);
    if (t.type === 'PENGELUARAN') saldo -= Number(t._sum.amount || 0);
  });

  let pemBulanIni = 0;
  let pengBulanIni = 0;
  kasMonthly.forEach((t: any) => {
    if (t.type === 'PEMASUKAN') pemBulanIni = Number(t._sum.amount || 0);
    if (t.type === 'PENGELUARAN') pengBulanIni = Number(t._sum.amount || 0);
  });

  const systemContext = `Anda adalah Asisten Virtual cerdas untuk pengurus dan warga RT. Jawab pertanyaan dengan sopan, ramah, dan profesional.
PENTING: Anda dilarang memberikan jawaban berupa gambar (image URL) atau audio. Semua output Anda HARUS berupa teks.

Informasi Profil RT Saat Ini:
- Nama Lingkungan: ${tenantInfo?.name || "Belum diatur"}
- Alamat Sekretariat: ${tenantInfo?.address || "Belum diatur"}
- Nama Ketua RT: ${tenantInfo?.ketuaName || "Belum diatur"}
- Nomor HP RT: ${tenantInfo?.noHpRt || "Belum diatur"}

Gunakan statistik ringkasan RT berikut jika ditanya:
- Jumlah Data Warga (KK) yang terinput di sistem: ${wargaCount}
- Total Saldo Kas RT Saat Ini: Rp ${saldo.toLocaleString('id-ID')}
- Pemasukan Kas Bulan Ini: Rp ${pemBulanIni.toLocaleString('id-ID')}
- Pengeluaran Kas Bulan Ini: Rp ${pengBulanIni.toLocaleString('id-ID')}

${settings.aiMasterPrompt || ""}`;

  return { 
    openaiApiKey: settings.openaiApiKey, 
    geminiApiKey: settings.geminiApiKey,
    systemContext, 
    tenantId 
  };
}

export async function chatWithAi(messages: any[]) {
  try {
    const { openaiApiKey, geminiApiKey, systemContext, tenantId } = await getAiConfigAndContext();

    if (geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;
      
      const contents = [];
      contents.push({ role: "user", parts: [{ text: systemContext }] });
      contents.push({ role: "model", parts: [{ text: "Baik, saya mengerti konteksnya." }] });
      
      for (const m of messages) {
        if (m.role === "system") continue;
        
        let parts = [];
        if (typeof m.content === 'string') {
          parts.push({ text: m.content });
        } else if (Array.isArray(m.content)) {
          for (const c of m.content) {
            if (c.type === 'text') parts.push({ text: c.text });
            else if (c.type === 'image_url') {
              const base64Data = c.image_url.url.split(',')[1];
              const mimeType = c.image_url.url.split(';')[0].split(':')[1];
              parts.push({ inlineData: { mimeType, data: base64Data } });
            }
          }
        }
        contents.push({ role: m.role === "user" ? "user" : "model", parts });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal menghubungi Gemini API");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const tokens = data.usageMetadata?.totalTokenCount || Math.ceil(text.length / 4) + 100;
      
      if (tenantId) {
        await prisma.activityLog.create({
          data: {
            tenantId,
            action: "AI_CHAT_USAGE",
            description: tokens.toString()
          }
        });
      }

      return { success: true, message: { role: "assistant", content: text } };
    } else if (openaiApiKey) {
      const payloadMessages = [
        { role: "system", content: systemContext },
        ...messages
      ];
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + openaiApiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: payloadMessages,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal menghubungi OpenAI API");
      const tokens = data.usage?.total_tokens || 100;
      
      if (tenantId) {
        await prisma.activityLog.create({
          data: {
            tenantId,
            action: "AI_CHAT_USAGE",
            description: tokens.toString()
          }
        });
      }

      return { success: true, message: data.choices[0].message };
    } else {
      throw new Error("API Key belum dikonfigurasi");
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function transcribeAudio(formData: FormData) {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("Tidak ada file audio yang diunggah.");

    // Enforce quota check by using getAiConfigAndContext
    const { tenantId } = await getAiConfigAndContext();

    const settings = await prisma.siteSettings.findFirst();
    if (!settings) throw new Error("Pengaturan tidak ditemukan.");
    if (!settings.openaiApiKey && !settings.geminiApiKey) {
      throw new Error("API Key belum dikonfigurasi.");
    }

    if (settings.geminiApiKey) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + settings.geminiApiKey;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Tolong transkripsikan (ubah menjadi teks) seluruh isi audio ini secara akurat dan lengkap." },
              {
                inlineData: {
                  mimeType: file.type || "audio/mp3",
                  data: base64
                }
              }
            ]
          }
        ]
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal mentranskripsi audio dengan Gemini");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { success: true, text };
    } else if (settings.openaiApiKey) {
      const whisperFormData = new FormData();
      whisperFormData.append("file", file);
      whisperFormData.append("model", "whisper-1");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + settings.openaiApiKey
        },
        body: whisperFormData as any
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal mentranskripsi audio");

      const tokens = 500; // estimated for whisper
      if (tenantId) await prisma.activityLog.create({ data: { tenantId, action: "AI_AUDIO_USAGE", description: tokens.toString() } });
      return { success: true, text: data.text };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function transcribeImage(formData: FormData) {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("Tidak ada file gambar yang diunggah.");

    // Enforce quota check by using getAiConfigAndContext
    const { tenantId } = await getAiConfigAndContext();

    const settings = await prisma.siteSettings.findFirst();
    if (!settings) throw new Error("Pengaturan tidak ditemukan.");
    if (!settings.openaiApiKey && !settings.geminiApiKey) {
      throw new Error("API Key belum dikonfigurasi.");
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    if (settings.geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + settings.geminiApiKey;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Anda adalah alat OCR super cermat. Tugas Anda HANYA MENGEKSTRAK seluruh teks yang ada di dalam gambar dengan akurat, baris per baris. JANGAN berikan komentar, penjelasan, atau pembuka/penutup. HANYA berikan teks asli dari gambar." },
              { inlineData: { mimeType, data: base64 } }
            ]
          }
        ]
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal membaca teks dari gambar dengan Gemini");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { success: true, text };
    } else if (settings.openaiApiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + settings.openaiApiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Anda adalah alat OCR super cermat. Tugas Anda HANYA MENGEKSTRAK seluruh teks yang ada di dalam gambar dengan akurat, baris per baris. JANGAN berikan komentar, penjelasan, atau pembuka/penutup. HANYA berikan teks asli dari gambar."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Ekstrak teks dari gambar ini:" },
                { type: "image_url", image_url: { url: "data:" + mimeType + ";base64," + base64 } }
              ]
            }
          ],
          max_tokens: 1500
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Gagal membaca teks dari gambar");

      const tokens = result.usage?.total_tokens || 250;
      if (tenantId) await prisma.activityLog.create({ data: { tenantId, action: "AI_OCR_USAGE", description: tokens.toString() } });
      return { success: true, text: result.choices[0].message.content };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateAiBroadcast(data: {
  topic: string;
  tone: string;
  kegiatan: string;
  waktu: string;
  lokasi: string;
}) {
  try {
    const { openaiApiKey, geminiApiKey, systemContext, tenantId } = await getAiConfigAndContext();

    const prompt = "Tolong buatkan draf pesan pengumuman WhatsApp untuk warga RT.\n" +
"Detail:\n" +
"- Topik / Pesan Utama: " + data.topic + "\n" +
"- Nama Kegiatan: " + (data.kegiatan || "Tidak ditentukan") + "\n" +
"- Waktu Kegiatan: " + (data.waktu || "Tidak ditentukan") + "\n" +
"- Lokasi: " + (data.lokasi || "Tidak ditentukan") + "\n" +
"- Gaya Bahasa: " + data.tone + "\n\n" +
"Buat formatnya menarik, gunakan emoji yang relevan, dan pastikan jelas dibaca di WhatsApp. Jangan tambahkan penjelasan apa-apa, cukup langsung berikan teks pengumumannya saja.";

    if (geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: systemContext }] },
          { role: "model", parts: [{ text: "Mengerti." }] },
          { role: "user", parts: [{ text: prompt }] }
        ]
      };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Gagal memproses broadcast dengan Gemini");
      const tokens = result.usageMetadata?.totalTokenCount || 100;
      if (tenantId) await prisma.activityLog.create({ data: { tenantId, action: "AI_BROADCAST_USAGE", description: tokens.toString() } });
      return { success: true, text: result.candidates?.[0]?.content?.parts?.[0]?.text || "" };
    } else if (openaiApiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + openaiApiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: prompt }
          ],
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Gagal memproses broadcast");
      const tokens = result.usage?.total_tokens || 100;
      if (tenantId) await prisma.activityLog.create({ data: { tenantId, action: "AI_BROADCAST_USAGE", description: tokens.toString() } });
      return { success: true, text: result.choices[0].message.content };
    } else {
      throw new Error("API Key belum dikonfigurasi");
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateAiReport(month: number, year: number) {
  try {
    const { openaiApiKey, geminiApiKey, systemContext, tenantId } = await getAiConfigAndContext();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const kasData = await prisma.kasTransaction.findMany({
      where: { tenantId, date: { gte: startDate, lt: endDate } },
      orderBy: { date: 'asc' }
    });

    let kasText = "Data Transaksi Kas Bulan " + month + "/" + year + ":\n";
    if (kasData.length === 0) kasText += "Tidak ada transaksi bulan ini.";
    kasData.forEach(k => {
      kasText += "- [" + k.date.toISOString().split('T')[0] + "] " + k.type + ": Rp" + Number(k.amount).toLocaleString('id-ID') + " (" + k.description + ")\n";
    });

    const prompt = "Buat narasi laporan bulanan RT yang ramah dan transparan untuk warga, berdasarkan data kas berikut.\n" +
kasText + "\n\n" +
"Berikan pembuka yang hangat, rangkum total pemasukan dan pengeluaran secara jelas, lalu berikan kalimat penutup yang membangun semangat gotong royong warga. Jangan tambahkan penjelasan lain di luar surat laporan.";

    if (geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: systemContext }] },
          { role: "model", parts: [{ text: "Mengerti." }] },
          { role: "user", parts: [{ text: prompt }] }
        ]
      };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Gagal membuat laporan dengan Gemini");
      const tokens = result.usageMetadata?.totalTokenCount || 200;
      if (tenantId) await prisma.activityLog.create({ data: { tenantId, action: "AI_REPORT_USAGE", description: tokens.toString() } });
      return { success: true, text: result.candidates?.[0]?.content?.parts?.[0]?.text || "" };
    } else if (openaiApiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + openaiApiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: prompt }
          ],
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Gagal membuat laporan dengan OpenAI");
      const tokens = result.usage?.total_tokens || 200;
      if (tenantId) await prisma.activityLog.create({ data: { tenantId, action: "AI_REPORT_USAGE", description: tokens.toString() } });
      return { success: true, text: result.choices[0].message.content };
    } else {
      throw new Error("API Key belum dikonfigurasi");
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function chatWithWaAi(tenantId: string, userMessage: string) {
  try {
    const { openaiApiKey, geminiApiKey, systemContext } = await getAiConfigAndContext(tenantId);

    if (geminiApiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: systemContext }] },
          { role: "model", parts: [{ text: "Mengerti, saya akan bertindak sesuai instruksi tersebut." }] },
          { role: "user", parts: [{ text: userMessage }] }
        ]
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal memanggil Gemini API");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak memberikan respons yang valid.";
      return { success: true, text };
    } else if (openaiApiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: userMessage }
          ]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal memanggil OpenAI API");
      
      return { success: true, text: data.choices[0].message.content };
    } else {
      throw new Error("Tidak ada API Key yang dikonfigurasi.");
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
