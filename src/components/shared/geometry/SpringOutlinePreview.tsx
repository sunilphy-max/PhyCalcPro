"use client";

/**
 * Helical compression spring outline: coil profile to scale with wire
 * diameter, mean diameter and free length callouts. Pure SVG.
 */
type Props = {
  /** Wire diameter (display units) */
  wireDiameter: number;
  /** Mean coil diameter (same units) */
  meanDiameter: number;
  activeCoils: number;
  /** Free length (same units) */
  freeLength: number;
  unit?: string;
};

export default function SpringOutlinePreview({
  wireDiameter,
  meanDiameter,
  activeCoils,
  freeLength,
  unit = "mm",
}: Props) {
  const width = 600;
  const height = 240;
  const pad = 46;

  const totalCoils = Math.max(2, Math.round(activeCoils) + 2); // incl. end coils
  const drawW = width - 2 * pad;
  const drawH = height - 2 * pad;

  const scale = Math.min(drawH / Math.max(freeLength, 1e-9), drawW / Math.max(meanDiameter * 2.5, 1e-9));
  const springH = freeLength * scale;
  const coilR = (meanDiameter / 2) * scale;
  const wireR = Math.max(1.5, (wireDiameter / 2) * scale);
  const cx = width / 2;
  const top = (height - springH) / 2;
  const pitch = springH / totalCoils;

  // Coil rendered as a sequence of S-curves viewed from the side
  const segments: string[] = [`M ${cx - coilR} ${top}`];
  for (let i = 0; i < totalCoils; i += 1) {
    const y0 = top + i * pitch;
    const yMid = y0 + pitch / 2;
    const y1 = y0 + pitch;
    segments.push(
      `C ${cx + coilR * 1.4} ${y0}, ${cx + coilR * 1.4} ${yMid}, ${cx} ${yMid}`,
      `C ${cx - coilR * 1.4} ${yMid}, ${cx - coilR * 1.4} ${y1}, ${cx - coilR} ${y1}`
    );
  }
  const coilPath = segments.join(" ");

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      data-export-diagram="true"
      data-export-caption={`Spring outline — d = ${wireDiameter} ${unit}, D = ${meanDiameter} ${unit}, L0 = ${freeLength} ${unit}`}
    >
      <div className="mb-2 text-sm font-semibold text-slate-900">Spring outline</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Compression spring outline">
        {/* Ground plates */}
        <rect x={cx - coilR * 1.7} y={top - 8} width={coilR * 3.4} height={5} fill="#cbd5e1" />
        <rect x={cx - coilR * 1.7} y={top + springH + 3} width={coilR * 3.4} height={5} fill="#cbd5e1" />
        {/* Coil */}
        <path d={coilPath} fill="none" stroke="#1d4ed8" strokeWidth={wireR * 2} strokeLinecap="round" opacity={0.9} />
        {/* Free length dimension */}
        <line x1={cx + coilR * 1.8} y1={top} x2={cx + coilR * 1.8} y2={top + springH} stroke="#64748b" strokeWidth={1} />
        <line x1={cx + coilR * 1.7} y1={top} x2={cx + coilR * 1.9} y2={top} stroke="#64748b" strokeWidth={1} />
        <line x1={cx + coilR * 1.7} y1={top + springH} x2={cx + coilR * 1.9} y2={top + springH} stroke="#64748b" strokeWidth={1} />
        <text x={cx + coilR * 1.8 + 8} y={top + springH / 2} className="fill-slate-600" fontSize={11}>
          L₀ = {freeLength} {unit}
        </text>
        {/* Mean diameter dimension */}
        <line x1={cx - coilR} y1={top + springH + 22} x2={cx + coilR} y2={top + springH + 22} stroke="#64748b" strokeWidth={1} />
        <text x={cx} y={top + springH + 36} textAnchor="middle" className="fill-slate-600" fontSize={11}>
          D = {meanDiameter} {unit}, d = {wireDiameter} {unit}
        </text>
      </svg>
      <p className="mt-1 text-xs text-slate-500">
        {activeCoils} active coils (+2 closed end coils shown); drawn to scale from current inputs.
      </p>
    </div>
  );
}
