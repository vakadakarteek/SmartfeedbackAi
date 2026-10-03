export function sendSuccess(res, data = {}, message = 'Success', statusCode = 200, extra = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
}

export function sendError(res, message = 'Something went wrong', statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const payload = {
    success: false,
    message,
    code,
  };
  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
}

export function sendPaginated(res, items = [], pagination = {}, message = 'Data retrieved successfully') {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    items,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || items.length,
      total: pagination.total || items.length,
      totalPages: pagination.totalPages || 1,
    },
  });
}
