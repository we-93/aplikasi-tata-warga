import prisma from '@/lib/prisma';

export async function sendMessage(
  apiKey: string, 
  target: string, 
  message: string, 
  provider?: string,
  buttons?: { id: string, display_text: string }[]
) {
  // If provider is not specified, lookup from DB using apiKey
  if (!provider) {
    const device = await prisma.waDevice.findFirst({ where: { apiKey } });
    provider = device?.provider || "FONNTE";
  }

  let finalMessage = message;

  if (provider === "FONNTE") {
    // For Fonnte, format buttons as numbered text list since standard Fonnte doesn't support interactive buttons easily
    if (buttons && buttons.length > 0) {
      finalMessage += "\n\n*Balas dengan angka:*";
      buttons.forEach((btn, index) => {
        finalMessage += `\n${index + 1}. ${btn.display_text}`;
      });
    }

    try {
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
        },
        body: new URLSearchParams({
          target: target,
          message: finalMessage,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to send Fonnte message", error);
      throw error;
    }
  } else if (provider === "APICOID") {
    try {
      const payload: any = {
        phone: target,
        message: finalMessage,
      };

      if (buttons && buttons.length > 0) {
        payload.buttons = buttons;
      }

      const response = await fetch("https://v2.api.co.id/api/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to send APICOID message", error);
      throw error;
    }
  }
}
