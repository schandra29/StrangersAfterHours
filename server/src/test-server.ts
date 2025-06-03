import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create log files
const accessLogFile = path.join(logDir, 'test-access.log');
const errorLogFile = path.join(logDir, 'test-error.log');

// Create write streams for logging
const accessLogStream = fs.createWriteStream(accessLogFile, { flags: 'a' });
const errorLogStream = fs.createWriteStream(errorLogFile, { flags: 'a' });

// Custom logger
const logger = {
  info: (message: string) => {
    const logMessage = `[${new Date().toISOString()}] INFO: ${message}\n`;
    process.stdout.write(logMessage);
    accessLogStream.write(logMessage);
  },
  error: (message: string, error?: Error) => {
    const errorMessage = error ? `${message}\n${error.stack || error}` : message;
    const logMessage = `[${new Date().toISOString()}] ERROR: ${errorMessage}\n`;
    process.stderr.write(logMessage);
    errorLogStream.write(logMessage);
  }
};

logger.info('Starting test server...');
logger.info(`Process ID: ${process.pid}`);
logger.info(`Current working directory: ${process.cwd()}`);
logger.info(`Node.js version: ${process.version}`);
logger.info(`Platform: ${process.platform} ${process.arch}`);
logger.info(`Log files: ${accessLogFile}, ${errorLogFile}`);

const app = express();
const port = 3002; // Using a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Health check endpoint
app.get('/', (_req, res) => {
  logger.info('Root endpoint called');
  res.send('Test server is running!');
});

app.get('/api/health', (_req, res) => {
  const healthCheck = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    node: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    pid: process.pid
  };
  
  logger.info(`Health check: ${JSON.stringify(healthCheck)}`);
  res.json(healthCheck);
});

// Add a test endpoint that returns JSON
app.get('/api/test', (_req, res) => {
  const testData = {
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
    random: Math.random()
  };
  
  logger.info(`Test endpoint called: ${JSON.stringify(testData)}`);
  res.json(testData);
});

// Add error test endpoint
app.get('/api/error-test', (_req, res) => {
  try {
    // Simulate an error
    throw new Error('This is a test error');
  } catch (error) {
    logger.error('Error test endpoint called', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      error: 'Test error triggered',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Create HTTP server explicitly
const server = http.createServer(app);

// Start server with explicit error handling
server.listen(port, () => {
  logger.info(`Test server running on http://localhost:${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Keep the process alive with more frequent heartbeats
const heartbeat = setInterval(() => {
  logger.info(`Server heartbeat - still alive at ${new Date().toISOString()} - uptime: ${process.uptime().toFixed(2)}s`);
  
  // Log memory usage
  const memoryUsage = process.memoryUsage();
  logger.info(`Memory usage: RSS ${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}/${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
}, 10000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully');
  clearInterval(heartbeat);
  server.close(() => {
    logger.info('Server closed');
    // Close log streams
    accessLogStream.end();
    errorLogStream.end();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  clearInterval(heartbeat);
  server.close(() => {
    logger.info('Server closed');
    // Close log streams
    accessLogStream.end();
    errorLogStream.end();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION:', error);
  clearInterval(heartbeat);
  server.close(() => {
    logger.info('Server closed due to uncaught exception');
    // Close log streams
    accessLogStream.end();
    errorLogStream.end();
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, _promise) => {
  logger.error('UNHANDLED REJECTION:', reason instanceof Error ? reason : new Error(String(reason)));
  clearInterval(heartbeat);
  server.close(() => {
    logger.info('Server closed due to unhandled rejection');
    // Close log streams
    accessLogStream.end();
    errorLogStream.end();
    process.exit(1);
  });
});

// Log server events
server.on('error', (error) => {
  logger.error('SERVER ERROR:', error);
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  logger.info(`Listening on ${bind}`);
});
