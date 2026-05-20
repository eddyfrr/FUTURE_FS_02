import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    source: { type: String, default: 'Manual' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    message: { type: String, default: '' },
    notes: [
      new mongoose.Schema(
        { body: { type: String, required: true } },
        { timestamps: { createdAt: true, updatedAt: false } },
      ),
    ],
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'Admin' },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true },
);

const reshapeLead = (doc) => {
  if (!doc) return null;
  const o = doc.toObject({ virtuals: false });
  return {
    id: String(o._id),
    name: o.name,
    email: o.email,
    phone: o.phone,
    company: o.company,
    source: o.source,
    status: o.status,
    message: o.message,
    notes: (o.notes || []).map((n) => ({ id: String(n._id), body: n.body, createdAt: n.createdAt })),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

const reshapeUser = (doc) => {
  if (!doc) return null;
  const o = doc.toObject();
  return {
    id: String(o._id),
    email: o.email,
    passwordHash: o.passwordHash,
    name: o.name,
    role: o.role,
  };
};

export async function createMongoStore(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
  const Lead = mongoose.model('Lead', LeadSchema);
  const User = mongoose.model('User', UserSchema);

  return {
    users: {
      findByEmail: async (email) => reshapeUser(await User.findOne({ email: email.toLowerCase() })),
      findById: async (id) => reshapeUser(await User.findById(id)),
      create: async (data) => reshapeUser(await User.create(data)),
      count: async () => User.countDocuments(),
    },
    leads: {
      list: async ({ status, q } = {}) => {
        const filter = {};
        if (status) filter.status = status;
        if (q) {
          const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          filter.$or = [{ name: rx }, { email: rx }, { company: rx }];
        }
        const rows = await Lead.find(filter).sort({ createdAt: -1 });
        return rows.map(reshapeLead);
      },
      get: async (id) => {
        if (!mongoose.isValidObjectId(id)) return null;
        return reshapeLead(await Lead.findById(id));
      },
      create: async (data) => reshapeLead(await Lead.create(data)),
      update: async (id, patch) => {
        if (!mongoose.isValidObjectId(id)) return null;
        return reshapeLead(await Lead.findByIdAndUpdate(id, patch, { new: true }));
      },
      remove: async (id) => {
        if (!mongoose.isValidObjectId(id)) return false;
        const res = await Lead.findByIdAndDelete(id);
        return !!res;
      },
      addNote: async (id, body) => {
        if (!mongoose.isValidObjectId(id)) return null;
        const lead = await Lead.findById(id);
        if (!lead) return null;
        lead.notes.push({ body });
        await lead.save();
        const note = lead.notes[lead.notes.length - 1];
        return { id: String(note._id), body: note.body, createdAt: note.createdAt };
      },
      stats: async () => {
        const agg = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        const out = { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
        for (const row of agg) {
          out[row._id] = row.count;
          out.total += row.count;
        }
        return out;
      },
    },
  };
}
