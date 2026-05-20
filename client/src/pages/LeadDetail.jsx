import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiMail, FiPhone, FiBriefcase, FiTag } from 'react-icons/fi';
import { api } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge, { STATUSES } from '../components/StatusBadge.jsx';

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = () => api.leads.get(id).then(setLead).catch((e) => setErr(e.message));

  useEffect(() => {
    refresh();
  }, [id]);

  const changeStatus = async (next) => {
    if (!lead || lead.status === next) return;
    setBusy(true);
    try {
      const updated = await api.leads.update(id, { status: next });
      setLead(updated);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    try {
      await api.leads.addNote(id, note.trim());
      setNote('');
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this lead permanently?')) return;
    try {
      await api.leads.remove(id);
      navigate('/leads', { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  };

  if (err) return <div className="card card-pad border-red-500/30 text-sm text-red-300">{err}</div>;
  if (!lead) return <div className="text-sm text-ink-400">Loading…</div>;

  return (
    <>
      <PageHeader
        title={lead.name}
        subtitle={`Lead since ${formatDateTime(lead.createdAt)}`}
        actions={
          <>
            <Link to="/leads" className="btn-ghost">
              <FiArrowLeft /> Back
            </Link>
            <button onClick={remove} className="btn-danger">
              <FiTrash2 /> Delete
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card card-pad">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-300">Contact</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field icon={FiMail} label="Email" value={<a className="text-brand-violet hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a>} />
              <Field icon={FiPhone} label="Phone" value={lead.phone || <span className="text-ink-500">—</span>} />
              <Field icon={FiBriefcase} label="Company" value={lead.company || <span className="text-ink-500">—</span>} />
              <Field icon={FiTag} label="Source" value={lead.source} />
            </dl>
            {lead.message && (
              <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-ink-200">
                <div className="mb-1 text-xs uppercase tracking-wider text-ink-400">Initial message</div>
                {lead.message}
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-300">Notes & follow-ups</h3>

            <form onSubmit={addNote} className="mb-4 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a call, follow-up, or quick observation…"
                className="input"
                maxLength={2000}
              />
              <button type="submit" className="btn-primary shrink-0" disabled={busy || !note.trim()}>
                Add
              </button>
            </form>

            {lead.notes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-ink-400">
                No notes yet.
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {[...lead.notes].reverse().map((n) => (
                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="text-sm text-ink-100 whitespace-pre-wrap">{n.body}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-wider text-ink-400">
                        {formatDateTime(n.createdAt)}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card card-pad">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-widest text-ink-300">Status</h3>
              <StatusBadge status={lead.status} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  disabled={busy || lead.status === s}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    lead.status === s
                      ? 'border-brand-violet/40 bg-brand-violet/15 text-white'
                      : 'border-white/10 bg-white/[0.03] text-ink-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card card-pad text-xs text-ink-400">
            <div className="mb-1 uppercase tracking-widest text-ink-300">Last updated</div>
            {formatDateTime(lead.updatedAt)}
          </div>
        </aside>
      </div>
    </>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/5 bg-white/[0.03] text-ink-300">
        <Icon />
      </div>
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider text-ink-400">{label}</dt>
        <dd className="truncate text-sm text-ink-100">{value}</dd>
      </div>
    </div>
  );
}
