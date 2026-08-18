"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

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
    openaiApiModel: settings.openaiApiModel || "gpt-4o-mini",
    qdrantUrl: settings.qdrantUrl,
    qdrantApiKey: settings.qdrantApiKey,
    geminiApiKey: settings.geminiApiKey,
    chatApiUrl: settings.chatApiUrl || "https://weizerouter.web.id/v1",
    chatApiKey: settings.chatApiKey,
    chatApiModel: settings.chatApiModel || "wz/gemini-3.5-flash-low",
    systemContext, 
    tenantId,
    tenantInfo
  };
}

export async function chatWithAi(messages: any[]) {
  try {
    const { openaiApiKey, openaiApiModel, qdrantUrl, qdrantApiKey, systemContext, tenantId, tenantInfo } = await getAiConfigAndContext();

    if (!openaiApiKey) throw new Error("API Key OpenAI belum dikonfigurasi.");
    if (tenantInfo && tenantInfo.aiChatCredits <= 0) {
      throw new Error("Kredit Chat AI Anda habis. Silakan Top Up kredit Anda.");
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    let finalSystemContext = systemContext;

    // RAG Implementation: Search Qdrant if user asks something and Qdrant is configured
    if (qdrantUrl && qdrantApiKey) {
      const qdrant = new QdrantClient({ url: qdrantUrl, apiKey: qdrantApiKey });
      
      // Get the last user message to use as search query
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "user" && typeof lastMessage.content === "string") {
        try {
          // Get embedding for the query
          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: lastMessage.content,
            encoding_format: "float",
          });
          const queryVector = embeddingResponse.data[0].embedding;

          // Search Qdrant
          const searchResult = await (qdrant as any).search("tata_warga_knowledge", {
            vector: queryVector,
            limit: 3,
            with_payload: true,
            score_threshold: 0.5, // Only relevant matches
          });

          if (searchResult && searchResult.length > 0) {
            const contextTexts = searchResult.map((res: any) => res.payload?.text).join("\n\n");
            finalSystemContext += `\n\nREFERENSI PENGETAHUAN TAMBAHAN (Perda/Perbup/Dokumen):\nBerdasarkan pertanyaan pengguna, berikut adalah referensi dokumen resmi yang mungkin relevan:\n"""\n${contextTexts}\n"""\n\nGunakan referensi di atas untuk menjawab pertanyaan pengguna jika relevan. Jika tidak relevan, abaikan referensi tersebut.`;
          }
        } catch (ragError) {
          console.error("RAG Search failed:", ragError);
          // Fallback gracefully if Qdrant search fails
        }
      }
    }

    const payloadMessages = [
      { role: "system", content: finalSystemContext },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: openaiApiModel || "gpt-4o-mini",
      messages: payloadMessages,
    });
    
    const tokens = response.usage?.total_tokens || 0;

    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { aiChatCredits: { decrement: 1 } }
      });
      await prisma.activityLog.create({
        data: {
          tenantId,
          action: "AI_CHAT_USAGE",
          description: `${tokens} Tokens (Menggunakan 1 Kredit Chat)`
        }
      });
    }

    return { success: true, message: response.choices[0].message };
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

    const { tenantId, geminiApiKey, openaiApiKey, tenantInfo } = await getAiConfigAndContext();

    if (!openaiApiKey && !geminiApiKey) {
      throw new Error("API Key Notulen (OpenAI/Gemini) belum dikonfigurasi.");
    }
    
    if (tenantInfo && tenantInfo.aiDocCredits <= 0) {
      throw new Error("Kredit Doc/Notulen AI Anda habis. Silakan Top Up kredit Anda.");
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    let text = "";
    let tokens = 0;

    if (geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;
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
      
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      tokens = data.usageMetadata?.totalTokenCount || 0;
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
      text = result.choices[0].message.content;
      tokens = result.usage?.total_tokens || 0;
    }

    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { aiDocCredits: { decrement: 1 } }
      });
      await prisma.activityLog.create({ 
        data: { tenantId, action: "AI_OCR_USAGE", description: `${tokens} Tokens (Menggunakan 1 Kredit Notulen/Doc)` } 
      });
    }

    return { success: true, text };
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
    const { chatApiUrl, chatApiKey, chatApiModel, openaiApiKey, openaiApiModel, geminiApiKey, systemContext, tenantId, tenantInfo } = await getAiConfigAndContext();

    if (!chatApiKey && !openaiApiKey && !geminiApiKey) {
      throw new Error("API Key AI belum dikonfigurasi. Silakan atur di Pengaturan Integrasi.");
    }
    if (tenantInfo && tenantInfo.aiDocCredits <= 0) {
      throw new Error("Kredit Doc/Notulen AI Anda habis. Silakan Top Up kredit Anda.");
    }

    const prompt = "Tolong buatkan draf pesan pengumuman WhatsApp untuk warga RT.\n" +
