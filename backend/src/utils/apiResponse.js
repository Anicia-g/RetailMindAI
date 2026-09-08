/**
 * Standardized API Response Utilities
 */

const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    message,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  const payload = {
    success: false,
    message,
    error: error || message,
  };
  return res.status(statusCode).json(payload);
};

const paginatedResponse = (res, items = [], total = 0, page = 1, limit = 10, message = 'Success') => {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
