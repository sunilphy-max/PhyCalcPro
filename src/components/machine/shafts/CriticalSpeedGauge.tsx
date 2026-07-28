"use client";

import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  operatingRpm: number;
  criticalSpeed: number;
  margin: number | null;
  /** Target ω_cr / ω_op (default 1.25) */
  targetMargin?: number;
};

/**
 * One-glance Operating → Critical → Margin gauge for shaft whirling check.
 */
export default function CriticalSpeedGauge({
  operatingRpm,
  criticalSpeed,
  margin,
  targetMargin = 1.25,
}: Props) {
  const hasOp = operatingRpm > 0;
  const hasCr = criticalSpeed > 0;
  const ratio = margin ?? (hasOp && hasCr ? criticalSpeed / operatingRpm : null);

  // Map ratio onto gauge: 0 … 2× target fills the arc; needle at ratio/span
  const span = Math.max(targetMargin * 2, 2);
  const needleT = ratio != null ? Math.min(1, Math.max(0, ratio / span)) : 0;

  const status =
    ratio == null
      ? "n/a"
      : ratio < 1
        ? "critical"
        : ratio < targetMargin
          ? "warning"
          : "safe";

  const statusColor =
    status === "safe" ? "#0369a1" : status === "warning" ? "#d97706" : status === "critical" ? "#dc2626" : "#64748b";

  const cx = 120;
  const cy = 100;
  const r = 78;
  const startAngle = Math.PI;
  const endAngle = 0;
  const needleAngle = startAngle + needleT * (endAngle - startAngle);

  const polar = (ang: number, rad: number) => ({
    x: cx + rad * Math.cos(ang),
    y: cy - rad * Math.sin(ang),
  });

  const arcPath = (a0: number, a1: number, rad: number) => {
    const p0 = polar(a0, rad);
    const p1 = polar(a1, rad);
    const large = a0 - a1 > Math.PI ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${rad} ${rad} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };

  // Zones: red 0–1, amber 1–target, blue target–span
  const aAt = (value: number) => startAngle + (Math.min(value, span) / span) * (endAngle - startAngle);
  const needleTip = polar(needleAngle, r - 6);
  const needleBase = polar(needleAngle, 14);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-900">Critical speed</div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-between">
        <svg viewBox="0 0 240 120" className="mx-auto h-28 w-full max-w-[280px]" role="img" aria-label="Critical speed margin gauge">
          {/* Track */}
          <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="#e2e8f0" strokeWidth={12} strokeLinecap="round" />
          {hasOp && hasCr && (
            <>
              <path
                d={arcPath(aAt(0), aAt(1), r)}
                fill="none"
                stroke="#fecaca"
                strokeWidth={12}
                strokeLinecap="butt"
              />
              <path
                d={arcPath(aAt(1), aAt(targetMargin), r)}
                fill="none"
                stroke="#fde68a"
                strokeWidth={12}
                strokeLinecap="butt"
              />
              <path
                d={arcPath(aAt(targetMargin), aAt(span), r)}
                fill="none"
                stroke="#bae6fd"
                strokeWidth={12}
                strokeLinecap="butt"
              />
              <line
                x1={cx}
                y1={cy}
                x2={needleTip.x}
                y2={needleTip.y}
                stroke={statusColor}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <circle cx={cx} cy={cy} r={5} fill={statusColor} />
              <circle cx={needleBase.x} cy={needleBase.y} r={2} fill={statusColor} />
            </>
          )}
          <text x={cx - r + 4} y={cy + 16} className="fill-slate-400" fontSize={9}>
            0
          </text>
          <text x={cx - 8} y={cy - r + 22} className="fill-slate-400" fontSize={9}>
            {formatDisplayNumber(span / 2)}×
          </text>
          <text x={cx + r - 18} y={cy + 16} className="fill-slate-400" fontSize={9}>
            {formatDisplayNumber(span)}×
          </text>
        </svg>

        <div className="grid w-full grid-cols-3 gap-2 text-center sm:max-w-xs">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Operating
            </div>
            <div className="text-sm font-semibold tabular-nums text-slate-900">
              {hasOp ? formatDisplayNumber(operatingRpm) : "—"}
            </div>
            <div className="text-[10px] text-slate-500">RPM</div>
          </div>
          <div className="border-x border-slate-100 px-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Critical
            </div>
            <div className="text-sm font-semibold tabular-nums text-slate-900">
              {hasCr ? formatDisplayNumber(criticalSpeed) : "—"}
            </div>
            <div className="text-[10px] text-slate-500">RPM</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Margin
            </div>
            <div className="text-sm font-semibold tabular-nums" style={{ color: statusColor }}>
              {ratio != null ? `${formatDisplayNumber(ratio)}×` : "Set RPM"}
            </div>
            <div className="text-[10px] text-slate-500">ωₚᵣ / ωₒₚ</div>
          </div>
        </div>
      </div>
      {!hasOp && (
        <p className="mt-2 text-xs text-slate-500">
          Set operating speed to compute margin against the first critical speed.
        </p>
      )}
    </div>
  );
}
