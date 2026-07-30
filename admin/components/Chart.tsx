'use client';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  suffix?: string;
}

export function BarChart({ data, title, color = '#ffffff', suffix = '' }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="card">
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-dark-muted">{d.value}{suffix}</span>
            <div className="w-full rounded-t" style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: 2, opacity: 0.7 + (i / data.length) * 0.3 }} />
            <span className="text-xs text-secondary truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  suffix?: string;
}

export function LineChart({ data, title, color = '#ffffff', suffix = '' }: LineChartProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const w = 400;
  const h = 120;
  const pad = 10;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (d.value - min) / range) * (h - pad * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full">
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${title})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={color} />
            <text x={p.x} y={h + 18} textAnchor="middle" className="text-[10px]" fill="#737373">{data[i].label}</text>
            <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[9px]" fill="#a3a3a3">{data[i].value}{suffix}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
