import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';

// Configure environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logDir, 'error.log'),
  { flags: 'a' }
);

const app = express();
const port = process.env.PORT || 3001;

// Custom logger function
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

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
    logger.info(logMessage);
  });
  
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const healthCheck = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    node: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  };
  
  logger.info(`Health check: ${JSON.stringify(healthCheck)}`);
  res.json(healthCheck);
});

// Mount API routes
app.use('/api', apiRoutes);

// Simple test route
app.get('/api/test', (_req: Request, res: Response) => {
  const testData = {
    message: 'Test route is working!',
    timestamp: new Date().toISOString(),
    node: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    pid: process.pid
  };
  
  logger.info(`Test endpoint called: ${JSON.stringify(testData)}`);
  res.json(testData);
});

// Add error test endpoint for debugging
app.get('/api/error-test', (_req: Request, res: Response) => {
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

// 404 handler
app.use((_req: Request, res: Response) => {
  const error = new Error('Not Found');
  logger.error('404 Not Found', error);
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  logger.error(`Error ID: ${errorId}`, err);
  
  const errorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    errorId,
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.message = err.message;
    // Add stack trace to the response in development
    Object.assign(errorResponse, { stack: err.stack });
  }
  
  res.status(500).json(errorResponse);
});

// Log process events for debugging
['SIGINT', 'SIGTERM', 'SIGQUIT', 'uncaughtException', 'unhandledRejection', 'exit', 'beforeExit', 'disconnect', 'message']
  .forEach(event => {
    process.on(event as any, (arg: unknown) => {
      const message = `Process event: ${event}`;
      const details = arg !== undefined ? (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)) : 'No details';
      logger.info(`${message} - ${details}`);
    });
  });

// Keep process alive with a heartbeat and detailed logging
let isShuttingDown = false;
const heartbeat = setInterval(() => {
  if (!isShuttingDown) {
    // This heartbeat keeps the process alive
    logger.info(`Server heartbeat - uptime: ${process.uptime().toFixed(2)}s`);
    
    // Log memory usage
    const memoryUsage = process.memoryUsage();
    logger.info(`Memory usage: RSS ${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}/${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
  }
}, 30000); // Log every 30 seconds

// Create HTTP server explicitly for better control
const server = app.listen(Number(port), '0.0.0.0', () => {
  const serverInfo = `Server running on http://localhost:${port}`;
  const envInfo = `Environment: ${process.env.NODE_ENV || 'development'}`;
  const nodeInfo = `Node.js version: ${process.version}`;
  
  logger.info(serverInfo);
  logger.info(envInfo);
  logger.info(nodeInfo);
  
  console.log('\n' + '='.repeat(50));
  console.log(serverInfo);
  console.log(envInfo);
  console.log(nodeInfo);
  console.log('Logs directory:', path.resolve(logDir));
  console.log('='.repeat(50) + '\n');
});

// Log server events
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  logger.info(`Listening on ${bind}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', 
    reason instanceof Error ? reason : new Error(String(reason)));
  // Convert promise to string for logging
  logger.error('Promise:', new Error(`Promise rejected: ${promise}`));
  
  // Give it some time to log the error before shutting down
  setTimeout(() => {
    server.close(() => {
      process.exit(1);
    });
  }, 1000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  
  // Give it some time to log the error before shutting down
  setTimeout(() => {
    server.close(() => {
      process.exit(1);
    });
  }, 1000);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  isShuttingDown = true;
  clearInterval(heartbeat);
  server.close(() => {
    logger.info('💥 Process terminated!');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('👋 SIGINT RECEIVED. Shutting down gracefully');
  isShuttingDown = true;
  clearInterval(heartbeat);
  server.close(() => {
    logger.info('💥 Process terminated!');
    process.exit(0);
  });
});

// Handle process exit
process.on('exit', (code: number) => {
  logger.info(`Process exiting with code ${code}`);
  
  // Close log streams
  accessLogStream.end();
  errorLogStream.end();
});

// Handle beforeExit event
process.on('beforeExit', (code) => {
  logger.info(`Process beforeExit with code: ${code}`);
});

// Handle disconnect event
process.on('disconnect', () => {
  logger.info('Process disconnect event');
});

export default app;
