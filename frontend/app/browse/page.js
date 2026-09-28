'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { CareClock, coverageLabel } from '../../lib/careClock';

const SERVICES = ['Daycare', 'Crèche', 'Babysitting'];
const AGE_GROUPS = ['Infant (0-1y)', 'Toddler (1-3y)', 'Preschool (3-5y)', 'School age (5+)'];

function VerificationBadge({ status }) {
  const map = {
    verified: 'bg-sage-soft text-sage',
    pending: 'bg-warn-soft text-warn',
    rejected: 'bg-warn-soft text-warn',
    unverified: 'bg-neutral-soft text-neutral',
  };
  const label = {
    verified: '✓ Verified by Little Steps',
    pending: 'Verification pending',
    rejected: 'Verification rejected',
    unverified: 'Not yet verified',
  };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status]}`}>{label[status]}</span>;
}

export default function BrowsePage() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [service, setService] = useState('all');
  const [ageGroup, setAgeGroup] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [coverage247Only, setCoverage247Only] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: show a loading state while filters re-fetch
    setLoading(true);
    setError('');
    const params = {};
    if (service !== 'all') params.service = service;
    if (ageGroup !== 'all') params.ageGroup = ageGroup;
    if (verifiedOnly) params.verifiedOnly = 'true';
    if (coverage247Only) params.coverage247Only = 'true';
    if (q) params.q = q;

    api.listCenters(params)
      .then((data) => { if (!cancelled) setCenters(data.centers); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [service, ageGroup, verifiedOnly, coverage247Only, q]);

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Find a center</h1>
          <p className="mt-1 text-sm text-ink-soft">{loading ? 'Loading…' : `${centers.length} centres match your filters`}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <input placeholder="Search by name or area…" value={q} onChange={(e) => setQ(e.target.value)}
          className="min-w-[220px] flex-1 rounded-lg border border-line bg-paper-raised px-3.5 py-2.5 text-sm" />
        <button onClick={() => setService('all')} className={`rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${service === 'all' ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft'}`}>All services</button>
        {SERVICES.map((s) => (
          <button key={s} onClick={() => setService(s)} className={`rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${service === s ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft'}`}>{s}</button>
        ))}
        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink-soft">
          <option value="all">All age groups</option>
          {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={() => setCoverage247Only(!coverage247Only)} className={`rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${coverage247Only ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft'}`}>24×7 only</button>
        <button onClick={() => setVerifiedOnly(!verifiedOnly)} className={`rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${verifiedOnly ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft'}`}>Verified only</button>
      </div>

      {error && <p className="mb-4 text-sm text-warn">{error}</p>}

      {!loading && centers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-soft">
          <h3 className="mb-1 text-base font-semibold text-ink">No centres match yet</h3>
          <p className="text-sm">Try widening your filters, or check back as more centres join.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {centers.map((c) => {
          const remaining = c.availability?.remaining ?? c.capacity;
          const isFull = c.availability?.isFull;
          return (
            <div key={c._id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <CareClock coverage={c.coverage} size={56} />
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{c.name}</h3>
                  <p className="text-xs text-ink-soft">{c.area}</p>
                  <div className="mt-1.5"><VerificationBadge status={c.verification?.status || 'unverified'} /></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.services?.map((s) => (
                  <span key={s} className="rounded-md bg-dusk-soft px-2 py-1 text-[11px] font-medium text-[#43508C]">{s}</span>
                ))}
              </div>
              {c.description && <p className="line-clamp-2 text-sm text-ink-soft">{c.description}</p>}
              <div className="flex flex-wrap gap-4 border-t border-line pt-3 text-xs text-ink-soft">
                <span className="font-semibold text-ink">{coverageLabel(c.coverage)}</span>
                <span>₹{c.pricingPlans?.[0]?.price ?? '—'}/{c.pricingPlans?.[0]?.unit ?? 'hr'}</span>
                <span className={isFull ? 'font-semibold text-warn' : 'font-semibold text-sage'}>
                  {isFull ? 'Full today' : `${remaining} of ${c.capacity} spots open today`}
                </span>
              </div>
              <Link href={`/centers/${c._id}`} className="mt-auto rounded-lg bg-ink py-2.5 text-center text-sm font-semibold text-paper">
                View & request a slot
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
