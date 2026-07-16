const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred.',
    // Only return error stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
