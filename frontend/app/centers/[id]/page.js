'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';
import { CareClock, coverageLabel, todayStr } from '../../../lib/careClock';

export default function CenterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [center, setCenter] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    childName: '', childAge: '', serviceType: '', dateNeeded: todayStr(), timeNeeded: '', notes: '',
  });
  const [availNote, setAvailNote] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCenter(id, form.dateNeeded).then((data) => {
      setCenter(data.center);
      setForm((f) => ({ ...f, serviceType: f.serviceType || data.center.services?.[0] || '' }));
      setAvailNote(data.center.availability);
    }).finally(() => setLoading(false));
    api.listCaregivers(id).then((data) => setCaregivers(data.caregivers)).catch(() => {});
  }, [id]);

  async function onDateChange(date) {
    setForm((f) => ({ ...f, dateNeeded: date }));
    const data = await api.getCenter(id, date);
    setAvailNote(data.center.availability);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'parent') { setError('Only parent accounts can request a slot.'); return; }
    setSubmitting(true);
    try {
      await api.createBooking({ centerId: id, ...form }, token);
      setSuccess('Request sent! You can track its status from My Requests.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="py-16 text-center text-ink-soft">Loading…</p>;
  if (!center) return <p className="py-16 text-center text-warn">Center not found.</p>;

  const verifiedCaregivers = caregivers.filter((g) => g.status === 'verified').length;

  return (
    <section className="py-10">
      <div className="grid gap-10 md:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 flex items-start gap-5">
            <CareClock coverage={center.coverage} size={88} />
            <div>
              <h1 className="text-2xl font-semibold">{center.name}</h1>
              <p className="text-sm text-ink-soft">{center.area}</p>
              <p className="mt-1 text-sm font-semibold">{coverageLabel(center.coverage)}</p>
            </div>
          </div>

          <p className="mb-6 leading-relaxed text-ink-soft">{center.description}</p>

          <div className="mb-6 flex flex-wrap gap-2">
            {center.services?.map((s) => (
              <span key={s} className="rounded-md bg-dusk-soft px-2.5 py-1 text-xs font-medium text-[#43508C]">{s}</span>
            ))}
          </div>

          {center.ageGroupsSupported?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Age groups supported</h3>
              <div className="flex flex-wrap gap-2">
                {center.ageGroupsSupported.map((a) => (
                  <span key={a} className="rounded-md bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage">{a}</span>
                ))}
              </div>
            </div>
          )}

          {center.pricingPlans?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Pricing</h3>
              <div className="space-y-1.5 text-sm text-ink-soft">
                {center.pricingPlans.map((p, i) => <div key={i}>{p.name}: ₹{p.price}/{p.unit}</div>)}
              </div>
            </div>
          )}

          <div className="mb-2">
            <h3 className="mb-2 text-sm font-semibold">Caregivers ({caregivers.length})</h3>
            <p className="mb-2 text-xs text-ink-soft">{verifiedCaregivers} of {caregivers.length} individually verified by the Little Steps team</p>
            <div className="space-y-2">
              {caregivers.map((g) => (
                <div key={g._id} className="flex items-center justify-between rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm">
                  <span>{g.name} <span className="text-ink-soft">— {g.role}</span></span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${g.status === 'verified' ? 'bg-sage-soft text-sage' : g.status === 'pending' ? 'bg-warn-soft text-warn' : 'bg-neutral-soft text-neutral'}`}>
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="h-fit space-y-4 rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Request a slot</h2>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Child&apos;s name</label>
            <input required value={form.childName} onChange={(e) => setForm((f) => ({ ...f, childName: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Child&apos;s age</label>
            <input required value={form.childAge} onChange={(e) => setForm((f) => ({ ...f, childAge: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Service</label>
            <select value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm">
              {center.services?.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Date needed</label>
            <input required type="date" min={todayStr()} value={form.dateNeeded} onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            {availNote && (
              <p className={`mt-1.5 text-xs font-medium ${availNote.isFull ? 'text-warn' : 'text-sage'}`}>
                {availNote.isFull ? `Fully booked on ${form.dateNeeded}` : `${availNote.remaining} of ${availNote.capacity} spots open`}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Preferred time window</label>
            <input required placeholder="e.g. 9 PM – 7 AM, or 24×7" value={form.timeNeeded} onChange={(e) => setForm((f) => ({ ...f, timeNeeded: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm" rows={3} />
          </div>
          {error && <p className="text-sm text-warn">{error}</p>}
          {success && <p className="text-sm text-sage">{success}</p>}
          <button disabled={submitting || availNote?.isFull} type="submit"
            className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-50">
            {submitting ? 'Sending…' : availNote?.isFull ? 'Fully booked for this date' : 'Send request'}
          </button>
          {!user && <p className="text-center text-xs text-ink-soft">You&apos;ll be asked to log in to send a request.</p>}
        </form>
      </div>
    </section>
  );
}
