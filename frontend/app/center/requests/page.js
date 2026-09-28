'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { api } from '../../../lib/api';

export default function CenterRequestsPage() {
  const { user, token, ready } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.bookingsForMyCenters(token).then((data) => setBookings(data.bookings)).finally(() => setLoading(false));
  }
  useEffect(() => { if (ready && user) load(); }, [ready, user]);

  if (ready && (!user || user.role !== 'center')) {
    return <p className="py-16 text-center text-ink-soft">Log in with a center account to see booking requests.</p>;
  }

  async function respond(id, status) {
    await api.respondBooking(id, status, token);
    load();
  }
  async function checkIn(id) { await api.checkIn(id, token); load(); }
  async function checkOut(id) { await api.checkOut(id, token); load(); }

  return (
    <section className="py-10">
      <h1 className="mb-2 text-2xl font-semibold">Booking requests</h1>
      <p className="mb-6 text-sm text-ink-soft">Requests sent to your centres, plus daily check-in / check-out.</p>

      {loading ? <p className="text-ink-soft">Loading…</p> : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-soft">No requests yet.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-4">
              <div>
                <b className="text-sm">{b.parent?.name}</b> requests {b.serviceType} for {b.childName} ({b.childAge}) at {b.center?.name}
                <div className="mt-1 text-xs text-ink-soft">{b.dateNeeded} · {b.timeNeeded} · {b.parent?.phone}</div>
                {b.notes && <div className="mt-1 text-xs text-ink-soft">Note: {b.notes}</div>}
                {b.checkInAt && <div className="mt-1 text-xs text-ink-soft">Checked in: {new Date(b.checkInAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>}
                {b.checkOutAt && <div className="mt-1 text-xs text-ink-soft">Checked out: {new Date(b.checkOutAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => respond(b._id, 'accepted')} className="rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white">Accept</button>
                    <button onClick={() => respond(b._id, 'declined')} className="rounded-lg border border-warn-soft px-3 py-1.5 text-xs font-semibold text-warn">Decline</button>
                  </>
                )}
                {b.status === 'accepted' && !b.checkInAt && (
                  <button onClick={() => checkIn(b._id)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">Check in</button>
                )}
                {b.status === 'accepted' && b.checkInAt && !b.checkOutAt && (
                  <button onClick={() => checkOut(b._id)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">Check out</button>
                )}
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${b.status === 'accepted' ? 'bg-sage-soft text-sage' : b.status === 'declined' ? 'bg-line text-ink-soft' : 'bg-warn-soft text-warn'}`}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
