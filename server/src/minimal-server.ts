import express from 'express';

console.log('Starting minimal server...');

const app = express();
const port = 3002; // Use a different port for testing

app.get('/', (_req, res) => {
  console.log('GET / received');
  res.send('Minimal server is running!');
});

const server = app.listen(port, () => {
  console.log(`Minimal server running on http://localhost:${port}`);
});

// Keep the process alive
process.stdin.resume();

// Cleanup on exit
const cleanup = () => {
  console.log('Shutting down minimal server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
