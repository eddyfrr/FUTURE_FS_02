import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiPlusCircle, FiLogOut, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/leads', label: 'Leads', icon: FiUsers },
  { to: '/leads/new', label: 'New Lead', icon: FiPlusCircle },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(139,92,246,0.15),transparent_60%),radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(236,72,153,0.12),transparent_60%)]" />

      <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 px-4 py-6 md:px-8">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="card sticky top-6 p-5">
            <div className="mb-6 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-pink text-white shadow-glow">
                <span className="font-mono text-sm font-bold">FS</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Mini CRM</div>
                <div className="text-[10px] uppercase tracking-widest text-ink-400">FUTURE_FS_02</div>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-violet/20 to-brand-pink/10 text-white shadow-inner-glow'
                        : 'text-ink-300 hover:bg-white/[0.04] hover:text-white'
                    }`
                  }
                >
                  <Icon className="text-base" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="my-5 h-px bg-white/10" />

            <a
              href="/contact"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-ink-300 hover:bg-white/[0.04] hover:text-white"
            >
              <FiExternalLink /> Public contact form
            </a>

            <div className="mt-6 rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="text-xs text-ink-300">Signed in as</div>
              <div className="truncate text-sm font-medium text-white">{user?.email}</div>
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-ink-200 transition hover:bg-white/[0.08]"
              >
                <FiLogOut /> Log out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-pink text-white">
                <span className="font-mono text-sm font-bold">FS</span>
              </div>
              <div className="text-sm font-semibold text-white">Mini CRM</div>
            </div>
            <button onClick={handleLogout} className="btn-ghost px-3 py-1.5 text-xs">
              <FiLogOut /> Log out
            </button>
          </div>
          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                    isActive
                      ? 'border-brand-violet/40 bg-brand-violet/15 text-white'
                      : 'border-white/10 bg-white/[0.03] text-ink-300'
                  }`
                }
              >
                <Icon /> {label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
