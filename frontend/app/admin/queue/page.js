'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { api } from '../../../lib/api';

export default function AdminQueuePage() {
  const { user, token, ready } = useAuth();
  const [centers, setCenters] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  function load() {
    api.adminQueue(token).then((data) => {
      setCenters(data.pendingCenters);
      setCaregivers(data.pendingCaregivers);
    }).finally(() => setLoading(false));
  }
  useEffect(() => { if (ready && user) load(); }, [ready, user]);

  if (ready && (!user || user.role !== 'admin')) {
    return <p className="py-16 text-center text-ink-soft">Admin access only.</p>;
  }

  async function reviewCenter(id, decision) {
    await api.reviewCenter(id, { decision, reviewNote: notes[id] || '' }, token);
    load();
  }
  async function reviewCaregiver(id, decision) {
    await api.reviewCaregiver(id, { decision }, token);
    load();
  }

  return (
    <section className="py-10">
      <h1 className="mb-2 text-2xl font-semibold">Verification queue</h1>
      <p className="mb-8 text-sm text-ink-soft">Review centre and caregiver requests before they go live to parents.</p>

      <h2 className="mb-3 text-sm font-semibold">Centres awaiting review ({centers.length})</h2>
      {loading ? <p className="text-ink-soft">Loading…</p> : centers.length === 0 ? (
        <div className="mb-8 rounded-xl border border-dashed border-line py-10 text-center text-sm text-ink-soft">Nothing pending.</div>
      ) : (
        <div className="mb-10 space-y-3">
          {centers.map((c) => (
            <div key={c._id} className="rounded-xl border border-line bg-paper-raised p-4">
              <b className="text-sm">{c.name}</b> — {c.area} <span className="text-ink-soft">(owner: {c.owner?.name})</span>
              <p className="mt-1 text-xs text-ink-soft">License: {c.verification?.licenseNumber || '—'}{c.verification?.notes ? ` · ${c.verification.notes}` : ''}</p>
              <textarea placeholder="Review note (visible to the centre once decided)" value={notes[c._id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [c._id]: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm" rows={2} />
              <div className="mt-2 flex gap-2">
                <button onClick={() => reviewCenter(c._id, 'verified')} className="rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white">Approve</button>
                <button onClick={() => reviewCenter(c._id, 'rejected')} className="rounded-lg border border-warn-soft px-3 py-1.5 text-xs font-semibold text-warn">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold">Caregivers awaiting review ({caregivers.length})</h2>
      {!loading && caregivers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-ink-soft">Nothing pending.</div>
      ) : (
        <div className="space-y-3">
          {caregivers.map((g) => (
            <div key={g._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-4">
              <span className="text-sm"><b>{g.name}</b> — {g.role} at {g.center?.name}</span>
              <div className="flex gap-2">
                <button onClick={() => reviewCaregiver(g._id, 'verified')} className="rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white">Approve</button>
                <button onClick={() => reviewCaregiver(g._id, 'rejected')} className="rounded-lg border border-warn-soft px-3 py-1.5 text-xs font-semibold text-warn">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
