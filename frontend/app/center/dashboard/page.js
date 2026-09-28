'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { api } from '../../../lib/api';
import { CareClock, coverageLabel, todayStr } from '../../../lib/careClock';

const SERVICES = ['Daycare', 'Crèche', 'Babysitting'];
const AGE_GROUPS = ['Infant (0-1y)', 'Toddler (1-3y)', 'Preschool (3-5y)', 'School age (5+)'];

function emptyForm() {
  return {
    name: '', area: '', services: [], ageGroupsSupported: [], coverageType: '24x7',
    startHour: 19, endHour: 8, capacity: '', priceHour: '', priceDay: '', description: '',
  };
}

export default function CenterDashboardPage() {
  const { user, token, ready } = useAuth();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');

  function load() {
    api.myCenters(token).then((data) => setCenters(data.centers)).finally(() => setLoading(false));
  }
  useEffect(() => { if (ready && user) load(); }, [ready, user]);

  if (ready && (!user || user.role !== 'center')) {
    return <p className="py-16 text-center text-ink-soft">Log in with a center account to manage your listings.</p>;
  }

  function toggle(list, value) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function submitCenter(e) {
    e.preventDefault();
    setFormError('');
    if (form.services.length === 0) { setFormError('Select at least one service.'); return; }
    const coverage = form.coverageType === '24x7'
      ? { type: '24x7' }
      : form.coverageType === 'day'
        ? { type: 'day', startHour: 6, endHour: 20 }
        : { type: 'custom', startHour: Number(form.startHour), endHour: Number(form.endHour) };
    try {
      await api.createCenter({
        name: form.name, area: form.area, services: form.services, ageGroupsSupported: form.ageGroupsSupported,
        coverage, capacity: Number(form.capacity),
        pricingPlans: [
          { name: 'Hourly', price: Number(form.priceHour), unit: 'hour' },
          { name: 'Full day', price: Number(form.priceDay), unit: 'day' },
        ],
        description: form.description,
      }, token);
      setForm(emptyForm());
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <section className="py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My centers</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage listings, caregivers, and verification.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper">
          {showForm ? 'Cancel' : '+ Add a center'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitCenter} className="mb-8 space-y-4 rounded-2xl border border-line bg-paper-raised p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Center name</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Area / city</label>
              <input required value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Services offered</label>
            <div className="flex flex-wrap gap-3 text-sm text-ink-soft">
              {SERVICES.map((s) => (
                <label key={s} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={form.services.includes(s)} onChange={() => setForm((f) => ({ ...f, services: toggle(f.services, s) }))} /> {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Age groups supported</label>
            <div className="flex flex-wrap gap-3 text-sm text-ink-soft">
              {AGE_GROUPS.map((a) => (
                <label key={a} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={form.ageGroupsSupported.includes(a)} onChange={() => setForm((f) => ({ ...f, ageGroupsSupported: toggle(f.ageGroupsSupported, a) }))} /> {a}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Coverage</label>
            <select value={form.coverageType} onChange={(e) => setForm((f) => ({ ...f, coverageType: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
              <option value="24x7">24 × 7</option>
              <option value="day">Daytime only (6 AM – 8 PM)</option>
              <option value="custom">Custom hours</option>
            </select>
          </div>
          {form.coverageType === 'custom' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Start hour (0–23)</label>
                <input type="number" min={0} max={23} value={form.startHour} onChange={(e) => setForm((f) => ({ ...f, startHour: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-soft">End hour (0–23)</label>
                <input type="number" min={0} max={23} value={form.endHour} onChange={(e) => setForm((f) => ({ ...f, endHour: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Capacity (children/day)</label>
              <input required type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Price / hour (₹)</label>
              <input required type="number" min={0} value={form.priceHour} onChange={(e) => setForm((f) => ({ ...f, priceHour: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Price / day (₹)</label>
              <input required type="number" min={0} value={form.priceDay} onChange={(e) => setForm((f) => ({ ...f, priceDay: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 text-sm" rows={3} />
          </div>
          {formError && <p className="text-sm text-warn">{formError}</p>}
          <button type="submit" className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper">List this center</button>
        </form>
      )}

      {loading ? <p className="text-ink-soft">Loading…</p> : centers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-soft">No centres listed yet.</div>
      ) : (
        <div className="space-y-5">
          {centers.map((c) => <CenterCard key={c._id} center={c} token={token} onChange={load} />)}
        </div>
      )}
    </section>
  );
}

function CenterCard({ center, token, onChange }) {
  const [caregivers, setCaregivers] = useState([]);
  const [license, setLicense] = useState('');
  const [notes, setNotes] = useState('');
  const [cgName, setCgName] = useState('');
  const [cgRole, setCgRole] = useState('');
  const [err, setErr] = useState('');

  function loadCaregivers() {
    api.listCaregivers(center._id).then((data) => setCaregivers(data.caregivers));
  }
  useEffect(() => { loadCaregivers(); }, [center._id]);

  async function submitVerification(e) {
    e.preventDefault();
    setErr('');
    if (!license) return;
    try {
      await api.requestVerification(center._id, { licenseNumber: license, notes }, token);
      onChange();
    } catch (e2) { setErr(e2.message); }
  }
  async function addCaregiver(e) {
    e.preventDefault();
    if (!cgName || !cgRole) return;
    await api.addCaregiver({ centerId: center._id, name: cgName, role: cgRole }, token);
    setCgName(''); setCgRole('');
    loadCaregivers();
  }

  const v = center.verification || { status: 'unverified' };

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <CareClock coverage={center.coverage} size={64} />
          <div>
            <h3 className="text-lg font-semibold">{center.name}</h3>
            <p className="text-xs text-ink-soft">{center.area} · {coverageLabel(center.coverage)}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${v.status === 'verified' ? 'bg-sage-soft text-sage' : v.status === 'pending' ? 'bg-warn-soft text-warn' : 'bg-neutral-soft text-neutral'}`}>
          {v.status === 'verified' ? '✓ Verified' : v.status === 'pending' ? 'Verification pending' : v.status === 'rejected' ? 'Verification rejected' : 'Not yet verified'}
        </span>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Verification</h4>
        {v.status === 'verified' ? (
          <p className="text-sm text-ink-soft">Verified by Little Steps · license {v.licenseNumber}{v.reviewNote ? ` · ${v.reviewNote}` : ''}</p>
        ) : v.status === 'pending' ? (
          <p className="text-sm text-ink-soft">Your request is with the Little Steps team. License submitted: {v.licenseNumber}</p>
        ) : (
          <form onSubmit={submitVerification} className="flex flex-wrap gap-2">
            <input placeholder="License / registration number" value={license} onChange={(e) => setLicense(e.target.value)} className="min-w-[180px] flex-1 rounded-lg border border-line px-3 py-2 text-sm" />
            <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-w-[180px] flex-1 rounded-lg border border-line px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-paper">Submit for review</button>
            {err && <p className="w-full text-sm text-warn">{err}</p>}
          </form>
        )}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">Caregivers ({caregivers.length})</h4>
        <div className="mb-3 space-y-1.5">
          {caregivers.map((g) => (
            <div key={g._id} className="flex items-center justify-between border-b border-line py-1.5 text-sm last:border-0">
              <span>{g.name} <span className="text-ink-soft">— {g.role}</span></span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${g.status === 'verified' ? 'bg-sage-soft text-sage' : g.status === 'pending' ? 'bg-warn-soft text-warn' : 'bg-neutral-soft text-neutral'}`}>{g.status}</span>
            </div>
          ))}
        </div>
        <form onSubmit={addCaregiver} className="flex flex-wrap gap-2">
          <input placeholder="Caregiver name" value={cgName} onChange={(e) => setCgName(e.target.value)} className="min-w-[140px] flex-1 rounded-lg border border-line px-3 py-2 text-sm" />
          <input placeholder="Role" value={cgRole} onChange={(e) => setCgRole(e.target.value)} className="min-w-[140px] flex-1 rounded-lg border border-line px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg border border-line px-4 py-2 text-xs font-semibold">+ Add caregiver</button>
        </form>
      </div>
    </div>
  );
}
