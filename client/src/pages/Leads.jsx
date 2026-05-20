import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlusCircle, FiFilter } from 'react-icons/fi';
import { api } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge, { STATUSES } from '../components/StatusBadge.jsx';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api.leads
        .list({ status: status || undefined, q: q.trim() || undefined })
        .then((rows) => !cancelled && setLeads(rows))
        .catch((e) => !cancelled && setErr(e.message))
        .finally(() => !cancelled && setLoading(false));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [status, q]);

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Search and filter your pipeline."
        actions={
          <Link to="/leads/new" className="btn-primary">
            <FiPlusCircle /> New Lead
          </Link>
        }
      />

      <div className="card mb-4 flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or company…"
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input cursor-pointer pl-10 pr-8"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && <div className="card card-pad mb-4 border-red-500/30 text-sm text-red-300">{err}</div>}

      <div className="card overflow-hidden">
        <div className="hidden border-b border-white/10 bg-white/[0.02] px-5 py-3 text-xs uppercase tracking-wider text-ink-400 md:grid md:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr]">
          <div>Name</div>
          <div>Email</div>
          <div>Source</div>
          <div>Status</div>
          <div className="text-right">Created</div>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-ink-400">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-ink-400">
            No leads match the current filters.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {leads.map((l) => (
              <li key={l.id}>
                <Link
                  to={`/leads/${l.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition hover:bg-white/[0.03] md:grid md:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{l.name}</div>
                    <div className="truncate text-xs text-ink-400 md:hidden">{l.email}</div>
                  </div>
                  <div className="hidden truncate text-sm text-ink-200 md:block">{l.email}</div>
                  <div className="text-xs text-ink-300 md:text-sm">{l.source}</div>
                  <div><StatusBadge status={l.status} /></div>
                  <div className="text-xs text-ink-400 md:text-right">{formatDate(l.createdAt)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
