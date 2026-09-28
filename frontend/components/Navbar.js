'use client';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const { user, logout, ready } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="14" fill="none" stroke="#152A35" strokeWidth="1.4" />
            <path d="M15 3 A12 12 0 0 1 15 27" fill="none" stroke="#E3A23C" strokeWidth="4.2" strokeLinecap="round" />
            <path d="M15 27 A12 12 0 0 1 15 3" fill="none" stroke="#7C8FC9" strokeWidth="4.2" strokeLinecap="round" />
            <circle cx="15" cy="15" r="2" fill="#152A35" />
          </svg>
          <span className="font-display text-lg font-semibold">
            Little Steps<span className="text-dawn">.</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-soft">
          <Link href="/browse" className="rounded-lg px-3 py-2 hover:bg-line">Find a center</Link>
          {ready && user?.role === 'parent' && (
            <>
              <Link href="/my-bookings" className="rounded-lg px-3 py-2 hover:bg-line">My requests</Link>
            </>
          )}
          {ready && user?.role === 'center' && (
            <>
              <Link href="/center/dashboard" className="rounded-lg px-3 py-2 hover:bg-line">My centers</Link>
              <Link href="/center/requests" className="rounded-lg px-3 py-2 hover:bg-line">Booking requests</Link>
            </>
          )}
          {ready && user?.role === 'admin' && (
            <>
              <Link href="/admin/queue" className="rounded-lg px-3 py-2 hover:bg-line">Verification queue</Link>
              <Link href="/admin/overview" className="rounded-lg px-3 py-2 hover:bg-line">Platform overview</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {ready && user ? (
            <>
              <span className="text-xs text-ink-soft">
                {user.name} · <span className="uppercase">{user.role}</span>
              </span>
              <button onClick={logout} className="rounded-full border border-line px-4 py-2 text-xs font-semibold hover:border-ink">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-line px-4 py-2 text-xs font-semibold hover:border-ink">
                Log in
              </Link>
              <Link href="/register" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
