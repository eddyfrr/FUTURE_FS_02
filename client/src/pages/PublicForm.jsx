import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiSend } from 'react-icons/fi';
import { api } from '../lib/api.js';

export default function PublicForm() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await api.leads.createPublic({ ...form, source: 'Public contact form' });
      setDone(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(139,92,246,0.18),transparent_60%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(6,182,212,0.12),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-xl p-8"
      >
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-ink-400">FUTURE_FS_02 · Public form</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Get in touch</h1>
          <p className="mt-2 text-sm text-ink-300">
            This form feeds straight into the Mini CRM. Submissions appear in the admin dashboard as new leads.
          </p>
        </div>

        {done ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <FiCheckCircle className="mx-auto mb-2 text-3xl text-emerald-300" />
            <div className="font-semibold text-white">Thanks — we'll be in touch shortly.</div>
            <button
              onClick={() => {
                setDone(false);
                setForm({ name: '', email: '', company: '', message: '' });
              }}
              className="mt-4 text-xs text-emerald-200 underline"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={update('name')} required minLength={2} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" value={form.email} onChange={update('email')} required />
              </div>
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={update('company')} />
            </div>
            <div>
              <label className="label">How can we help?</label>
              <textarea rows={5} className="input resize-none" value={form.message} onChange={update('message')} />
            </div>

            {err && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</div>}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Sending…' : (<>Send <FiSend /></>)}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
