import { body } from 'express-validator';
import { env } from '../config/env.js';

export const sendMessageValidator = [
  body('channel')
    .notEmpty()
    .withMessage('Channel is required')
    .isIn(['sms', 'email', 'whatsapp'])
    .withMessage('Channel must be sms, email, or whatsapp'),
  body('contactIds')
    .isArray({ min: 1, max: env.MAX_RECIPIENTS_PER_SEND || 100 })
    .withMessage(`Must provide between 1 and ${env.MAX_RECIPIENTS_PER_SEND || 100} contacts`),
  body('feedbackId').optional().isMongoId().withMessage('Valid feedbackId is required'),
  body('feedbackIds').optional().isArray().withMessage('feedbackIds must be an array'),
  body('message').optional().trim(),
];
