import { logger } from '../../utils/logger.js';

export async function sendWhatsApp(phoneNumber, message) {
  logger.info(`WhatsApp provider requested for recipient ${phoneNumber}`);
  return {
    success: false,
    provider: 'whatsapp',
    message: 'WhatsApp messaging is not configured. Please use SMS or Email.',
    recipient: phoneNumber,
    status: 'failed',
  };
}
