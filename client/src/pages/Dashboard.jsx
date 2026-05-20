import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlusCircle } from 'react-icons/fi';
import { api } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge, { STATUSES } from '../components/StatusBadge.jsx';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api.leads.stats(), api.leads.list()])
      .then(([s, leads]) => {
        setStats(s);
        setRecent(leads.slice(0, 5));
      })
      .catch((e) => setErr(e.message));
  }, []);

  const tiles = stats
    ? [
        { label: 'Total leads', value: stats.total, accent: 'from-white/10 to-white/5' },
        ...STATUSES.map((s) => ({ label: s, value: stats[s], status: s })),
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of inbound leads and pipeline status."
        actions={
          <Link to="/leads/new" className="btn-primary">
            <FiPlusCircle /> New Lead
          </Link>
        }
      />

      {err && <div className="card card-pad mb-6 border-red-500/30 text-sm text-red-300">{err}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="card card-pad"
          >
            <div className="text-xs uppercase tracking-wider text-ink-400">{t.label}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-2xl font-semibold text-white">{t.value ?? 0}</div>
              {t.status && <StatusBadge status={t.status} />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 card">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-base font-semibold text-white">Recent leads</h2>
          <Link to="/leads" className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-white">
            View all <FiArrowRight />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-ink-400">
            No leads yet. Submit one through <Link to="/contact" className="text-brand-violet underline">the public form</Link> or{' '}
            <Link to="/leads/new" className="text-brand-violet underline">add manually</Link>.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {recent.map((l) => (
              <li key={l.id}>
                <Link
                  to={`/leads/${l.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{l.name}</div>
                    <div className="truncate text-xs text-ink-400">{l.email} · {l.source}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={l.status} />
                    <span className="hidden text-xs text-ink-400 md:inline">{formatDate(l.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
