import twilio from 'twilio';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let twilioClient = null;
if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    logger.error('Failed to initialize Twilio client:', err.message);
  }
}

export async function sendSMS(phoneNumber, message) {
  if (!phoneNumber) {
    return {
      success: false,
      provider: 'twilio',
      error: 'Phone number is required',
    };
  }

  if (!twilioClient || !env.TWILIO_PHONE_NUMBER) {
    logger.warn(`Twilio not configured. Operating in mock SMS mode for recipient ${phoneNumber}`);
    return {
      success: true,
      mode: 'mock',
      provider: 'twilio',
      providerMessageId: `mock-sms-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      recipient: phoneNumber,
      status: 'delivered',
    };
  }

  try {
    const res = await twilioClient.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return {
      success: true,
      mode: 'live',
      provider: 'twilio',
      providerMessageId: res.sid,
      recipient: phoneNumber,
      status: res.status || 'sent',
    };
  } catch (error) {
    logger.error(`Twilio SMS send failed for ${phoneNumber}:`, error.message);
    return {
      success: false,
      mode: 'live',
      provider: 'twilio',
      error: error.message,
      recipient: phoneNumber,
      status: 'failed',
    };
  }
}
