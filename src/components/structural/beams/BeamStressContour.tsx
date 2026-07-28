"use client";

type Props = {
  /** Section depth (2c) in display length units */
  depth: number;
  /** Peak bending stress magnitude (display stress units) */
  maxStress: number;
  /** Signed moment at critical section (for tension fiber side) */
  criticalMoment: number;
  stressUnit?: string;
  className?: string;
};

/**
 * Lightweight depth-wise σ = My/I contour at the critical section (not 2D plate FEM).
 */
export default function BeamStressContour({
  depth,
  maxStress,
  criticalMoment,
  stressUnit = "",
  className = "",
}: Props) {
  const w = 120;
  const h = 160;
  const pads = 16;
  const beamW = 36;
  const cx = w / 2;
  const top = pads;
  const bot = h - pads;
  const bands = 24;

  const tensionBottom = criticalMoment >= 0;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Stress contour (critical section)
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto h-44 w-28">
        {Array.from({ length: bands }).map((_, i) => {
          const t = i / (bands - 1); // 0 at top, 1 at bottom
          const yFromNA = t - 0.5;
          const sigmaFrac = Math.abs(yFromNA) * 2; // 0 at NA, 1 at fiber
          const tensionHere = tensionBottom ? yFromNA > 0 : yFromNA < 0;
          const r = tensionHere ? Math.round(220 * sigmaFrac) : 40;
          const g = Math.round(80 + 100 * (1 - sigmaFrac));
          const b = tensionHere ? 60 : Math.round(200 * sigmaFrac);
          const y0 = top + (bot - top) * (i / bands);
          const y1 = top + (bot - top) * ((i + 1) / bands);
          return (
            <rect
              key={i}
              x={cx - beamW / 2}
              y={y0}
              width={beamW}
              height={Math.max(y1 - y0, 1)}
              fill={`rgb(${r},${g},${b})`}
              opacity={0.85}
            />
          );
        })}
        <rect
          x={cx - beamW / 2}
          y={top}
          width={beamW}
          height={bot - top}
          fill="none"
          stroke="#0f172a"
          strokeWidth={1.5}
        />
        <line
          x1={cx - beamW / 2 - 4}
          y1={(top + bot) / 2}
          x2={cx + beamW / 2 + 4}
          y2={(top + bot) / 2}
          stroke="#f8fafc"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <text x={4} y={top + 4} fontSize="8" fill="#64748b">
          top
        </text>
        <text x={4} y={bot} fontSize="8" fill="#64748b">
          bot
        </text>
      </svg>
      <p className="mt-2 text-center text-xs text-slate-600 dark:text-slate-300">
        |σ|<sub>max</sub> ≈ {maxStress.toPrecision(4)}
        {stressUnit ? ` ${stressUnit}` : ""} · depth {depth.toPrecision(3)}
      </p>
      <p className="mt-1 text-center text-[10px] text-slate-500">
        Linear elastic σ = My/I through depth at peak-|M| section.
      </p>
    </div>
  );
}
