import axios from 'axios';
import { retry } from '../lib/retry';
import { logger } from '../lib/logger';

async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_TOKEN!;

  await retry(async () => {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info({ phoneNumber }, 'WhatsApp message sent successfully');
  });
}

export { sendWhatsAppMessage };
