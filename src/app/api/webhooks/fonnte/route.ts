import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processMessage } from '@/services/whatsapp/stateMachine';

export async function POST(req: NextRequest) {
  try {
    // Fonnte sends form-data or JSON, we'll try to parse either
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    console.log("=== INCOMING WEBHOOK FROM FONNTE ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("======================================");

    const senderRaw = body.sender;
    const message = body.message || body.pesan || body.text;
    const isgroup = body.isgroup === true || body.isgroup === 'true' || (senderRaw && senderRaw.endsWith('@g.us'));
    
    let groupId = null;
    let senderNumber = senderRaw;

    if (isgroup) {
      groupId = senderRaw;
      senderNumber = body.member || senderRaw; // the actual person sending it
    }

    // Based on user requirements, only process messages from groups (group_id validation)
    if (!groupId) {
      console.log('Webhook ignored: Not a group message');
      return NextResponse.json({ status: 'ignored', reason: 'Not a group message' });
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

    // Pass it to State Machine
    // We await the processMessage to ensure it runs completely before Next.js kills the request context.
    try {
      await processMessage(
        tenant.id,
        senderNumber.toString(),
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
