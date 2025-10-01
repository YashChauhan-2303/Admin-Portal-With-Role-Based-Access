const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);

      // Connect to MongoDB
      this.connection = await mongoose.connect(
        config.database.mongodb.uri,
        config.database.mongodb.options
      );

      // Connection event handlers
      mongoose.connection.on('connected', () => {
        logger.info(`MongoDB connected to ${config.database.mongodb.uri}`);
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.info('MongoDB disconnected');
      });

      // Handle app termination
      process.on('SIGINT', this.gracefulClose.bind(this));

      logger.info('Database connection established successfully');
      return this.connection;

    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  async gracefulClose() {
    try {
      await this.disconnect();
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Health check for database
  async healthCheck() {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected');
      }

      // Simple ping to check connection
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        connected: true,
        database: config.database.mongodb.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
module.exports = new Database();