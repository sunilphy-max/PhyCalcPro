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
import BearingCrossSectionSvg from "@/components/machine/bearings/BearingCrossSectionSvg";

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

export default function BearingReferenceVisual({
  bearingType,
  sealType = "open",
  arrangement,
  compact = false,
}: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/20 ${
        compact ? "p-3" : "p-4 md:p-5"
      }`}
    >
      <div className={`flex gap-4 ${compact ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-start"}`}>
        <div className="shrink-0 rounded-xl border border-slate-200/60 bg-white p-2 shadow-sm dark:border-slate-700/50 dark:bg-slate-950/50">
          <BearingCrossSectionSvg
            type={bearingType}
            sealType={sealType}
            width={compact ? 150 : 180}
            height={compact ? 108 : 128}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className={`font-semibold text-slate-900 dark:text-white ${compact ? "text-sm" : "text-base"}`}>
            {BEARING_TYPE_LABELS[bearingType]}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sealing: <span className="font-medium">{SEAL_TYPE_LABELS[sealType]}</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{ARRANGEMENT_LABELS[arrangement]}</p>
          <LoadDirectionHint type={bearingType} />
        </div>
        {arrangement !== "single" ? (
          <div className="shrink-0 rounded-lg border border-slate-200/60 bg-white p-2 dark:border-slate-700/50 dark:bg-slate-950/40">
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

function ArrangementSketch({ arrangement }: { arrangement: BearingArrangement }) {
  const w = 100;
  const h = 64;
  const shaft = <rect x={12} y={30} width={76} height={5} fill="#334155" rx={1} />;

  const bearing = (x: number, flip = false) => (
    <g key={x} transform={flip ? `scale(-1,1) translate(${-2 * x - 18},0)` : undefined}>
      <rect x={x} y={20} width={18} height={24} rx={2} fill="#e2e8f0" stroke="#64748b" strokeWidth={1.5} />
      <line x1={x + 5} y1={26} x2={x + 13} y2={36} stroke="#0ea5e9" strokeWidth={2.5} />
    </g>
  );

  let content;
  switch (arrangement) {
    case "back_to_back":
      content = (
        <>
          {shaft}
          {bearing(30, true)}
          {bearing(52)}
          <text x={42} y={14} fontSize={9} fontWeight="600" fill="#64748b">
            O
          </text>
        </>
      );
      break;
    case "face_to_face":
      content = (
        <>
          {shaft}
          {bearing(30)}
          {bearing(52, true)}
          <text x={42} y={14} fontSize={9} fontWeight="600" fill="#64748b">
            X
          </text>
        </>
      );
      break;
    case "tandem":
      content = (
        <>
          {shaft}
          {bearing(26)}
          {bearing(48)}
          <text x={36} y={14} fontSize={9} fontWeight="600" fill="#64748b">
            T
          </text>
        </>
      );
      break;
    default:
      content = (
        <>
          {shaft}
          {bearing(41)}
        </>
      );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label={`${ARRANGEMENT_LABELS[arrangement]} sketch`}>
      {content}
    </svg>
  );
}