"Detail:\n" +
"- Topik / Pesan Utama: " + data.topic + "\n" +
"- Nama Kegiatan: " + (data.kegiatan || "Tidak ditentukan") + "\n" +
"- Waktu Kegiatan: " + (data.waktu || "Tidak ditentukan") + "\n" +
"- Lokasi: " + (data.lokasi || "Tidak ditentukan") + "\n" +
"- Gaya Bahasa: " + data.tone + "\n\n" +
"Buat formatnya menarik, gunakan emoji yang relevan, dan pastikan jelas dibaca di WhatsApp. Jangan tambahkan penjelasan apa-apa, cukup langsung berikan teks pengumumannya saja.";

    let resultText = "";
    let tokens = 0;

    if (chatApiKey && chatApiUrl) {
      const response = await fetch(`${chatApiUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + chatApiKey },
        body: JSON.stringify({
          model: chatApiModel || "wz/gemini-3.5-flash-low",
          messages: [{ role: "system", content: systemContext }, { role: "user", content: prompt }]
        })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error?.message || "Gagal memproses broadcast");
      resultText = resData.choices[0].message.content;
      tokens = resData.usage?.total_tokens || 0;
    } else if (openaiApiKey) {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await openai.chat.completions.create({
        model: openaiApiModel || "gpt-4o-mini",
        messages: [{ role: "system", content: systemContext }, { role: "user", content: prompt }]
      });
      resultText = response.choices[0].message.content || "";
      tokens = response.usage?.total_tokens || 0;
    } else if (geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContext }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error?.message || "Gagal memproses broadcast dengan Gemini");
      resultText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      tokens = resData.usageMetadata?.totalTokenCount || 0;
    }

    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { aiDocCredits: { decrement: 1 } }
      });
      await prisma.activityLog.create({ 
        data: { tenantId, action: "AI_BROADCAST_USAGE", description: `${tokens} Tokens (Menggunakan 1 Kredit Notulen/Doc)` } 
      });
    }
    
    return { success: true, text: resultText };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateAiReport(month: number, year: number) {
  try {
    const { chatApiUrl, chatApiKey, chatApiModel, openaiApiKey, openaiApiModel, geminiApiKey, systemContext, tenantId, tenantInfo } = await getAiConfigAndContext();

    if (!chatApiKey && !openaiApiKey && !geminiApiKey) {
      throw new Error("API Key AI belum dikonfigurasi. Silakan atur di Pengaturan Integrasi.");
    }
    if (tenantInfo && tenantInfo.aiDocCredits <= 0) {
      throw new Error("Kredit Doc/Notulen AI Anda habis. Silakan Top Up kredit Anda.");
    }

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

    let resultText = "";
    let tokens = 0;

    if (chatApiKey && chatApiUrl) {
      const response = await fetch(`${chatApiUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + chatApiKey },
        body: JSON.stringify({
          model: chatApiModel || "wz/gemini-3.5-flash-low",
          messages: [{ role: "system", content: systemContext }, { role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal membuat laporan AI");
      resultText = data.choices[0].message.content;
      tokens = data.usage?.total_tokens || 0;
    } else if (openaiApiKey) {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await openai.chat.completions.create({
        model: openaiApiModel || "gpt-4o-mini",
        messages: [{ role: "system", content: systemContext }, { role: "user", content: prompt }]
      });
      resultText = response.choices[0].message.content || "";
      tokens = response.usage?.total_tokens || 0;
    } else if (geminiApiKey) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContext }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gagal membuat laporan dengan Gemini");
      resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      tokens = data.usageMetadata?.totalTokenCount || 0;
    }

    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { aiDocCredits: { decrement: 1 } }
      });
      await prisma.activityLog.create({ 
        data: { tenantId, action: "AI_REPORT_USAGE", description: `${tokens} Tokens (Menggunakan 1 Kredit Notulen/Doc)` } 
      });
    }
    
    return { success: true, text: resultText };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
