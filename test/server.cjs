const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'sites', 'tennis-stringing');
const port = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
};

http
  .createServer((req, res) => {
    // Strip query string to get the actual path
    const urlPath = req.url.split('?')[0];
    let filePath = urlPath === '/' ? 'index.html' : urlPath;
    filePath = path.join(root, decodeURIComponent(filePath));

    try {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  })
  .listen(port, () => {
    console.log(`Test server running on http://localhost:${port}`);
  });
