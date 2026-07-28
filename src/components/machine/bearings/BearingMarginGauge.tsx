"use client";

type Props = {
  label: string;
  value: number | null;
  /** Target threshold (SF ≥ target is good; if invert, value ≤ target is good). */
  target: number;
  invert?: boolean;
  format?: (v: number) => string;
};

/** Compact arc-style margin gauge for decision dashboard. */
export default function BearingMarginGauge({
  label,
  value,
  target,
  invert = false,
  format = (v) => v.toFixed(2),
}: Props) {
  const status =
    value == null || !Number.isFinite(value)
      ? "n/a"
      : invert
        ? value > 1
          ? "critical"
          : value > target
            ? "warning"
            : "safe"
        : value < 1
          ? "critical"
          : value < target
            ? "warning"
            : "safe";

  const color =
    status === "safe" ? "#059669" : status === "warning" ? "#d97706" : status === "critical" ? "#dc2626" : "#94a3b8";

  const span = invert ? Math.max(target * 2, 1.5) : Math.max(target * 2, 2);
  const needleT =
    value == null || !Number.isFinite(value)
      ? 0
      : invert
        ? Math.min(1, Math.max(0, 1 - value / span))
        : Math.min(1, Math.max(0, value / span));

  const cx = 70;
  const cy = 58;
  const r = 42;
  const start = Math.PI;
  const end = 0;
  const ang = start + needleT * (end - start);
  const polar = (a: number, rad: number) => ({
    x: cx + rad * Math.cos(a),
    y: cy - rad * Math.sin(a),
  });
  const p0 = polar(start, r);
  const p1 = polar(end, r);
  const needle = polar(ang, r - 4);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-2 py-2 text-center dark:border-slate-700 dark:bg-slate-950/40">
      <svg viewBox="0 0 140 78" className="mx-auto h-16 w-full max-w-[140px]" aria-hidden>
        <path
          d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${needleT * Math.PI * r} ${Math.PI * r}`}
        />
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3.5" fill={color} />
      </svg>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
        {value == null || !Number.isFinite(value) ? "—" : format(value)}
      </p>
    </div>
  );
}
