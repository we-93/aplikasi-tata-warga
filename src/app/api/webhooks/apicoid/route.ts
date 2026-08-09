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

    console.log("=== INCOMING WEBHOOK FROM APICOID ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("======================================");
    
    if (!body || !body.data) {
      return NextResponse.json({ status: 'ignored', reason: 'No data payload' });
    }

    const data = body.data;
    const isgroup = data.isGroup === true || data.from?.endsWith('@g.us');
    
    if (!isgroup) {
      console.log('Webhook ignored: Not a group message');
      return NextResponse.json({ status: 'ignored', reason: 'Not a group message' });
    }

    const groupId = data.from?.replace('@g.us', '');
    const senderRaw = data.sender || data.participant || data.from; 
    const senderNumber = senderRaw?.replace('@s.whatsapp.net', '')?.split(':')[0];

    // Cek Interaksi Tombol (Interactive Button) lalu jadikan sebagai Teks Biasa agar AI mengerti
    let message = data.message?.text || data.message?.body || '';
    if (data.message?.buttonReply?.id) {
      message = data.message.buttonReply.id;
    } else if (data.message?.listReply?.id) {
      message = data.message.listReply.id;
    } else if (data.message?.interactive?.button_reply?.id) {
      message = data.message.interactive.button_reply.id;
    }

    if (!groupId) {
       return NextResponse.json({ status: 'ignored' });
    }

    const cleanGroupId = groupId.toString().replace('@g.us', '');

    // Find Tenant by whatsappGroupId (support both with and without @g.us)
    const tenant = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { whatsappGroupId: cleanGroupId },
          { whatsappGroupId: `${cleanGroupId}@g.us` }
        ]
      },
      include: { waDevice: true },
    });

    if (!tenant) {
      console.log('Webhook ignored: Unregistered Group ID', groupId);
      return NextResponse.json({ status: 'ignored', reason: 'Unregistered Group ID' });
    }

    if (!tenant.waDevice || !tenant.waDevice.apiKey) {
      console.log('Webhook error: WA Device API Key missing for this tenant');
      return NextResponse.json({ status: 'error', reason: 'WA Device API Key missing for this tenant' });
    }

    // Kirim langsung ke otak bot (State Machine)
    // We await the processMessage to ensure it runs completely before Next.js kills the request context.
    try {
      await processMessage(
        tenant.id,
        senderNumber?.toString() || "",
        groupId.toString(),
        message ? message.toString() : '',
        tenant.waDevice!.apiKey
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
