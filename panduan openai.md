1. Daftar model dari yang termurah + konversi Rupiah
Asumsi kurs: 1 USD = Rp16.000
Harga di bawah adalah estimasi per 1 juta token. Harga resmi bisa berubah, jadi tetap cek dashboard/pricing provider.

Urutan	Model	Input USD / 1M token	Output USD / 1M token	Input Rupiah	Output Rupiah	Cocok untuk
1	gpt-4.1-nano	$0.10	$0.40	Rp1.600	Rp6.400	Chat ringan, FAQ, customer support sederhana
2	gpt-4o-mini	$0.15	$0.60	Rp2.400	Rp9.600	Rekomendasi hemat dan stabil untuk chatbot web
3	gpt-4.1-mini	$0.40	$1.60	Rp6.400	Rp25.600	Chat lebih pintar, instruksi lebih kompleks
4	o4-mini / reasoning mini	±$1.10	±$4.40	±Rp17.600	±Rp70.400	Tugas yang butuh penalaran lebih kuat
5	gpt-4.1	$2.00	$8.00	Rp32.000	Rp128.000	Kualitas tinggi, analisis, coding, dokumen
6	gpt-4o	±$2.50	±$10.00	±Rp40.000	±Rp160.000	Chat cerdas, multimodal, kualitas tinggi
7	gpt-4-turbo / legacy	±$10.00	±$30.00	±Rp160.000	±Rp480.000	Model lama, biasanya tidak paling hemat
Rekomendasi saya
Untuk chatbot di website, mulai dari:

gpt-4o-mini
Jika ingin lebih murah dan tersedia di akun Anda:

gpt-4.1-nano
Jika butuh jawaban lebih pintar:

gpt-4.1-mini
2. Contoh estimasi biaya
Misalnya per bulan:

10.000 chat
Rata-rata input: 1.000 token/chat
Rata-rata output: 500 token/chat
Total:

Input  = 10.000 x 1.000 = 10.000.000 token
Output = 10.000 x 500   = 5.000.000 token
Jika memakai gpt-4o-mini:

Input  = 10 x $0.15 = $1.50
Output = 5 x $0.60  = $3.00
Total  = $4.50
Konversi rupiah:

$4.50 x Rp16.000 = Rp72.000 / bulan
Jadi untuk 10.000 chat ringan per bulan, estimasinya sekitar:

± Rp72.000 / bulan
3. Pasang API key di Next.js
Install package OpenAI:

npm install openai
Buat file:

.env.local
Isi:

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
Penting: Jangan pernah menaruh API key di frontend seperti React component langsung. API key harus dipakai di server/API route.

4. Buat API route chat di Next.js
Jika Anda menggunakan App Router, buat file:

app/api/chat/route.ts
Isi:

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI yang membantu pengunjung website dengan jawaban yang jelas, sopan, dan ringkas.",
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return Response.json({
      reply: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Terjadi kesalahan saat memproses chat.",
      },
      { status: 500 }
    );
  }
}
5. Buat komponen chat di frontend
Contoh sederhana:

"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div
        style={{
          border: "1px solid #ddd",
          padding: 16,
          minHeight: 300,
          marginBottom: 16,
          borderRadius: 8,
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 12 }}>
            <strong>{msg.role === "user" ? "Anda" : "AI"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}

        {loading && <p>AI sedang mengetik...</p>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          style={{
            flex: 1,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
Lalu pakai di halaman Anda, misalnya:

import ChatBox from "@/components/ChatBox";

export default function Page() {
  return (
    <main>
      <h1>Chat AI</h1>
      <ChatBox />
    </main>
  );
}
6. Saat deploy ke Vercel
Jika pakai Vercel:

Buka project di Vercel
Masuk ke Settings
Pilih Environment Variables
Tambahkan:
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
5. Redeploy project Anda

7. Tips agar biaya tidak membengkak
Gunakan ini di backend:

max_tokens: 800
Atau lebih kecil:

max_tokens: 300
Tips lain:

Batasi panjang pesan user.
Tambahkan rate limit per IP/user.
Jangan kirim seluruh riwayat chat terlalu panjang.
Simpan ringkasan percakapan jika chat panjang.
Mulai dari gpt-4o-mini atau gpt-4.1-nano.
Rekomendasi akhir
Untuk website Next.js Anda, konfigurasi awal yang paling aman dan hemat:

OPENAI_MODEL=gpt-4o-mini
Estimasi harga:

Input  : Rp2.400 / 1 juta token
Output : Rp9.600 / 1 juta token
Kalau ingin paling murah dan tersedia di akun Anda:

OPENAI_MODEL=gpt-4.1-nano
Estimasi harga:

Input  : Rp1.600 / 1 juta token
Output : Rp6.400 / 1 juta token