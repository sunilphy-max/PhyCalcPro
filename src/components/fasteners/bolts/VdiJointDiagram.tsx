"use client";

type Props = {
  clampLengthM: number;
  boltDiameterMm: number;
  preloadKn: number;
};

export default function VdiJointDiagram({ clampLengthM, boltDiameterMm, preloadKn }: Props) {
  const clampMm = clampLengthM * 1000;
  const plateH = Math.max(24, Math.min(48, clampMm * 0.35));
  const boltW = Math.max(6, Math.min(14, boltDiameterMm * 0.45));

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-export-diagram="true"
      data-export-caption="VDI 2230 bolt joint schematic"
      role="img"
      aria-label={`Preloaded bolt joint. Clamp length ${clampMm.toFixed(1)} mm, preload ${preloadKn.toFixed(1)} kN.`}
    >
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Bolt joint schematic</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        FM,zul ≈ {preloadKn.toFixed(1)} kN · LK ≈ {clampMm.toFixed(1)} mm
      </p>
      <svg viewBox="0 0 360 200" className="mt-3 h-auto w-full" aria-hidden="true">
        <rect x="80" y="60" width="200" height={plateH} fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
        <rect x="80" y={60 + plateH + 8} width="200" height={plateH} fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
        <rect x={178 - boltW / 2} y="40" width={boltW} height="120" fill="#64748b" stroke="#334155" strokeWidth="2" />
        <polygon points="170,28 190,28 180,40" fill="#475569" />
        <text x="240" y="55" className="fill-slate-600 text-[11px]">
          Plates
        </text>
        <text x="240" y="145" className="fill-slate-600 text-[11px]">
          Clamp LK
        </text>
        <line x1="178" y1="52" x2="178" y2="168" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#0ea5e9" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
