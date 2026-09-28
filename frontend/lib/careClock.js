export function isHourCovered(hour, coverage) {
  if (!coverage) return false;
  if (coverage.type === '24x7') return true;
  if (coverage.type === 'day') return hour >= coverage.startHour && hour < coverage.endHour;
  const s = coverage.startHour, e = coverage.endHour;
  if (s === e) return true;
  if (s < e) return hour >= s && hour < e;
  return hour >= s || hour < e;
}

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function segPath(cx, cy, rOuter, rInner, a0, a1) {
  const p0o = polar(cx, cy, rOuter, a1), p1o = polar(cx, cy, rOuter, a0);
  const p0i = polar(cx, cy, rInner, a1), p1i = polar(cx, cy, rInner, a0);
  const large = a1 - a0 <= 180 ? 0 : 1;
  return `M ${p0o.x.toFixed(2)} ${p0o.y.toFixed(2)} A ${rOuter} ${rOuter} 0 ${large} 0 ${p1o.x.toFixed(2)} ${p1o.y.toFixed(2)} L ${p1i.x.toFixed(2)} ${p1i.y.toFixed(2)} A ${rInner} ${rInner} 0 ${large} 1 ${p0i.x.toFixed(2)} ${p0i.y.toFixed(2)} Z`;
}

export function coverageLabel(coverage) {
  if (!coverage) return '—';
  if (coverage.type === '24x7') return '24 × 7 coverage';
  const fmt = (h) => {
    const period = h < 12 || h === 24 ? 'AM' : 'PM';
    let hr = h % 12; if (hr === 0) hr = 12;
    return `${hr} ${period}`;
  };
  if (coverage.type === 'day') return `${fmt(coverage.startHour)} – ${fmt(coverage.endHour)}`;
  return `${fmt(coverage.startHour)} – ${fmt(coverage.endHour)} (overnight)`;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function CareClock({ coverage, size = 96, showNow = false }) {
  const cx = size / 2, cy = size / 2, rOuter = size * 0.47, rInner = size * 0.32, gap = 1.1;
  const segs = [];
  for (let h = 0; h < 24; h++) {
    const covered = isHourCovered(h, coverage);
    const color = !covered ? 'var(--clock-off)' : h >= 6 && h < 18 ? 'var(--dawn)' : 'var(--dusk)';
    const a0 = h * 15 + gap / 2, a1 = (h + 1) * 15 - gap / 2;
    segs.push(<path key={h} d={segPath(cx, cy, rOuter, rInner, a0, a1)} fill={color} />);
  }
  let nowDot = null;
  if (showNow) {
    const now = new Date();
    const hourFrac = now.getHours() + now.getMinutes() / 60;
    const pos = polar(cx, cy, (rOuter + rInner) / 2, hourFrac * 15);
    nowDot = <circle cx={pos.x} cy={pos.y} r={size * 0.02} fill="var(--ink)" />;
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Coverage clock">
      <circle cx={cx} cy={cy} r={rInner - 2} fill="var(--paper-raised)" />
      {segs}
      {nowDot}
    </svg>
  );
}
