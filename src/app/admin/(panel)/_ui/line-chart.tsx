// A small server-rendered line chart: purple gradient line and area with glowing points.
export function LineChart({ points, format }: { points: { label: string; value: number }[]; format: (value: number) => string }) {
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 16, bottom: 30, left: 56 };
  const largest = Math.max(1, ...points.map((point) => point.value));
  const axisTop = roundUpForAxis(largest);
  const plotWidth = width - padding.left - padding.right;
  const xAt = (index: number) => padding.left + (points.length === 1 ? plotWidth / 2 : (index * plotWidth) / (points.length - 1));
  const yAt = (value: number) => padding.top + (1 - value / axisTop) * (height - padding.top - padding.bottom);
  const line = points.map((point, index) => `${index ? "L" : "M"}${xAt(index).toFixed(1)} ${yAt(point.value).toFixed(1)}`).join("");
  const area = `${line}L${xAt(points.length - 1).toFixed(1)} ${height - padding.bottom}L${xAt(0).toFixed(1)} ${height - padding.bottom}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((share) => share * axisTop);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="შემოსავალი თვეების მიხედვით">
      <defs>
        <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e3120b" />
          <stop offset="1" stopColor="#ff5148" />
        </linearGradient>
        <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff2d20" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff2d20" stopOpacity="0" />
        </linearGradient>
        <filter id="chart-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={padding.left} x2={width - padding.right} y1={yAt(tick)} y2={yAt(tick)} stroke="#2a2e37" strokeDasharray={tick ? "4 6" : undefined} />
          <text x={padding.left - 10} y={yAt(tick) + 4} textAnchor="end" fontSize="11" fill="#71717a">
            {format(tick)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#chart-area)" />
      <path d={line} fill="none" stroke="url(#chart-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#chart-glow)" />
      {points.map((point, index) => (
        <g key={point.label}>
          <circle cx={xAt(index)} cy={yAt(point.value)} r="9" fill="#ff2d20" opacity="0.2" />
          <circle cx={xAt(index)} cy={yAt(point.value)} r="4.5" fill="#0b0d10" stroke="#ff5148" strokeWidth="2.5">
            <title>{`${point.label}: ${format(point.value)}`}</title>
          </circle>
          <text x={xAt(index)} y={height - 8} textAnchor="middle" fontSize="11" fill="#71717a">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// The top of the axis: the next round number at or above value (1, 2, 2.5 or 5 times a power of ten).
function roundUpForAxis(value: number) {
  const step = 10 ** Math.floor(Math.log10(value));
  for (const multiple of [1, 2, 2.5, 5, 10]) if (multiple * step >= value) return multiple * step;
  return 10 * step;
}
