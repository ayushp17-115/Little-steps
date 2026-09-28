'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'center') router.push('/center/dashboard');
      else if (user.role === 'admin') router.push('/admin/queue');
      else router.push('/browse');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-2 text-2xl font-semibold">Log in</h1>
      <p className="mb-8 text-sm text-ink-soft">Welcome back to Little Steps.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm" />
        </div>
        {error && <p className="text-sm text-warn">{error}</p>}
        <button disabled={loading} type="submit"
          className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-50">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        No account? <Link href="/register" className="font-semibold text-ink underline">Sign up</Link>
      </p>
    </div>
  );
}
