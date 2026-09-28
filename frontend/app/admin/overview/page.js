'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { api } from '../../../lib/api';

export default function AdminOverviewPage() {
  const { user, token, ready } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && user) api.adminOverview(token).then(setData).finally(() => setLoading(false));
  }, [ready, user]);

  if (ready && (!user || user.role !== 'admin')) {
    return <p className="py-16 text-center text-ink-soft">Admin access only.</p>;
  }
  if (loading || !data) return <p className="py-16 text-center text-ink-soft">Loading…</p>;

  const kpis = [
    ['Registered parents', data.kpis.registeredParents],
    ['Verified centres', `${data.kpis.verifiedCenters} / ${data.kpis.totalCenters}`],
    ['Total booking requests', data.kpis.totalBookingRequests],
    ['Booking conversion rate', `${data.kpis.bookingConversionRate}%`],
    ['Active subscriptions', data.kpis.activeSubscriptions],
  ];

  return (
    <section className="py-10">
      <h1 className="mb-2 text-2xl font-semibold">Platform overview</h1>
      <p className="mb-8 text-sm text-ink-soft">Key metrics across every centre on Little Steps.</p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-paper-raised p-4">
            <div className="font-display text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs text-ink-soft">{label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold">Today&apos;s utilization</h2>
      <div className="overflow-x-auto rounded-xl border border-line bg-paper-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="p-3">Centre</th><th className="p-3">Booked</th><th className="p-3">Capacity</th><th className="p-3">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {data.utilizationToday.map((u) => (
              <tr key={u.centerId} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.reserved}</td>
                <td className="p-3">{u.capacity}</td>
                <td className="p-3">{u.capacity ? Math.round((u.reserved / u.capacity) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
