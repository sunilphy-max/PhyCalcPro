"use client";

import type {
  BearingArrangement,
  BearingSealType,
  BearingType,
} from "@/lib/machine/bearings/types";
import {
  BEARING_TYPE_LABELS,
  SEAL_TYPE_LABELS,
} from "@/data/catalogs/bearingCatalog";

type Props = {
  bearingType: BearingType;
  sealType?: BearingSealType;
  arrangement: BearingArrangement;
  compact?: boolean;
};

const ARRANGEMENT_LABELS: Record<BearingArrangement, string> = {
  single: "Single bearing",
  back_to_back: "Back-to-back (O) — stiff moment, resists misalignment",
  face_to_face: "Face-to-face (X) — accommodates misalignment",
  tandem: "Tandem (T) — shares axial load, same contact angle",
};

/** MITCalc-style indicative cross-sections and arrangement sketches. */
export default function BearingReferenceVisual({
  bearingType,
  sealType = "open",
  arrangement,
  compact = false,
}: Props) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="shrink-0">
          <BearingCrossSection type={bearingType} sealType={sealType} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {BEARING_TYPE_LABELS[bearingType]}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sealing: <span className="font-medium">{SEAL_TYPE_LABELS[sealType]}</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{ARRANGEMENT_LABELS[arrangement]}</p>
          <LoadDirectionHint type={bearingType} />
        </div>
        {arrangement !== "single" ? (
          <div className="shrink-0">
            <ArrangementSketch arrangement={arrangement} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoadDirectionHint({ type }: { type: BearingType }) {
  const isThrust = type === "thrust_ball";
  const isAngular = type === "angular_contact" || type === "tapered_roller";
  const text = isThrust
    ? "Primary load: axial Fa (thrust direction shown ↕)"
    : isAngular
      ? "Combined Fr + Fa — contact angle carries axial component"
      : "Primary load: radial Fr (⊥ shaft axis)";
  return <p className="text-[11px] italic text-slate-500 dark:text-slate-400">{text}</p>;
}

function BearingCrossSection({ type, sealType }: { type: BearingType; sealType: BearingSealType }) {
  const w = 120;
  const h = 80;
  const cx = w / 2;
  const cy = h / 2;

  const renderBody = () => {
    switch (type) {
      case "thrust_ball":
        return (
          <>
            <rect x={20} y={28} width={80} height={8} fill="#64748b" rx={1} />
            <rect x={20} y={44} width={80} height={8} fill="#64748b" rx={1} />
            {[35, 50, 65, 80].map((x) => (
              <circle key={x} cx={x} cy={cy} r={5} fill="#0ea5e9" stroke="#0369a1" strokeWidth={1} />
            ))}
            <path d="M60 12 L60 24 M55 12 L65 12" stroke="#ef4444" strokeWidth={2} markerEnd="url(#arrow)" />
            <path d="M60 68 L60 56 M55 68 L65 68" stroke="#ef4444" strokeWidth={2} />
          </>
        );
      case "tapered_roller":
        return (
          <>
            <path d="M25 55 L45 35 L75 35 L95 55 Z" fill="#94a3b8" stroke="#475569" />
            <path d="M35 50 L50 38 L70 38 L85 50 Z" fill="#e2e8f0" stroke="#64748b" />
            {[48, 58, 68].map((x, i) => (
              <ellipse key={x} cx={x} cy={44 + i * 2} rx={4} ry={8} fill="#0ea5e9" stroke="#0369a1" transform={`rotate(-15 ${x} ${44 + i * 2})`} />
            ))}
            <line x1={cx} y1={12} x2={cx} y2={30} stroke="#334155" strokeWidth={3} />
          </>
        );
      case "angular_contact":
        return (
          <>
            <circle cx={cx} cy={cy} r={32} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={18} fill="#f8fafc" stroke="#94a3b8" />
            <circle cx={cx - 6} cy={cy - 4} r={6} fill="#0ea5e9" stroke="#0369a1" />
            <circle cx={cx + 8} cy={cy + 2} r={6} fill="#0ea5e9" stroke="#0369a1" />
            <line x1={cx} y1={8} x2={cx} y2={24} stroke="#334155" strokeWidth={3} />
            <path d="M72 50 L95 62" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
            <text x={96} y={64} fontSize={8} fill="#ef4444">
              Fa
            </text>
          </>
        );
      case "cylindrical_roller":
      case "cylindrical_nj":
      case "cylindrical_nup":
        return (
          <>
            <circle cx={cx} cy={cy} r={32} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={16} fill="#f8fafc" stroke="#94a3b8" />
            {[42, 52, 62, 72, 78].map((x) => (
              <rect key={x} x={x - 2} y={cy - 14} width={4} height={28} rx={1} fill="#0ea5e9" stroke="#0369a1" />
            ))}
            <line x1={cx} y1={8} x2={cx} y2={24} stroke="#334155" strokeWidth={3} />
          </>
        );
      case "needle_roller":
        return (
          <>
            <circle cx={cx} cy={cy} r={32} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={14} fill="#f8fafc" stroke="#94a3b8" />
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const rx = cx + Math.cos(a) * 22;
              const ry = cy + Math.sin(a) * 22;
              return (
                <rect
                  key={i}
                  x={rx - 1}
                  y={ry - 6}
                  width={2}
                  height={12}
                  fill="#0ea5e9"
                  transform={`rotate(${(a * 180) / Math.PI} ${rx} ${ry})`}
                />
              );
            })}
            <line x1={cx} y1={8} x2={cx} y2={22} stroke="#334155" strokeWidth={3} />
          </>
        );
      case "spherical_roller":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={34} ry={30} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={14} fill="#f8fafc" stroke="#94a3b8" />
            <ellipse cx={cx - 4} cy={cy} rx={5} ry={10} fill="#0ea5e9" stroke="#0369a1" />
            <ellipse cx={cx + 6} cy={cy - 2} rx={5} ry={10} fill="#0ea5e9" stroke="#0369a1" />
            <line x1={cx} y1={8} x2={cx} y2={22} stroke="#334155" strokeWidth={3} />
          </>
        );
      case "self_aligning_ball":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={34} ry={28} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={12} fill="#f8fafc" stroke="#94a3b8" />
            <circle cx={cx - 8} cy={cy - 2} r={5} fill="#0ea5e9" stroke="#0369a1" />
            <circle cx={cx + 8} cy={cy + 2} r={5} fill="#0ea5e9" stroke="#0369a1" />
            <line x1={cx} y1={8} x2={cx} y2={20} stroke="#334155" strokeWidth={3} />
          </>
        );
      default:
        return (
          <>
            <circle cx={cx} cy={cy} r={32} fill="#e2e8f0" stroke="#64748b" strokeWidth={2} />
            <circle cx={cx} cy={cy} r={16} fill="#f8fafc" stroke="#94a3b8" />
            <circle cx={cx - 8} cy={cy - 4} r={6} fill="#0ea5e9" stroke="#0369a1" />
            <circle cx={cx + 8} cy={cy + 4} r={6} fill="#0ea5e9" stroke="#0369a1" />
            <line x1={cx} y1={8} x2={cx} y2={24} stroke="#334155" strokeWidth={3} />
          </>
        );
    }
  };

  const renderSeal = () => {
    if (sealType === "open") return null;
    const shieldY = sealType === "shielded" ? [cy - 28, cy + 28] : [cy - 30, cy + 30];
    return shieldY.map((y, i) => (
      <rect
        key={i}
        x={cx - 34}
        y={y - 2}
        width={68}
        height={4}
        fill={sealType === "contact_sealed" ? "#059669" : "#78716c"}
        rx={1}
        opacity={0.85}
      />
    ));
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label={`${BEARING_TYPE_LABELS[type]} cross-section`}>
      <defs>
        <marker id="arrow" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
        </marker>
      </defs>
      {renderBody()}
      {renderSeal()}
      <line x1={8} y1={cy} x2={22} y2={cy} stroke="#334155" strokeWidth={2} />
      <text x={4} y={cy + 3} fontSize={7} fill="#334155">
        Fr
      </text>
    </svg>
  );
}

