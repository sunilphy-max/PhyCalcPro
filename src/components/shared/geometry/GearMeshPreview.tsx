"use client";

/**
 * Schematic spur gear mesh: pitch circles to scale, center distance,
 * and key dimensions. Pure SVG in the style of BeamDiagram.
 */
type Props = {
  /** Module (mm) */
  moduleMm: number;
  pinionTeeth: number;
  gearTeeth: number;
  /** Face width (mm), shown as label only */
  faceWidthMm?: number;
};

export default function GearMeshPreview({ moduleMm, pinionTeeth, gearTeeth, faceWidthMm }: Props) {
  const d1 = moduleMm * pinionTeeth;
  const d2 = moduleMm * gearTeeth;
  const centerDistance = (d1 + d2) / 2;

  const width = 600;
  const height = 230;
  const pad = 30;

  const totalSpan = d1 / 2 + centerDistance + d2 / 2;
  const scale = (width - 2 * pad) / Math.max(totalSpan, 1);
  const cy = height / 2;
  const r1 = (d1 / 2) * scale;
  const r2 = (d2 / 2) * scale;
  const cx1 = pad + r1;
  const cx2 = cx1 + centerDistance * scale;

  const tickEvery1 = Math.max(1, Math.round(pinionTeeth / 24));
  const tickEvery2 = Math.max(1, Math.round(gearTeeth / 36));

  const teethTicks = (cx: number, r: number, count: number, every: number) => {
    const ticks: React.ReactNode[] = [];
    const toothH = Math.min(8, Math.max(3, r * 0.12));
    for (let i = 0; i < count; i += every) {
      const angle = (i / count) * 2 * Math.PI;
      const x1 = cx + (r - toothH / 2) * Math.cos(angle);
      const y1 = cy + (r - toothH / 2) * Math.sin(angle);
      const x2 = cx + (r + toothH / 2) * Math.cos(angle);
      const y2 = cy + (r + toothH / 2) * Math.sin(angle);
      ticks.push(<line key={`${cx}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={1} />);
    }
    return ticks;
  };

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      data-export-diagram="true"
      data-export-caption={`Gear mesh schematic — m = ${moduleMm} mm, z1 = ${pinionTeeth}, z2 = ${gearTeeth}`}
    >
      <div className="mb-2 text-sm font-semibold text-slate-900">Gear mesh schematic</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gear mesh schematic">
        {/* Pitch circles */}
        <circle cx={cx1} cy={cy} r={r1} fill="rgba(29,78,216,0.06)" stroke="#1d4ed8" strokeWidth={1.5} />
        <circle cx={cx2} cy={cy} r={r2} fill="rgba(147,51,234,0.05)" stroke="#9333ea" strokeWidth={1.5} />
        {teethTicks(cx1, r1, pinionTeeth, tickEvery1)}
        {teethTicks(cx2, r2, gearTeeth, tickEvery2)}
        {/* Centers and center line */}
        <line x1={cx1} y1={cy} x2={cx2} y2={cy} stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 4" />
        <circle cx={cx1} cy={cy} r={3} fill="#1d4ed8" />
        <circle cx={cx2} cy={cy} r={3} fill="#9333ea" />
        {/* Pitch point */}
        <circle cx={cx1 + r1} cy={cy} r={3.5} fill="#dc2626" />
        {/* Labels */}
        <text x={cx1} y={cy - r1 - 8} textAnchor="middle" className="fill-slate-700" fontSize={11}>
          Pinion z₁ = {pinionTeeth}, d₁ = {d1.toFixed(0)} mm
        </text>
        <text x={cx2} y={cy - r2 - 8} textAnchor="middle" className="fill-slate-700" fontSize={11}>
          Gear z₂ = {gearTeeth}, d₂ = {d2.toFixed(0)} mm
        </text>
        <text x={(cx1 + cx2) / 2} y={cy + 16} textAnchor="middle" className="fill-slate-500" fontSize={10}>
          a = {centerDistance.toFixed(1)} mm
        </text>
      </svg>
      <p className="mt-1 text-xs text-slate-500">
        Module {moduleMm} mm{faceWidthMm ? `, face width ${faceWidthMm} mm` : ""}; pitch circles drawn to
        scale, red dot marks the pitch point.
      </p>
    </div>
  );
}
