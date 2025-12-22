const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.tex': 'text/plain; charset=utf-8'
};

const safePath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath);
  const normalized = decoded.startsWith('/') ? decoded : `/${decoded}`;
  const resolved = path.resolve(root, `.${normalized}`);
  if (!resolved.startsWith(root)) return null;
  return resolved;
};

const send = (res, status, body, type = 'text/plain; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
};

const serveFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);
  res.writeHead(200, { 'Content-Type': type });
  stream.pipe(res);
  stream.on('error', () => send(res, 500, 'Failed to read file.'));
};

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (urlPath === '/') {
    res.writeHead(302, { Location: '/web/' });
    res.end();
    return;
  }
  if (urlPath === '/web') {
    res.writeHead(302, { Location: '/web/' });
    res.end();
    return;
  }

  const filePath = safePath(urlPath);
  if (!filePath) {
    send(res, 403, 'Forbidden.');
    return;
  }

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    send(res, 404, 'Not found.');
    return;
  }

  if (stat.isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      serveFile(res, indexPath);
      return;
    }
    send(res, 404, 'Not found.');
    return;
  }

  serveFile(res, filePath);
});

try {
  execSync('node scripts/build-web-manifest.js', { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to build web manifest.');
  process.exit(1);
}

server.on('error', (err) => {
  console.error(`Failed to start server on port ${port}: ${err.message}`);
  console.error('Try a different port, e.g. PORT=8001 npm run web');
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Constructionary browser running at http://localhost:${port}/web/`);
  console.log('Press Ctrl+C to stop.');
});
