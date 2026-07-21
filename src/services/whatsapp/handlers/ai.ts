import prisma from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';
import { chatWithWaAi } from '@/app/actions/ai';

export const handleAiState = async (
  session: any,
  message: string,
  apiKey: string,
  target: string
) => {
  const text = message.trim();
  const { id, tenantId } = session;

  if (text.toUpperCase() === '#SELESAI') {
    await prisma.waSession.update({
      where: { id },
      data: { state: 'IDLE' },
    });
    await sendMessage(apiKey, target, `Sesi AI diakhiri. Terima kasih! Ketik #MENU untuk melihat menu utama.`);
    return;
  }

  // Send loading message occasionally? Not needed if fast, but let's just wait for AI.
  try {
    const aiResponse = await chatWithWaAi(tenantId, text);
    
    if (aiResponse.success) {
      await sendMessage(apiKey, target, aiResponse.text || "Tidak ada respons.");
    } else {
      await sendMessage(apiKey, target, `Maaf, terjadi kesalahan saat memproses pesan: ${aiResponse.error}`);
    }
  } catch (e: any) {
    await sendMessage(apiKey, target, `Terjadi kesalahan sistem: ${e.message}`);
  }
  
  // Update TTL for session so it stays alive while chatting
  await prisma.waSession.update({
    where: { id },
    data: { expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });
};
