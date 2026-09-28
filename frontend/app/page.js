'use client';
import Link from 'next/link';
import { CareClock } from '../lib/careClock';

export default function HomePage() {
  return (
    <section className="py-14">
      <div className="grid items-center gap-14 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-sage">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />
            Live coverage, every hour of the day
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05]">
            Childcare that keeps<br /><span className="text-dawn">your</span> hours.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Little Steps connects parents with verified daycare centres, crèches, and babysitters offering
            round-the-clock, transparent, flexible care — with every centre and caregiver reviewed by our
            team before they earn a verified badge.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/browse" className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper hover:shadow-lg">
              Find care near you →
            </Link>
            <Link href="/register" className="rounded-xl border border-line px-6 py-3 text-sm font-semibold hover:border-ink">
              List your centre
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <CareClock coverage={{ type: '24x7' }} size={260} showNow />
        </div>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {[
          ['01 — VERIFIED', 'Checked by us, not by them', 'Centres and individual caregivers are reviewed by the Little Steps team before earning a verified badge — not self-certified.'],
          ['02 — ROUND-THE-CLOCK', 'Care on your schedule', 'Filter by day-only, overnight, or full 24×7 coverage — built for rotating shifts and late finishes.'],
          ['03 — ACCOUNTABLE', 'Real capacity, real check-ins', "Bookings are capped to a centre's actual daily capacity, and every drop-off and pickup is logged."],
        ].map(([num, title, body]) => (
          <div key={num} className="bg-paper-raised p-6">
            <div className="mb-2 font-mono text-xs font-medium text-dawn">{num}</div>
            <h3 className="mb-1.5 text-lg font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
