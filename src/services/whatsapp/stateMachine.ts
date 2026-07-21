import prisma from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';
import { handleWargaState } from './handlers/warga';
import { handleSuratState } from './handlers/surat';
import { handleKasState } from './handlers/kas';
import { handleAiState } from './handlers/ai';

export const processMessage = async (
  tenantId: string,
  senderNumber: string,
  groupId: string | null,
  message: string,
  apiKey: string
) => {
  // Normalize message for command checking
  const text = message.trim();
  const command = text.toUpperCase();

  // Find or create active session
  let session = await prisma.waSession.findFirst({
    where: {
      tenantId,
      senderNumber,
      groupId,
    },
  });

  if (!session) {
    session = await prisma.waSession.create({
      data: {
        tenantId,
        senderNumber,
        groupId,
        state: 'IDLE',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes TTL
      },
    });
  } else {
    // Refresh TTL
    await prisma.waSession.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
  }

  // Handle Global Commands (Can interrupt any state)
  if (command === '#MENU') {
    await prisma.waSession.update({
      where: { id: session.id },
      data: { state: 'IDLE', data: {} },
    });
    
    const reply = `Selamat datang di Tata Warga 👋\n\nSilakan pilih menu:\n#WARGA\n#SURAT\n#KAS RT\n#AKTIFKAN AI`;
    await sendMessage(apiKey, groupId || senderNumber, reply);
    return;
  }

  if (command === '#BATAL') {
    await prisma.waSession.update({
      where: { id: session.id },
      data: { state: 'IDLE', data: {} },
    });
    
    await sendMessage(apiKey, groupId || senderNumber, `Proses dibatalkan. Ketik #MENU untuk melihat menu kembali.`);
    return;
  }

  // Handle Root Menu Choices
  if (session.state === 'IDLE') {
    switch (command) {
      case '#WARGA':
        await prisma.waSession.update({
          where: { id: session.id },
          data: { state: 'MENU_WARGA' },
        });
        await sendMessage(
          apiKey,
          groupId || senderNumber,
          `Menu Data Warga`,
          undefined,
          [
            { id: "1", display_text: "Tambah Warga" },
            { id: "2", display_text: "Cari Warga" },
            { id: "3", display_text: "Edit Warga" },
            { id: "4", display_text: "Hapus Warga" }
          ]
        );
        return;
      case '#SURAT':
        const templates = await prisma.suratTemplate.findMany({
          where: { OR: [{ tenantId: session.tenantId }, { tenantId: null }] },
        });
        
        let menuSurat = `✉️ Menu Surat\nPilih Jenis Surat:`;
        const suratButtons = templates.map((t, index) => ({
          id: (index + 1).toString(),
          display_text: t.name
        }));

        await prisma.waSession.update({
          where: { id: session.id },
          data: { 
            state: 'MENU_SURAT',
            data: { templates: templates.map(t => ({ id: t.id, name: t.name, code: t.code })) }
          },
        });
        
        await sendMessage(
          apiKey,
          groupId || senderNumber,
          menuSurat,
          undefined,
          suratButtons
        );
        return;
      case '#KAS RT':
        await prisma.waSession.update({
          where: { id: session.id },
          data: { state: 'MENU_KAS' },
        });
        await sendMessage(
          apiKey,
          groupId || senderNumber,
          `💰 *Menu Kas RT*\nPilih jenis layanan Kas:`,
          undefined,
          [
            { id: "1", display_text: "Pemasukan" },
            { id: "2", display_text: "Pengeluaran" },
            { id: "3", display_text: "Saldo" },
            { id: "4", display_text: "Laporan Kas" }
          ]
        );
        return;
      case '#AKTIFKAN AI':
        await prisma.waSession.update({
          where: { id: session.id },
          data: { state: 'AI_ACTIVE' },
        });
        await sendMessage(
          apiKey,
          groupId || senderNumber,
          `Sesi AI Aktif! Saya siap menjawab pertanyaan terkait data RT Anda.\nKetik #SELESAI untuk mengakhiri.`
        );
        return;
      default:
        // Ignore unrecognized messages if in IDLE state (could be normal chat in group)
        return;
    }
  }

  // Delegate to specific state handlers based on the current state prefix
  if (session.state.startsWith('MENU_WARGA') || session.state.startsWith('WARGA_')) {
    await handleWargaState(session, text, apiKey, groupId || senderNumber);
  } else if (session.state.startsWith('MENU_SURAT') || session.state.startsWith('SURAT_')) {
    await handleSuratState(session, text, apiKey, groupId || senderNumber);
  } else if (session.state.startsWith('MENU_KAS') || session.state.startsWith('KAS_')) {
    await handleKasState(session, text, apiKey, groupId || senderNumber);
  } else if (session.state === 'AI_ACTIVE') {
    await handleAiState(session, text, apiKey, groupId || senderNumber);
  }
};
