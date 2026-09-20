import express from 'express';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createSQLiteStore } from './sqlite.mjs';
import { createService } from './service.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const store = createSQLiteStore(process.env.DATABASE_PATH || resolve(project, '.data/clearpath.sqlite'));
const service = createService(store); const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
  next();
});
const rateLimits = new Map();
app.use('/api', (req, res, next) => {
  const key = req.ip; const now = Date.now(); let item = rateLimits.get(key);
  if (!item || item.reset <= now) item = { count: 0, reset: now + 60000 };
  item.count++; rateLimits.set(key, item);
  if (rateLimits.size > 10000) for (const [k, v] of rateLimits) if (v.reset <= now) rateLimits.delete(k);
  if (item.count > 120) return res.status(429).json({ error: 'Too many requests. Try again in a minute.', code: 'RATE_LIMITED' });
  next();
});
app.use(express.json({ limit: '48kb', strict: true }));
app.use('/api', async (req, res) => {
  const result = await service({ method: req.method, path: `/api${req.path}`, headers: req.headers, body: req.body });
  res.status(result.status).json(result.body);
});
const dist = resolve(project, 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { index: 'index.html', maxAge: '1h' }));
  app.get('/{*path}', (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}
app.use((error, _req, res, _next) => {
  res.status(error.status === 413 ? 413 : 400).json({ error: error.status === 413 ? 'Request is too large.' : 'Invalid JSON request.', code: 'INVALID_INPUT' });
});
const port = Number(process.env.PORT) || 8787;
const server = app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`ClearPath API listening on http://${process.env.HOST || '127.0.0.1'}:${port}; Cedar authorization + SQLite persistence`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
