console.log('Starting minimal HTTP server...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Current working directory:', process.cwd());

const http = require('http');

const hostname = '0.0.0.0';
const port = 3002;

const requestHandler = (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    const response = {
      status: 'ok',
      timestamp: timestamp,
      node: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Minimal HTTP Server is running!\n');
};

const server = http.createServer(requestHandler);

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

server.listen(port, hostname, () => {
  console.log('\n=== Minimal HTTP Server ===');
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Node.js version:', process.version);
  console.log('Process ID:', process.pid);
  console.log('Platform:', process.platform, process.arch);
  console.log('Current directory:', process.cwd());
  console.log('===========================');
  console.log('Press Ctrl+C to stop the server');
  console.log('===========================\n');
});

// Handle shutdown
const shutdown = () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Keep process alive
process.stdin.resume();

console.log('Server will stay alive until manually terminated...');
