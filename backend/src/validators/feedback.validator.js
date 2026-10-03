import { body, param } from 'express-validator';
import { env } from '../config/env.js';

export const generateFeedbackValidator = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('description').optional().trim(),
  body('feedbackCount')
    .optional()
    .isInt({ min: 1, max: env.MAX_FEEDBACK_COUNT || 20 })
    .withMessage(`Feedback count must be between 1 and ${env.MAX_FEEDBACK_COUNT || 20}`),
  body('count')
    .optional()
    .isInt({ min: 1, max: env.MAX_FEEDBACK_COUNT || 20 })
    .withMessage(`Count must be between 1 and ${env.MAX_FEEDBACK_COUNT || 20}`),
  body('tone').optional().trim(),
  body('length').optional().trim().isIn(['short', 'medium', 'long', 'detailed']).withMessage('Invalid length option'),
  body('language').optional().trim(),
  body('style').optional().trim(),
  body('keywords').optional().isArray().withMessage('Keywords must be an array of strings'),
  body('avoidTopics').optional().isArray().withMessage('AvoidTopics must be an array of strings'),
  body('audience').optional().trim(),
];

export const updateFeedbackValidator = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Text cannot be empty'),
  body('status')
    .optional()
    .isIn(['generated', 'edited', 'approved', 'archived'])
    .withMessage('Invalid status value'),
  body('isSelected').optional().isBoolean(),
];

export const regenerateFeedbackValidator = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('topic').optional().trim(),
  body('tone').optional().trim(),
  body('length').optional().trim(),
  body('language').optional().trim(),
];
