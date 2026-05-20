import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { api } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

const EMPTY = { name: '', email: '', phone: '', company: '', source: 'Manual', message: '' };

export default function NewLead() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      const lead = await api.leads.create(form);
      navigate(`/leads/${lead.id}`, { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="New lead"
        subtitle="Add a lead manually — perfect for calls, referrals, or in-person meetings."
        actions={
          <Link to="/leads" className="btn-ghost">
            <FiArrowLeft /> Back
          </Link>
        }
      />
      <form onSubmit={submit} className="card card-pad max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={update('name')} required minLength={2} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={update('phone')} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={form.company} onChange={update('company')} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Source</label>
            <input className="input" value={form.source} onChange={update('source')} placeholder="e.g. Portfolio contact form, LinkedIn, Referral" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Initial message / context</label>
            <textarea rows={4} className="input resize-none" value={form.message} onChange={update('message')} />
          </div>
        </div>

        {err && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</div>}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create lead'}
          </button>
          <Link to="/leads" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </>
  );
}
