const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./config');
const logger = require('./config/logger');
const database = require('./config/database');
const { securityConfig, corsOptions } = require('./middleware/security');
const { generalLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeCronJobs, shutdownCronJobs } = require('./cron/jobs');

const authRoutes = require('./routes/auth');
const universityRoutes = require('./routes/universities');
const userRoutes = require('./routes/users');

const app = express();
const PORT = config.server.port;

// Security middleware
app.use(securityConfig);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Service unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize server with database connection
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    logger.info('Database connected successfully');

    // Initialize cron jobs
    if (config.cron.enabled) {
      initializeCronJobs();
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      try {
        // Shutdown cron jobs
        shutdownCronJobs();
        
        // Close server
        server.close(() => {
          logger.info('HTTP server closed');
        });
        
        // Disconnect from database
        await database.disconnect();
        logger.info('Database disconnected');
        
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };