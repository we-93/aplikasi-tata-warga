"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeLog } from "./logs";

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------
async function getAiConfig() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  });
  if (!user?.tenantId) throw new Error("Akses ditolak.");

  const settings = await prisma.siteSettings.findFirst();
  if (!settings?.openaiApiKey && !settings?.geminiApiKey) throw new Error("API Key AI belum dikonfigurasi. Hubungi Admin.");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: {
      id: true, name: true, rt: true, rw: true
    }
  });

  if (!tenant) throw new Error("Tenant tidak ditemukan.");

  return { 
    openaiApiKey: settings?.openaiApiKey, 
    geminiApiKey: settings?.geminiApiKey, 
    chatApiUrl: settings?.chatApiUrl || "https://weizerouter.web.id/v1",
    chatApiKey: settings?.chatApiKey,
    chatApiModel: settings?.chatApiModel || "wz/gemini-3.5-flash-low",
    tenant, 
    tenantId: user.tenantId 
  };
}

// ---------------------------------------------------------------------------
// ACTION: Generate Notulen from text/transcript
// ---------------------------------------------------------------------------
export async function generateNotulen(data: {
  judulRapat: string;
  tanggalRapat: string;
  rawInput: string; // transkripsi audio atau catatan manual
}) {
  try {
    const { chatApiUrl, chatApiKey, chatApiModel, tenant, tenantId } = await getAiConfig();

    if (!chatApiKey) {
      throw new Error("API Key Chat belum dikonfigurasi.");
    }

    const systemPrompt = `Anda adalah Sekretaris RT profesional dan cermat. Tugas Anda adalah menganalisis transkripsi atau catatan rapat RT yang diberikan, lalu menyusunnya menjadi Notulen Rapat resmi yang terstruktur dalam format JSON yang valid.

Output HARUS berupa JSON murni (tanpa markdown, tanpa komentar, tanpa penjelasan tambahan), dengan struktur tepat seperti ini:
{
  "peserta": "Daftar nama peserta yang disebutkan dalam teks, pisahkan dengan koma. Jika tidak ada, tulis 'Tidak disebutkan'.",
  "agendaRapat": "Poin-poin agenda atau topik yang dibahas. Gunakan format nomor. Contoh: 1. Pembahasan iuran bulanan\n2. Rencana kerja bakti",
  "hasilRapat": "Keputusan dan kesepakatan yang dicapai dalam rapat. Gunakan format nomor.",
  "tindakLanjut": "Action items / tindak lanjut beserta penanggung jawabnya jika disebutkan. Gunakan format nomor.",
  "fullNotulen": "Notulen lengkap dalam format dokumen resmi yang bisa langsung dicetak. Gunakan gaya bahasa formal-resmi. Sertakan judul rapat, tanggal, peserta, hasil, dan penutup. Format dengan rapi menggunakan baris baru."
}`;

    const userPrompt = `Judul Rapat: ${data.judulRapat}
Tanggal Rapat: ${data.tanggalRapat}
RT: ${tenant.rt || "-"} / RW: ${tenant.rw || "-"}, ${tenant.name}

Transkripsi / Catatan Rapat:
---
${data.rawInput}
---

Tolong buat notulen resminya dalam format JSON seperti yang diminta.`;

    let parsed = null;
    let tokenUsed = 0;

    const response = await fetch(`${chatApiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${chatApiKey}`
      },
      body: JSON.stringify({
        model: chatApiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Gagal menghubungi WeizeRouter API");

    tokenUsed = result.usage?.total_tokens || 500;
    const rawText = result.choices[0].message.content || "{}";
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(cleanText);

    let logId = "";
    if (tokenUsed > 0) {
      const log = await prisma.activityLog.create({
        data: {
          tenantId,
          action: "AI_DRAFT_USAGE",
          description: tokenUsed.toString()
        }
      });
      logId = log.id;
    }

    return {
      success: true,
      data: parsed,
      tokenUsed,
      logId,
      rawTranskrip: data.rawInput
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// ACTION: Save Notulen to Database
// ---------------------------------------------------------------------------
export async function saveNotulen(data: {
  judulRapat: string;
  tanggalRapat: string;
  peserta: string;
  agendaRapat: string;
  hasilRapat: string;
  tindakLanjut: string;
  fullNotulen: string;
  rawTranskrip?: string;
  tokenUsed: number;
  logId?: string;
}) {
  try {
    const { tenantId } = await getAiConfig();

    await prisma.notulenAi.create({
      data: {
        tenantId,
        judulRapat: data.judulRapat,
        tanggalRapat: new Date(data.tanggalRapat),
        peserta: data.peserta,
        agendaRapat: data.agendaRapat,
        hasilRapat: data.hasilRapat,
        tindakLanjut: data.tindakLanjut,
        fullNotulen: data.fullNotulen,
        rawTranskrip: data.rawTranskrip,
        tokenUsed: data.tokenUsed
      }
    });

    if (data.logId) {
      await prisma.activityLog.deleteMany({
        where: { id: data.logId, tenantId }
      });
    }

    await writeLog({ tenantId, action: "NOTULEN_CREATED", description: `${data.judulRapat} (${data.tanggalRapat}) — ${data.tokenUsed} token` });
    revalidatePath("/dashboard/rt/notulen");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// ACTION: Get all Notulen for this RT
// ---------------------------------------------------------------------------
export async function getNotulens() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  });
  if (!user?.tenantId) throw new Error("Akses ditolak.");

  const notulens = await prisma.notulenAi.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { tanggalRapat: "desc" }
  });

  return notulens;
}

// ---------------------------------------------------------------------------
// ACTION: Get single Notulen detail
// ---------------------------------------------------------------------------
export async function getNotulenDetail(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  });
  if (!user?.tenantId) throw new Error("Akses ditolak.");

  const notulen = await prisma.notulenAi.findFirst({
    where: { id, tenantId: user.tenantId }
  });

  if (!notulen) throw new Error("Notulen tidak ditemukan.");
  return notulen;
}

// ---------------------------------------------------------------------------
// ACTION: Delete Notulen
// ---------------------------------------------------------------------------
export async function deleteNotulen(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true }
    });
    if (!user?.tenantId) throw new Error("Akses ditolak.");

    await prisma.notulenAi.delete({
      where: { id, tenantId: user.tenantId }
    });

    revalidatePath("/dashboard/rt/notulen");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
