const STATUS_STYLE = {
  new: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  qualified: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
  converted: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  lost: 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30',
};

export const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_STYLE[status] || STATUS_STYLE.new}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
