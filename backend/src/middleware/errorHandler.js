const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  let error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError') error = { message: 'Resource not found', statusCode: 404 };
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `Duplicate value for ${field}`, statusCode: 400 };
  }
  if (err.name === 'ValidationError') {
    error = { message: Object.values(err.errors).map(e => e.message).join(', '), statusCode: 400 };
  }
  res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
};
