import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait a few minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.AI_REQUESTS_PER_MINUTE || 10,
  message: {
    success: false,
    message: 'AI generation request limit reached. Please wait a minute before generating more drafts.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const messageSendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.MAX_MESSAGES_PER_MINUTE || 20,
  message: {
    success: false,
    message: 'Message sending rate limit reached. Please wait a moment before sending more messages.',
    code: 'MESSAGE_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
