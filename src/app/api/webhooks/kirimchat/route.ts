import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processMessage } from '@/services/whatsapp/stateMachine';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ status: 'ignored', reason: 'Not JSON' });
    }

    const body = await req.json();

    console.log("=== INCOMING WEBHOOK FROM KIRIM.CHAT ===");
    try {
      require('fs').writeFileSync('kirimchat-webhook-log.txt', JSON.stringify(body, null, 2));
    } catch(e) {}
    console.log("======================================");
    
    if (body.event_type !== 'message.received' || !body.data) {
      return NextResponse.json({ status: 'ignored', reason: 'Not a message.received event' });
    }

    const data = body.data;
    const senderNumber = data.customer_phone; 
    let message = data.content || '';

    // Handle interactive message replies based on Kirim.chat format
    const rawMessage = data.raw?.message;
    if (data.message_type === 'interactive' && rawMessage?.interactive) {
      if (rawMessage.interactive.type === 'list_reply' && rawMessage.interactive.list_reply) {
        message = rawMessage.interactive.list_reply.id || message;
      } else if (rawMessage.interactive.type === 'button_reply' && rawMessage.interactive.button_reply) {
        message = rawMessage.interactive.button_reply.id || message;
      }
    }

    if (!senderNumber) {
       return NextResponse.json({ status: 'ignored', reason: 'No sender number' });
    }

    // Cari user berdasarkan nomor HP (di database, user menggunakan format 628...)
    const user = await prisma.user.findFirst({
      where: { 
        phone: senderNumber 
      }
    });

    if (!user || !user.tenantId) {
      console.log('Webhook ignored: Sender number not registered to any Tenant', senderNumber);
      return NextResponse.json({ status: 'ignored', reason: 'Number not registered in any RT dashboard' });
    }

    // Nomor yang merespon akan menggunakan API Key Global Kirim.chat
    const apiKey = process.env.KIRIMCHAT_API_KEY || '';

    if (!apiKey) {
      console.log('Webhook error: KIRIMCHAT_API_KEY is not set in environment variables');
      return NextResponse.json({ status: 'error', reason: 'Server configuration error' });
    }

    // Kirim langsung ke otak bot (State Machine)
    // groupId di set null karena ini adalah personal chat
    try {
      await processMessage(
        user.tenantId,
        senderNumber,
        null,
        message,
        apiKey
      );
    } catch (err) {
      console.error('Error processing whatsapp state machine:', err);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
