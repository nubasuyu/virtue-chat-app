// backend/src/middleware/errorMiddleware.js

// @desc    Handle 404 errors (routes that don't exist)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the errorHandler
};

// @desc    Global error handler
const errorHandler = (err, req, res, next) => {
  // If the status code is 200 (default), change it to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    // Only show the error stack trace in development, not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };