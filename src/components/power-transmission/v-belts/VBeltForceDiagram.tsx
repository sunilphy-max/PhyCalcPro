"use client";

type Props = {
  tightSideN: number;
  slackSideN: number;
  radialLoadN: number;
  wrapAngleDeg: number;
};

export default function VBeltForceDiagram({
  tightSideN,
  slackSideN,
  radialLoadN,
  wrapAngleDeg,
}: Props) {
  const cx = 180;
  const cy = 120;
  const r = 55;
  const wrapRad = (wrapAngleDeg * Math.PI) / 180;
  const start = -Math.PI / 2 - wrapRad / 2;
  const end = -Math.PI / 2 + wrapRad / 2;

  const tightEnd = { x: cx + r * Math.cos(start), y: cy + r * Math.sin(start) };
  const slackEnd = { x: cx + r * Math.cos(end), y: cy + r * Math.sin(end) };

  const scale = 0.035;
  const tLen = Math.min(90, tightSideN * scale);
  const sLen = Math.min(70, slackSideN * scale);

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-export-diagram="true"
      data-export-caption="V-belt tension diagram (driver pulley)"
      role="img"
      aria-label={`Belt tensions T1 ${tightSideN.toFixed(0)} N, T2 ${slackSideN.toFixed(0)} N, shaft load ${radialLoadN.toFixed(0)} N.`}
    >
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Belt forces (driver)</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        T₁ = {tightSideN.toFixed(0)} N · T₂ = {slackSideN.toFixed(0)} N · Fᵣ = {radialLoadN.toFixed(0)} N
      </p>
      <svg viewBox="0 0 360 220" className="mt-3 h-auto w-full" aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1d4ed8" strokeWidth="3" />
        <path
          d={`M ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)} A ${r} ${r} 0 ${wrapRad > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)}`}
          fill="none"
          stroke="#0f766e"
          strokeWidth="5"
        />
        <line
          x1={tightEnd.x}
          y1={tightEnd.y}
          x2={tightEnd.x - tLen * Math.cos(start)}
          y2={tightEnd.y - tLen * Math.sin(start)}
          stroke="#dc2626"
          strokeWidth="3"
          markerEnd="url(#arrowRed)"
        />
        <line
          x1={slackEnd.x}
          y1={slackEnd.y}
          x2={slackEnd.x - sLen * Math.cos(end)}
          y2={slackEnd.y - sLen * Math.sin(end)}
          stroke="#2563eb"
          strokeWidth="3"
          markerEnd="url(#arrowBlue)"
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy + 70}
          stroke="#7c2d12"
          strokeWidth="2"
          strokeDasharray="4 3"
          markerEnd="url(#arrowBrown)"
        />
        <defs>
          <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626" />
          </marker>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb" />
          </marker>
          <marker id="arrowBrown" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#7c2d12" />
          </marker>
        </defs>
        <text x={tightEnd.x - tLen - 8} y={tightEnd.y - tLen * Math.sin(start) - 6} className="fill-red-600 text-[11px]">
          T₁
        </text>
        <text x={slackEnd.x + 6} y={slackEnd.y + 14} className="fill-blue-600 text-[11px]">
          T₂
        </text>
        <text x={cx + 8} y={cy + 82} className="fill-amber-900 text-[11px]">
          Fᵣ
        </text>
      </svg>
    </div>
  );
}
