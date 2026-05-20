import 'dotenv/config';
import { initStore } from '../lib/store.js';
import { bootstrapAdmin } from '../lib/bootstrap.js';

const SAMPLE = [
  { name: 'Aisha Mwangi', email: 'aisha@acme.co', phone: '+254700000001', company: 'Acme Logistics', source: 'Portfolio contact form', status: 'new', message: 'Need a landing page for our new courier service.' },
  { name: 'Brian Okeyo', email: 'brian@brightlab.io', company: 'BrightLab', source: 'LinkedIn', status: 'contacted', message: 'Looking for a part-time React dev.' },
  { name: 'Carla Martins', email: 'carla.m@studiox.com', phone: '+5511990000022', company: 'Studio X', source: 'Referral', status: 'qualified' },
  { name: 'Daniel Mensah', email: 'dan@menfin.co', source: 'Portfolio contact form', status: 'converted', message: 'Quoted and signed.' },
  { name: 'Esha Patel', email: 'esha@kindlecare.org', company: 'KindleCare', source: 'Cold email', status: 'lost' },
];

const run = async () => {
  const { store, kind } = await initStore();
  await bootstrapAdmin(store);
  for (const s of SAMPLE) await store.leads.create(s);
  console.log(`[seed] inserted ${SAMPLE.length} leads (store: ${kind})`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
