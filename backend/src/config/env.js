import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT:         process.env.PORT        || 5001,
  NODE_ENV:     process.env.NODE_ENV    || 'development',
  MONGODB_URI:  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartfeedback',
  JWT_SECRET:   process.env.JWT_SECRET  || 'super_secret_jwt_key_smartfeedback_ai_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Hugging Face AI (exclusive provider)
  HF_API_TOKEN:   process.env.HF_API_TOKEN   || '',
  HF_MODEL:       process.env.HF_MODEL       || 'Qwen/Qwen2.5-7B-Instruct',

  // Twilio SMS
  TWILIO_ACCOUNT_SID:  process.env.TWILIO_ACCOUNT_SID  || '',
  TWILIO_AUTH_TOKEN:   process.env.TWILIO_AUTH_TOKEN    || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER  || '',

  // Nodemailer Email (exclusive)

  // GMAIL Email
  GMAIL_USER:         process.env.GMAIL_USER         || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',
  SMTP_HOST:          process.env.SMTP_HOST          || '',
  SMTP_PORT:          process.env.SMTP_PORT          || '587',
  SMTP_SECURE:        process.env.SMTP_SECURE        || 'false',
  SMTP_USER:          process.env.SMTP_USER          || '',
  SMTP_PASS:          process.env.SMTP_PASS          || '',
  EMAIL_FROM_NAME:    process.env.EMAIL_FROM_NAME    || 'SmartFeedback AI',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  MAX_FEEDBACK_COUNT:      parseInt(process.env.MAX_FEEDBACK_COUNT      || '50',  10),
  AI_REQUESTS_PER_MINUTE:  parseInt(process.env.AI_REQUESTS_PER_MINUTE  || '10',  10),
  MAX_RECIPIENTS_PER_SEND: parseInt(process.env.MAX_RECIPIENTS_PER_SEND || '100', 10),
  MAX_MESSAGES_PER_MINUTE: parseInt(process.env.MAX_MESSAGES_PER_MINUTE || '20',  10),
};
