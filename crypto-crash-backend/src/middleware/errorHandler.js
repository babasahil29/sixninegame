/**
 * Error handling middleware
 */

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    details = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys(err.keyValue)[0];
    details = `${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.message) {
    // Use the error message if it's a known error
    message = err.message;
    
    // Set appropriate status codes for common error messages
    if (err.message.includes('not found')) {
      statusCode = 404;
    } else if (err.message.includes('unauthorized') || err.message.includes('permission')) {
      statusCode = 403;
    } else if (err.message.includes('invalid') || err.message.includes('required')) {
      statusCode = 400;
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong';
    details = null;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Rate limiting error handler
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: req.rateLimit?.resetTime || '1 minute'
  });
};

/**
 * Database connection error handler
 */
const dbErrorHandler = (err) => {
  console.error('Database connection error:', err);
  
  if (err.name === 'MongoNetworkError') {
    console.error('MongoDB network error - check connection');
  } else if (err.name === 'MongooseServerSelectionError') {
    console.error('MongoDB server selection error - check if MongoDB is running');
  }
};

/**
 * WebSocket error handler
 */
const wsErrorHandler = (ws, error) => {
  console.error('WebSocket error:', error);
  
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        data: {
          message: 'WebSocket error occurred',
          timestamp: new Date().toISOString()
        }
      }));
    }
  } catch (sendError) {
    console.error('Error sending WebSocket error message:', sendError);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (server, gameService, webSocketService) => {
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
      console.log('HTTP server closed');
      
      // Stop game service
      if (gameService) {
        gameService.stopGameLoop();
        console.log('Game service stopped');
      }
      
      // Close WebSocket connections
      if (webSocketService) {
        webSocketService.closeAllConnections();
        console.log('WebSocket connections closed');
      }
      
      // Close database connection
      const mongoose = require('mongoose');
      mongoose.connection.close(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  rateLimitHandler,
  dbErrorHandler,
  wsErrorHandler,
  gracefulShutdown
};

