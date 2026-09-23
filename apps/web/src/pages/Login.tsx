import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Topbar } from '../components/layout';
import { Card } from '../components/ui';
import { api, isAuthed } from '../lib/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@pulseflow.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthed()) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const j = await api.login(email.trim(), password);
      localStorage.setItem('pf_token', j.token);
      navigate('/', { replace: true });
    } catch {
      setError('Login failed — check email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <Card>
        <div className="text-2xl font-extrabold">Welcome back <span className="pf-gradient-text">to PulseFlow</span></div>
        <div className="text-sm text-white/50 mt-1">demo@pulseflow.io / password123</div>
        <form onSubmit={submit}>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@team.io" aria-label="Email" className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={8} placeholder="••••••••" aria-label="Password" className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
          {error && <div role="alert" className="mt-2 text-sm text-[#FF5C7A]">{error}</div>}
          <button type="submit" disabled={busy} className="mt-3 w-full py-2 rounded-xl font-semibold bg-gradient-to-r from-[#6C5CFF] to-[#00E5CC] text-black disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </Card>
    </div>
  );
}
