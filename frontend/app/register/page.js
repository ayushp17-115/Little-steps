'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'parent' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      router.push(user.role === 'center' ? '/center/dashboard' : '/browse');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-2 text-2xl font-semibold">Create an account</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Admin accounts aren&apos;t self-registered — they&apos;re created directly for the Little Steps team.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2 rounded-full border border-line bg-paper-raised p-1">
          {['parent', 'center'].map((r) => (
            <button type="button" key={r} onClick={() => update('role', r)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold ${form.role === r ? 'bg-ink text-paper' : 'text-ink-soft'}`}>
              {r === 'parent' ? "I'm a parent" : 'I run a centre'}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Full name</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Email</label>
          <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Phone</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Password</label>
          <input required type="password" minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm" />
        </div>
        {error && <p className="text-sm text-warn">{error}</p>}
        <button disabled={loading} type="submit"
          className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="font-semibold text-ink underline">Log in</Link>
      </p>
    </div>
  );
}
