export function BarChart({
  data,
  color = '#1d72f5',
  height = 200,
  unit = '',
  horizontal = false,
}: {
  data: { label: string; count: number }[];
  color?: string;
  height?: number;
  unit?: string;
  horizontal?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  if (horizontal) {
    return (
      <div className="flex flex-col gap-2.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-32 shrink-0 truncate text-xs font-medium text-ink-600 text-right">{d.label}</div>
            <div className="flex-1 h-6 bg-ink-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center justify-end px-2 transition-all duration-700"
                style={{ width: `${(d.count / max) * 100}%`, background: color, minWidth: '2px' }}
              >
                <span className="text-[10px] font-bold text-white">
                  {d.count}
                  {unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
          <span className="text-[10px] font-bold text-ink-600">{d.count}{unit}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-700 hover:opacity-80"
            style={{ height: `${(d.count / max) * (height - 28)}px`, background: color, minHeight: '4px' }}
          />
          <span className="text-[10px] font-medium text-ink-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({
  data,
  color = '#1d72f5',
  height = 220,
  unit = '',
  showDots = true,
  predictedFromIndex,
}: {
  data: { label: string; count: number }[];
  color?: string;
  height?: number;
  unit?: string;
  showDots?: boolean;
  predictedFromIndex?: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const min = 0;
  const range = max - min || 1;
  const w = 600;
  const h = height - 30;
  const padding = 10;
  const pts = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - ((d.count - min) / range) * (h - padding * 2) - padding;
    return { x, y, ...d };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;
  const gradId = `grad-${color.replace('#', '')}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={w - padding}
            y1={padding + f * (h - padding * 2)}
            y2={padding + f * (h - padding * 2)}
            stroke="#eceef2"
            strokeWidth="1"
          />
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} />
        {predictedFromIndex !== undefined && predictedFromIndex > 0 && (
          <path
            d={pts.slice(predictedFromIndex - 1).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.6"
          />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {showDots &&
          pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
            </g>
          ))}
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-ink-400">
            {d.label}
          </span>
        ))}
      </div>
      {unit && <div className="sr-only">Values in {unit}</div>}
    </div>
  );
}

export function DonutChart({
  data,
  size = 180,
}: {
  data: { label: string; count: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const radius = size / 2 - 12;
  const innerRadius = radius * 0.62;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -Math.PI / 2;

  const segments = data.map((d) => {
    const pct = d.count / total;
    const startAngle = angle;
    const endAngle = angle + pct * Math.PI * 2;
    angle = endAngle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    return { path, color: d.color, label: d.label, count: d.count, pct };
  });

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg width={size} height={size} className="shrink-0">
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} className="transition-opacity hover:opacity-80" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-ink-900 font-display font-bold" fontSize="22">
          {total.toLocaleString()}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-ink-400" fontSize="10">
          Total
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
            <span className="font-medium text-ink-700">{s.label}</span>
            <span className="text-ink-400">
              {s.count} · {Math.round(s.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = '#1d72f5',
  height = 8,
  showLabel = false,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      <div className="w-full rounded-full bg-ink-100 overflow-hidden" style={{ height }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs font-medium text-ink-500">{Math.round(pct)}%</div>
      )}
    </div>
  );
}

export function RadialProgress({
  value,
  max = 100,
  size = 120,
  color = '#1d72f5',
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const pct = Math.min(1, value / max);
  const radius = size / 2 - 10;
  const circ = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#eceef2" strokeWidth="8" />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold text-ink-900">{Math.round(pct * 100)}%</span>
        {label && <span className="text-[10px] font-medium text-ink-400">{label}</span>}
      </div>
    </div>
  );
}
