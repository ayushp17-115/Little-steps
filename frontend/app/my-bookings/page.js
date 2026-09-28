'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../lib/api';

const STATUS_STYLE = {
  pending: 'bg-warn-soft text-warn',
  accepted: 'bg-sage-soft text-sage',
  declined: 'bg-line text-ink-soft',
};

export default function MyBookingsPage() {
  const { user, token, ready } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !user || user.role !== 'parent') return;
    let cancelled = false;
    api.myBookings(token)
      .then((data) => { if (!cancelled) setBookings(data.bookings); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ready, user, token]);

  if (ready && (!user || user.role !== 'parent')) {
    return <p className="py-16 text-center text-ink-soft">Log in with a parent account to see your requests.</p>;
  }

  return (
    <section className="py-10">
      <h1 className="mb-2 text-2xl font-semibold">My requests</h1>
      <p className="mb-6 text-sm text-ink-soft">Every slot you&apos;ve requested, with live status and check-in/out times.</p>

      {loading && <p className="text-ink-soft">Loading…</p>}
      {error && <p className="text-warn">{error}</p>}
      {!loading && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-soft">
          No requests yet — browse centres to send your first one.
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-4">
            <div>
              <b className="text-sm">{b.center?.name}</b> — {b.serviceType} for {b.childName} ({b.childAge})
              <div className="mt-1 text-xs text-ink-soft">{b.dateNeeded} · {b.timeNeeded}</div>
              {b.notes && <div className="mt-1 text-xs text-ink-soft">Note: {b.notes}</div>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLE[b.status]}`}>{b.status}</span>
              {b.checkInAt && <span className="rounded-full bg-dusk-soft px-2.5 py-1 text-[11px] font-semibold text-[#43508C]">Checked in {new Date(b.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              {b.checkOutAt && <span className="rounded-full bg-dusk-soft px-2.5 py-1 text-[11px] font-semibold text-[#43508C]">Checked out {new Date(b.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