function ArrangementSketch({ arrangement }: { arrangement: BearingArrangement }) {
  const w = 90;
  const h = 56;
  const shaft = <rect x={10} y={26} width={70} height={4} fill="#334155" rx={1} />;

  const bearing = (x: number, flip = false) => (
    <g key={x} transform={flip ? `scale(-1,1) translate(${-2 * x - 16},0)` : undefined}>
      <rect x={x} y={18} width={16} height={20} rx={2} fill="#e2e8f0" stroke="#64748b" />
      <line x1={x + 4} y1={22} x2={x + 12} y2={30} stroke="#0ea5e9" strokeWidth={2} />
    </g>
  );

  let content;
  switch (arrangement) {
    case "back_to_back":
      content = (
        <>
          {shaft}
          {bearing(28, true)}
          {bearing(46)}
          <text x={38} y={14} fontSize={7} fill="#64748b">
            O
          </text>
        </>
      );
      break;
    case "face_to_face":
      content = (
        <>
          {shaft}
          {bearing(28)}
          {bearing(46, true)}
          <text x={38} y={14} fontSize={7} fill="#64748b">
            X
          </text>
        </>
      );
      break;
    case "tandem":
      content = (
        <>
          {shaft}
          {bearing(24)}
          {bearing(42)}
          <text x={32} y={14} fontSize={7} fill="#64748b">
            T
          </text>
        </>
      );
      break;
    default:
      content = (
        <>
          {shaft}
          {bearing(37)}
        </>
      );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label={`${ARRANGEMENT_LABELS[arrangement]} sketch`}>
      {content}
    </svg>
  );
}
