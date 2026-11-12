const config = require('../config/env');

const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle MySQL Duplicate Entry (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    statusCode = 409;
    message = 'A record with this unique value already exists.';
  }

  // Handle MySQL Foreign Key Constraint Error (ER_NO_REFERENCED_ROW_2)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    statusCode = 400;
    message = 'Referenced related record does not exist.';
  }

  // Handle MySQL Foreign Key Delete Restrict (ER_ROW_IS_REFERENCED_2)
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    statusCode = 409;
    message = 'Cannot delete or update record as it is referenced by other records.';
  }

  // Handle MySQL Data Too Long (ER_DATA_TOO_LONG)
  if (err.code === 'ER_DATA_TOO_LONG' || err.errno === 1406) {
    statusCode = 400;
    message = 'Provided input exceeds maximum allowable field length.';
  }

  // Handle MySQL Bad Null Error (ER_BAD_NULL_ERROR)
  if (err.code === 'ER_BAD_NULL_ERROR' || err.errno === 1048) {
    statusCode = 400;
    message = 'A required field cannot be null.';
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    stack: config.env === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
