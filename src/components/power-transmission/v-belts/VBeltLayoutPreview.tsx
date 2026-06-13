"use client";

type Props = {
  centerDistance: number;
  driverDiameter: number;
  drivenDiameter: number;
  wrapAngleDriverDeg: number;
  lengthUnit?: string;
};

export default function VBeltLayoutPreview({
  centerDistance,
  driverDiameter,
  drivenDiameter,
  wrapAngleDriverDeg,
  lengthUnit = "m",
}: Props) {
  const cx1 = 90;
  const cy = 110;
  const cx2 = 270;
  const r1 = Math.max(18, Math.min(42, driverDiameter * 800));
  const r2 = Math.max(22, Math.min(52, drivenDiameter * 800));

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-export-diagram="true"
      data-export-caption="V-belt drive layout"
      role="img"
      aria-label={`V-belt drive with center distance ${centerDistance} ${lengthUnit} and driver wrap ${wrapAngleDriverDeg.toFixed(0)} degrees.`}
    >
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Drive layout</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        C = {centerDistance.toFixed(3)} {lengthUnit} · θ₁ = {wrapAngleDriverDeg.toFixed(0)}°
      </p>
      <svg viewBox="0 0 360 200" className="mt-3 h-auto w-full" aria-hidden="true">
        <circle cx={cx1} cy={cy} r={r1} fill="none" stroke="#1d4ed8" strokeWidth="3" />
        <circle cx={cx2} cy={cy} r={r2} fill="none" stroke="#7c3aed" strokeWidth="3" />
        <line
          x1={cx1 + r1 * 0.7}
          y1={cy - r1 * 0.7}
          x2={cx2 - r2 * 0.7}
          y2={cy - r2 * 0.7}
          stroke="#0f766e"
          strokeWidth="4"
        />
        <line
          x1={cx1 + r1 * 0.7}
          y1={cy + r1 * 0.7}
          x2={cx2 - r2 * 0.7}
          y2={cy + r2 * 0.7}
          stroke="#0f766e"
          strokeWidth="4"
        />
        <text x={cx1 - 10} y={cy + r1 + 18} className="fill-slate-600 text-[11px]">
          Driver
        </text>
        <text x={cx2 - 16} y={cy + r2 + 18} className="fill-slate-600 text-[11px]">
          Driven
        </text>
      </svg>
    </div>
  );
}
