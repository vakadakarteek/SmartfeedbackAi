import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return sendError(
      res,
      errorDetails[0]?.message || 'Validation failed',
      400,
      'VALIDATION_ERROR',
      errorDetails
    );
  }
  next();
}
