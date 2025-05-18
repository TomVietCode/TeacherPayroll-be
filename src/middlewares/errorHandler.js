/**
 * Centralized error handling middleware
 * Catches and returns consistent error responses for all application errors
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Handle Prisma errors
  // Prisma throws errors with specific error codes that we can handle
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation (duplicate unique value)
        return res.status(400).json({
          message: 'Data violates unique constraint',
          error: err.meta
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          message: 'Record not found',
          error: err.meta
        });
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          message: 'Foreign key constraint violation',
          error: err.meta
        });
      default:
        break;
    }
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Data validation error',
      errors: err.errors
    });
  }

  // Default to 500 server error
  res.status(500).json({
    message: 'Server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

export default errorHandler; 