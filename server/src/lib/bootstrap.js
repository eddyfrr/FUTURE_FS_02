import bcrypt from 'bcryptjs';

export async function bootstrapAdmin(store) {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin12345';

  const existing = await store.users.findByEmail(email);
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await store.users.create({ email, passwordHash, name: 'Admin', role: 'admin' });
  console.log(`[mini-crm] seeded admin user → ${email} / ${password}`);
}
