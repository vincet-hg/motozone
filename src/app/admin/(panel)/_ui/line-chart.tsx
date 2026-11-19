// A small server-rendered line chart: purple gradient line and area with glowing points.
export function LineChart({ points, format }: { points: { label: string; value: number }[]; format: (value: number) => string }) {
  const W = 640;
  const H = 240;
  const pad = { top: 20, right: 16, bottom: 30, left: 56 };
  const max = Math.max(1, ...points.map((p) => p.value));
  const nice = niceMax(max);
  const x = (i: number) => pad.left + (points.length === 1 ? (W - pad.left - pad.right) / 2 : (i * (W - pad.left - pad.right)) / (points.length - 1));
  const y = (v: number) => pad.top + (1 - v / nice) * (H - pad.top - pad.bottom);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1).toFixed(1)} ${H - pad.bottom}L${x(0).toFixed(1)} ${H - pad.bottom}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * nice);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="შემოსავალი თვეების მიხედვით">
      <defs>
        <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#006eff" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#168bff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#168bff" stopOpacity="0" />
        </linearGradient>
        <filter id="chart-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="#16294a" strokeDasharray={t ? "4 6" : undefined} />
          <text x={pad.left - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6b7f9e">
            {format(t)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#chart-area)" />
      <path d={line} fill="none" stroke="url(#chart-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#chart-glow)" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="9" fill="#168bff" opacity="0.2" />
          <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="#050b18" stroke="#38bdf8" strokeWidth="2.5">
            <title>{`${p.label}: ${format(p.value)}`}</title>
          </circle>
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7f9e">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function niceMax(value: number) {
  const step = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= value) return m * step;
  return 10 * step;
}
