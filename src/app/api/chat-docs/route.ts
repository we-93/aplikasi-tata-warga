import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400, headers: corsHeaders });
    }

    const settings = await prisma.siteSettings.findFirst();
    if (!settings || !settings.docApiKey) {
      return NextResponse.json({ error: 'Konfigurasi AI Doc belum diatur.' }, { status: 500, headers: corsHeaders });
    }

    const systemContext = `Anda adalah "Tata AI", asisten dokumentasi resmi untuk aplikasi Tata Warga (tatawarga.net). 
Jawab pertanyaan seputar penggunaan aplikasi Tata Warga secara ringkas, solutif, ramah, dan profesional.
Jika ada pengguna yang bertanya di luar sistem aplikasi Tata Warga, tolak dengan sopan dengan mengatakan Anda tidak tahu atau Anda hanya difokuskan untuk menjawab pertanyaan seputar Tata Warga.`;

    const payloadMessages = [
      { role: 'system', content: systemContext },
      ...messages.map((m: any) => ({ role: m.role || 'user', content: m.content || '' }))
    ];

    const docApiUrl = (settings.docApiUrl || 'https://weizerouter.web.id/v1').replace(/\/$/, '');
    const docApiModel = settings.docApiModel || 'wz/gemini-3.5-flash-low';

    console.log(`[Chat Docs] Sending request to ${docApiUrl}/chat/completions using model ${docApiModel}`);

    const response = await fetch(`${docApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.docApiKey}`
      },
      body: JSON.stringify({
        model: docApiModel,
        messages: payloadMessages,
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[Chat Docs] Upstream API Error:", data);
      throw new Error(data.error?.message || data.message || 'Gagal menghubungi Chat API');
    }

    return NextResponse.json({ 
      success: true, 
      message: data.choices[0].message.content 
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('[Chat Docs] Route Error:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
