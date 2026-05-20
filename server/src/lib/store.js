import { createMemoryStore } from './store.memory.js';
import { createMongoStore } from './store.mongo.js';

export async function initStore() {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    try {
      const store = await createMongoStore(uri);
      return { store, kind: 'mongodb' };
    } catch (err) {
      console.warn('[store] MongoDB connection failed, falling back to in-memory:', err.message);
    }
  }
  const store = await createMemoryStore();
  return { store, kind: 'memory' };
}
