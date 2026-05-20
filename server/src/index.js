import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initStore } from './lib/store.js';
import { bootstrapAdmin } from './lib/bootstrap.js';
import authRouter from './routes/auth.js';
import leadsRouter from './routes/leads.js';

const app = express();
const PORT = process.env.PORT || 5060;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5174';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const publicLeadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), store: app.locals.storeKind });
});

app.use('/api/auth', authRouter);
app.use('/api/leads', publicLeadLimiter, leadsRouter);

app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

const start = async () => {
  const { store, kind } = await initStore();
  app.locals.store = store;
  app.locals.storeKind = kind;
  await bootstrapAdmin(store);
  app.listen(PORT, () => {
    console.log(`[mini-crm] listening on http://localhost:${PORT}  (store: ${kind})`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
