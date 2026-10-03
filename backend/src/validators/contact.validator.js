import { body, param } from 'express-validator';

export const createContactValidator = [
  body('name').trim().notEmpty().withMessage('Contact name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

export const updateContactValidator = [
  param('id').isMongoId().withMessage('Invalid contact ID'),
  body('name').optional().trim().notEmpty().withMessage('Contact name cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
  body('isActive').optional().isBoolean(),
];
