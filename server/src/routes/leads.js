import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const VALID_STATUS = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const isEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

router.post('/', async (req, res) => {
  const { name, email, phone, company, source, message } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required (min 2 chars)' });
  }
  if (!isEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  if (message && message.length > 5000) return res.status(400).json({ error: 'Message too long' });

  const store = req.app.locals.store;
  const lead = await store.leads.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || '',
    company: company?.trim() || '',
    source: source?.trim() || 'Public form',
    message: message?.trim() || '',
  });
  res.status(201).json(lead);
});

router.get('/', requireAuth, async (req, res) => {
  const { status, q } = req.query;
  if (status && !VALID_STATUS.includes(status)) {
    return res.status(400).json({ error: 'Invalid status filter' });
  }
  const store = req.app.locals.store;
  const leads = await store.leads.list({ status, q });
  res.json(leads);
});

router.get('/stats', requireAuth, async (req, res) => {
  const stats = await req.app.locals.store.leads.stats();
  res.json(stats);
});

router.get('/:id', requireAuth, async (req, res) => {
  const lead = await req.app.locals.store.leads.get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const patch = {};
  for (const k of ['name', 'email', 'phone', 'company', 'source', 'status', 'message']) {
    if (k in req.body) patch[k] = req.body[k];
  }
  if (patch.status && !VALID_STATUS.includes(patch.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (patch.email && !isEmail(patch.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const lead = await req.app.locals.store.leads.update(req.params.id, patch);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const ok = await req.app.locals.store.leads.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Lead not found' });
  res.json({ ok: true });
});

router.post('/:id/notes', requireAuth, async (req, res) => {
  const { body } = req.body || {};
  if (!body || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: 'Note body is required' });
  }
  const note = await req.app.locals.store.leads.addNote(req.params.id, body.trim());
  if (!note) return res.status(404).json({ error: 'Lead not found' });
  res.status(201).json(note);
});

export default router;
