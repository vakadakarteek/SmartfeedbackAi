import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error on ${req.method} ${req.url}: ${err.message}`, err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, messages.join(', '), 400, 'VALIDATION_ERROR');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `A record with that ${field} already exists.`, 409, 'DUPLICATE_KEY');
  }

  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format for ${err.path}.`, 400, 'INVALID_ID');
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error occurred.'
    : err.message || 'Something went wrong.';

  return sendError(res, message, statusCode, err.errorCode || 'INTERNAL_SERVER_ERROR', err.stack);
}
