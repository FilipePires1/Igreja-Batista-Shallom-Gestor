// Servidor local do sistema-web + proxy /api -> 127.0.0.1:3001
// Rode apenas enquanto estiver testando. Feche a janela para encerrar.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'sistema-web');
const PORT = 8080;
const API_HOST = '127.0.0.1';
const API_PORT = 3001;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function proxy(req, res) {
  const opts = {
    hostname: API_HOST,
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${API_HOST}:${API_PORT}` },
  };
  const upstream = http.request(opts, (ur) => {
    res.writeHead(ur.statusCode || 502, ur.headers);
    ur.pipe(res);
  });
  upstream.on('error', (e) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'API indisponível', detail: e.message }));
  });
  req.pipe(upstream);
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api')) return proxy(req, res);

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(ROOT, '.' + urlPath);
  if (!filePath.startsWith(path.resolve(ROOT))) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Web local: http://localhost:${PORT}/`);
  console.log(`API em http://${API_HOST}:${API_PORT} (proxy /api pronto)`);
});
