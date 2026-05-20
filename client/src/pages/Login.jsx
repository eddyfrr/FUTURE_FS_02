import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(139,92,246,0.25),transparent_60%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(236,72,153,0.18),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-pink text-white shadow-glow">
            <span className="font-mono text-base font-bold">FS</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-400">FUTURE_FS_02</div>
            <h1 className="text-xl font-semibold text-white">Mini CRM — Admin Sign in</h1>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : (<>Sign in <FiArrowRight /></>)}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Default credentials seeded on first boot. Change them via the <code className="font-mono text-ink-300">ADMIN_EMAIL</code> / <code className="font-mono text-ink-300">ADMIN_PASSWORD</code> env vars.
        </p>
      </motion.div>
    </div>
  );
}
