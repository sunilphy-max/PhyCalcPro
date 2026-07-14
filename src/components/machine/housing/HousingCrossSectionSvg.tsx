"use client";

import { useId } from "react";
import type { HousingMountStyle } from "@/lib/machine/housing/types";

const STYLE_LABELS: Record<HousingMountStyle, string> = {
  pillow_block: "Pillow block housing",
  flange: "Flange housing",
  foot: "Foot-mount housing",
};

type Props = {
  mountStyle: HousingMountStyle;
  width?: number;
  height?: number;
  className?: string;
};

/** Indicative housing elevation / mounting sketch. */
export default function HousingCrossSectionSvg({
  mountStyle,
  width = 140,
  height = 100,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const metalId = `hs-metal-${uid}`;
  const w = 140;
  const h = 100;
  const cx = w / 2;

  const bearingInsert = (cxLocal: number, cyLocal: number, r = 14) => (
    <>
      <circle cx={cxLocal} cy={cyLocal} r={r} fill="#e2e8f0" stroke="#475569" strokeWidth={2} />
      <circle cx={cxLocal} cy={cyLocal} r={r - 6} fill="#f8fafc" stroke="#94a3b8" />
      <circle cx={cxLocal} cy={cyLocal} r={3.5} fill={`url(#${metalId})`} />
    </>
  );

  const renderBody = () => {
    switch (mountStyle) {
      case "flange":
        return (
          <>
            <rect x={22} y={18} width={96} height={64} rx={6} fill={`url(#${metalId})`} stroke="#334155" />
            <circle cx={30} cy={26} r={4} fill="#f8fafc" stroke="#64748b" />
            <circle cx={110} cy={26} r={4} fill="#f8fafc" stroke="#64748b" />
            <circle cx={30} cy={74} r={4} fill="#f8fafc" stroke="#64748b" />
            <circle cx={110} cy={74} r={4} fill="#f8fafc" stroke="#64748b" />
            {bearingInsert(cx, 50, 18)}
            <text x={48} y={94} fontSize={9} fill="#64748b">
              4-bolt flange face
            </text>
          </>
        );
      case "foot":
        return (
          <>
            <path
              d="M28 72 L28 40 Q28 28 42 28 L98 28 Q112 28 112 40 L112 72 Z"
              fill={`url(#${metalId})`}
              stroke="#334155"
            />
            <rect x={18} y={72} width={30} height={10} rx={2} fill="#64748b" />
            <rect x={92} y={72} width={30} height={10} rx={2} fill="#64748b" />
            <circle cx={28} cy={77} r={2.5} fill="#f8fafc" />
            <circle cx={112} cy={77} r={2.5} fill="#f8fafc" />
            {bearingInsert(cx, 48, 16)}
            <text x={42} y={94} fontSize={9} fill="#64748b">
              Foot / base mount
            </text>
          </>
        );
      default:
        return (
          <>
            <path
              d="M36 70 L36 42 Q36 22 70 22 Q104 22 104 42 L104 70 Z"
              fill={`url(#${metalId})`}
              stroke="#334155"
            />
            <rect x={20} y={70} width={100} height={12} rx={3} fill="#64748b" />
            <circle cx={36} cy={76} r={3} fill="#f8fafc" stroke="#334155" />
            <circle cx={104} cy={76} r={3} fill="#f8fafc" stroke="#334155" />
            {bearingInsert(cx, 46, 16)}
            <line x1={cx} y1={8} x2={cx} y2={28} stroke="#1e293b" strokeWidth={3} />
            <text x={38} y={96} fontSize={9} fill="#64748b">
              Pillow block (2-bolt)
            </text>
          </>
        );
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-label={`${STYLE_LABELS[mountStyle]} sketch`}
      role="img"
    >
      <defs>
        <linearGradient id={metalId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill="#f8fafc" rx={8} className="dark:fill-slate-900" />
      {renderBody()}
    </svg>
  );
}
