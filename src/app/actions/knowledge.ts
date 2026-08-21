"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import crypto from "crypto";

// 500 words per chunk roughly
function chunkText(text: string, chunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - 200; // overlap 200 chars
  }
  return chunks;
}

export async function uploadKnowledgeDocument(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("File tidak ditemukan");

    const settings = await prisma.siteSettings.findFirst();
    if (!settings?.qdrantUrl || !settings?.qdrantApiKey || !settings?.openaiApiKey) {
      throw new Error("Konfigurasi Qdrant / OpenAI belum lengkap.");
    }

    // Buat record di DB (Status PROCESSING)
    const doc = await prisma.knowledgeDocument.create({
      data: {
        filename: file.name,
        status: "PROCESSING"
      }
    });

    const openai = new OpenAI({ apiKey: settings.openaiApiKey });
    const qdrant = new QdrantClient({ url: settings.qdrantUrl, apiKey: settings.qdrantApiKey });

    // Pastikan collection ada
    try {
      await qdrant.getCollection("tata_warga_knowledge");
    } catch {
      await qdrant.createCollection("tata_warga_knowledge", {
        vectors: { size: 1536, distance: "Cosine" }
      });
    }

    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    let extractedText = "";

    if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
      try {
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");
        const data = await pdfParse(nodeBuffer);
        extractedText = data.text;
      } catch (parseError: any) {
        await prisma.knowledgeDocument.update({ where: { id: doc.id }, data: { status: "FAILED", error: "Gagal memproses file PDF: " + parseError.message } });
        throw new Error("Gagal memproses file PDF.");
      }
    } else if (file.name.endsWith(".txt")) {
      extractedText = nodeBuffer.toString("utf-8");
    } else {
      await prisma.knowledgeDocument.update({ where: { id: doc.id }, data: { status: "FAILED", error: "Format tidak didukung" } });
      throw new Error("Format tidak didukung");
    }

    if (!extractedText || extractedText.trim() === "") {
      await prisma.knowledgeDocument.update({ where: { id: doc.id }, data: { status: "FAILED", error: "Tidak ada teks yang dapat diekstrak" } });
      throw new Error("Tidak ada teks yang dapat diekstrak");
    }

    const chunks = chunkText(extractedText);
    const validChunks = chunks.filter(c => c.trim().length >= 50);
    const points = [];

    // Batch process to avoid timeout (OpenAI supports up to 2048 chunks per request)
    const BATCH_SIZE = 100;
    for (let i = 0; i < validChunks.length; i += BATCH_SIZE) {
      const batchChunks = validChunks.slice(i, i + BATCH_SIZE);
      
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batchChunks,
        encoding_format: "float",
      });

      for (let j = 0; j < batchChunks.length; j++) {
        points.push({
          id: crypto.randomUUID(),
          vector: embeddingRes.data[j].embedding,
          payload: {
            docId: doc.id,
            filename: file.name,
            text: batchChunks[j],
          }
        });
      }
    }

    // Upsert to Qdrant in batches
    const QDRANT_BATCH = 500;
    for (let i = 0; i < points.length; i += QDRANT_BATCH) {
      const batchPoints = points.slice(i, i + QDRANT_BATCH);
      if (batchPoints.length > 0) {
        await qdrant.upsert("tata_warga_knowledge", { wait: true, points: batchPoints });
      }
    }

    const updatedDoc = await prisma.knowledgeDocument.update({
      where: { id: doc.id },
      data: { status: "READY" }
    });

    return { success: true, doc: updatedDoc };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteKnowledgeDocument(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const settings = await prisma.siteSettings.findFirst();
    if (!settings?.qdrantUrl || !settings?.qdrantApiKey) throw new Error("Qdrant belum dikonfigurasi.");

    const qdrant = new QdrantClient({ url: settings.qdrantUrl, apiKey: settings.qdrantApiKey });
    
    try {
      await qdrant.delete("tata_warga_knowledge", {
        filter: {
          must: [{ key: "docId", match: { value: id } }]
        }
      });
    } catch (qdrantError) {
      console.error("Qdrant delete ignored (maybe collection/points do not exist):", qdrantError);
    }

    await prisma.knowledgeDocument.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
