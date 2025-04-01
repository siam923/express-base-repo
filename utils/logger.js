import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file'; // For log rotation
import { mkdirSync } from 'fs';
/**
 * Logger Configuration
 * Development: Console + File logging
 * Production: Console + Rotated File logging with separate error logs
 * 
 * Best Practices:
 * 1. Never log sensitive information (passwords, tokens, personal data)
 * 2. Use appropriate log levels
 * 3. Implement log rotation to manage disk space
 * 4. Separate error logs for easier monitoring
 * 5. Structured logging (JSON) in production
 */

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Create logs directory if it doesn't exist
try {
  mkdirSync('logs');
} catch (error) {
  if (error.code !== 'EEXIST') {
    console.error('Error creating logs directory:', error);
  }
}

// Define log formats
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define which logs to print based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Configure daily rotate file options
const dailyRotateFileConfig = {
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  dirname: 'logs',
  auditFile: 'logs/audit.json',
};

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { 
    service: process.env.SERVICE_NAME || 'app-service',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport (all environments)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // Rotating file transport for all logs
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'logs/application-%DATE%.log',
      format: productionFormat
    }),

    // Separate rotating file transport for errors
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      format: productionFormat
    }),

    // Separate rotating file for HTTP logs (if needed)
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'logs/http-%DATE%.log',
      level: 'http',
      format: productionFormat
    })
  ],
  // Handle logger exceptions
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'logs/exceptions-%DATE%.log',
      format: productionFormat
    })
  ],
  // Handle rejections
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'logs/rejections-%DATE%.log',
      format: productionFormat
    })
  ]
});

// Add colors to Winston
winston.addColors(colors);

// Error handling for the logger itself
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

/**
 * Clean up old log files
 * You might want to set up a cron job to run this periodically
 */
const cleanOldLogs = () => {
  // This functionality is handled by maxFiles option in winston-daily-rotate-file
  logger.info('Log rotation and cleanup is handled by winston-daily-rotate-file');
};

// Add shutdown handler
process.on('SIGTERM', () => {
  logger.info('Logger shutting down...');
  logger.end();
});

/**
 * Usage Examples:
 * 
 * logger.error('Error occurred', { error: error.message, stack: error.stack });
 * logger.warn('Warning message', { context: 'additional info' });
 * logger.info('Operation successful', { operationId: '123' });
 * logger.http('API Request', { method: 'GET', path: '/api/users' });
 * logger.debug('Debug info', { detail: 'verbose information' });
 */

export default logger;