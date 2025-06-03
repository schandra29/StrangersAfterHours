import express from 'express';

console.log('Starting simple server...');
console.log('Process ID:', process.pid);
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);

const app = express();
const port = 3001;

// Log process events
['exit', 'SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection']
  .forEach(event => {
    process.on(event, (arg) => {
      console.log(`Process event: ${event}`, typeof arg === 'object' ? JSON.stringify(arg) : String(arg));
      if (event === 'uncaughtException' || event === 'unhandledRejection') {
        console.error('Error:', arg);
      }
    });
  });

app.get('/', (_req, res) => {
  res.send('Simple server is running!');});

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    node: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

let server;

try {
  server = app.listen(port, '0.0.0.0', () => {
    console.log(`\n=== Simple Server ===`);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
    console.log(`Current directory: ${process.cwd()}`);
    console.log('========================\n');
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
    } else {
      console.error('Unhandled server error:', error);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Keep process alive
console.log('Process will stay alive until terminated...');
process.stdin.resume();

// Log that we're keeping the process alive
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  shutdown();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  shutdown();
});

// Prevent process from closing immediately
setInterval(() => {
  // Keep the process alive
}, 1000 * 60 * 60); // 1 hour interval

console.log('Process will stay alive until manually terminated.');

// Handle shutdown
export const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
