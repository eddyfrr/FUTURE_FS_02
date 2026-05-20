import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'crm.json');

async function loadState() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const json = JSON.parse(raw);
    return { leads: json.leads ?? [], users: json.users ?? [] };
  } catch {
    return { leads: [], users: [] };
  }
}

async function persist(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2));
}

export async function createMemoryStore() {
  const state = await loadState();
  const save = () => persist(state);

  return {
    users: {
      async findByEmail(email) {
        return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
      },
      async findById(id) {
        return state.users.find((u) => u.id === id) || null;
      },
      async create({ email, passwordHash, name = 'Admin', role = 'admin' }) {
        const user = { id: randomUUID(), email, passwordHash, name, role, createdAt: new Date().toISOString() };
        state.users.push(user);
        await save();
        return user;
      },
      async count() {
        return state.users.length;
      },
    },
    leads: {
      async list({ status, q } = {}) {
        let rows = [...state.leads];
        if (status) rows = rows.filter((l) => l.status === status);
        if (q) {
          const needle = q.toLowerCase();
          rows = rows.filter(
            (l) =>
              l.name.toLowerCase().includes(needle) ||
              l.email.toLowerCase().includes(needle) ||
              (l.company || '').toLowerCase().includes(needle),
          );
        }
        return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      async get(id) {
        return state.leads.find((l) => l.id === id) || null;
      },
      async create(data) {
        const now = new Date().toISOString();
        const lead = {
          id: randomUUID(),
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          company: data.company || '',
          source: data.source || 'Manual',
          status: data.status || 'new',
          message: data.message || '',
          notes: [],
          createdAt: now,
          updatedAt: now,
        };
        state.leads.unshift(lead);
        await save();
        return lead;
      },
      async update(id, patch) {
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return null;
        for (const k of ['name', 'email', 'phone', 'company', 'source', 'status', 'message']) {
          if (k in patch) lead[k] = patch[k];
        }
        lead.updatedAt = new Date().toISOString();
        await save();
        return lead;
      },
      async remove(id) {
        const idx = state.leads.findIndex((l) => l.id === id);
        if (idx === -1) return false;
        state.leads.splice(idx, 1);
        await save();
        return true;
      },
      async addNote(id, body) {
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return null;
        const note = { id: randomUUID(), body, createdAt: new Date().toISOString() };
        lead.notes.push(note);
        lead.updatedAt = note.createdAt;
        await save();
        return note;
      },
      async stats() {
        const by = (s) => state.leads.filter((l) => l.status === s).length;
        return {
          total: state.leads.length,
          new: by('new'),
          contacted: by('contacted'),
          qualified: by('qualified'),
          converted: by('converted'),
          lost: by('lost'),
        };
      },
    },
  };
}
