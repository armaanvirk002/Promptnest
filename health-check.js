#!/usr/bin/env node

// Simple health check script for deployment verification
const http = require('http');

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

console.log(`Checking health at http://${host}:${port}/api/stats`);

const req = http.get(`http://${host}:${port}/api/stats`, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});