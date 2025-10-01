const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./config');
const logger = require('./config/logger');
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
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
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

// Initialize cron jobs
if (config.cron.enabled) {
  initializeCronJobs();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  shutdownCronJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  shutdownCronJobs();
  process.exit(0);
});

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${config.server.env}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error);
});

module.exports = app;