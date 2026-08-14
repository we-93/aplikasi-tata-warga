import prisma from '@/lib/prisma';

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.substring(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.substring(1);
  }
  return cleaned;
}

export async function sendMessage(
  apiKey: string, 
  target: string, 
  message: string, 
  provider?: string,
  buttons?: { id: string, display_text: string }[]
) {
  let finalMessage = message;
  let payload: any = {
    phone_number: target,
    channel: "whatsapp",
    message_type: "text",
    content: finalMessage,
  };

  // If buttons are provided, use interactive list or inline buttons
  if (buttons && buttons.length > 0) {
    if (buttons.length <= 3) {
      payload = {
        phone_number: target,
        channel: "whatsapp",
        message_type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: finalMessage
          },
          action: {
            buttons: buttons.map(btn => ({
              type: "reply",
              reply: {
                id: btn.id,
                title: btn.display_text.substring(0, 20)
              }
            }))
          }
        }
      };
    } else {
      payload = {
        phone_number: target,
        channel: "whatsapp",
        message_type: "interactive",
        interactive: {
          type: "list",
          body: {
            text: finalMessage
          },
          action: {
            button: "Pilih Menu",
            sections: [
              {
                title: "Pilihan Menu",
                rows: buttons.map(btn => ({
                  id: btn.id,
                  title: btn.display_text.substring(0, 24)
                }))
              }
            ]
          }
        }
      };
    }
  }

  // Use global API Key for Kirim.chat
  const globalApiKey = process.env.KIRIMCHAT_API_KEY || apiKey;
  
  try {
    const response = await fetch("https://api-prod.kirim.chat/api/v1/public/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${globalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send Kirim.chat message", error);
    throw error;
  }
}
