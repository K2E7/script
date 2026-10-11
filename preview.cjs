// Local static preview: node preview.cjs [port]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.argv[2] || 4173);
const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/script.js': ['script.js', 'text/javascript; charset=utf-8'],
  '/script.json': ['script.json', 'application/json; charset=utf-8'],
  '/fonts/lexend-latin-variable.woff2': ['fonts/lexend-latin-variable.woff2', 'font/woff2'],
  '/fonts/space-grotesk-latin-variable.woff2': ['fonts/space-grotesk-latin-variable.woff2', 'font/woff2'],
  '/favicon.svg': ['favicon.svg', 'image/svg+xml']
};

const server = http.createServer((request, response) => {
  const asset = assets[new URL(request.url, 'http://localhost').pathname];
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end();
  }
  if (!asset) {
    response.writeHead(404);
    return response.end('Not found');
  }
  fs.readFile(path.join(__dirname, asset[0]), (error, content) => {
    if (error) {
      response.writeHead(500);
      return response.end('Unable to read asset');
    }
    response.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : content);
  });
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is busy. Try node preview.cjs ${port + 1}`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port} (Ctrl+C to stop)`));
