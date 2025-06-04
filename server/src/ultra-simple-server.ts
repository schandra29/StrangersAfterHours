import http from 'http';

const port = 3002; // Using a different port to avoid conflicts

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ultra simple server is running!\n');
});

server.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Ultra simple server listening on http://localhost:${port}`);
  console.log(`[${new Date().toISOString()}] Process ID: ${process.pid}`);
  console.log(`[${new Date().toISOString()}] Node.js version: ${process.version}`);
  console.log(`[${new Date().toISOString()}] To stop, press Ctrl+C`);
});

server.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] Server error:`, err);
});

// Basic keep-alive, though http.createServer should be enough
setInterval(() => {
    // This interval is just to be absolutely sure the event loop doesn't empty if http server alone isn't enough
}, 60000);

console.log(`[${new Date().toISOString()}] Script end reached, but server should be listening.`);
