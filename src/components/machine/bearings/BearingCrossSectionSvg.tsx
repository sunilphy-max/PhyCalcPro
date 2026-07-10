"use client";

import { useId } from "react";
import type { BearingSealType, BearingType } from "@/lib/machine/bearings/types";
import { BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";

type Props = {
  type: BearingType;
  sealType?: BearingSealType;
  /** Display width in px */
  width?: number;
  /** Display height in px */
  height?: number;
  className?: string;
};

/** Enhanced indicative bearing cross-section (SKF / MITCalc style). */
export default function BearingCrossSectionSvg({
  type,
  sealType = "open",
  width = 140,
  height = 100,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const arrowId = `arrow-${uid}`;
  const gradId = `bearing-grad-${uid}`;
  const w = 140;
  const h = 100;
  const cx = w / 2;
  const cy = h / 2;

  const renderBody = () => {
    switch (type) {
      case "thrust_ball":
        return (
          <>
            <rect x={18} y={32} width={104} height={10} fill="#475569" rx={2} />
            <rect x={18} y={58} width={104} height={10} fill="#475569" rx={2} />
            {[32, 48, 64, 80, 96, 108].map((x) => (
              <circle key={x} cx={x} cy={cy} r={6} fill={`url(#${gradId})`} stroke="#0369a1" strokeWidth={1.2} />
            ))}
            <path d="M70 10 L70 26 M64 10 L76 10" stroke="#dc2626" strokeWidth={2.5} markerEnd={`url(#${arrowId})`} />
            <path d="M70 90 L70 74 M64 90 L76 90" stroke="#dc2626" strokeWidth={2.5} />
          </>
        );
      case "tapered_roller":
        return (
          <>
            <path d="M22 62 L48 36 L92 36 L118 62 Z" fill="#94a3b8" stroke="#334155" strokeWidth={1.5} />
            <path d="M32 56 L52 42 L88 42 L108 56 Z" fill="#f1f5f9" stroke="#64748b" />
            {[46, 58, 70, 82, 94].map((x, i) => (
              <ellipse
                key={x}
                cx={x}
                cy={48 + i}
                rx={5}
                ry={11}
                fill={`url(#${gradId})`}
                stroke="#0369a1"
                transform={`rotate(-12 ${x} ${48 + i})`}
              />
            ))}
            <line x1={cx} y1={8} x2={cx} y2={30} stroke="#1e293b" strokeWidth={4} />
          </>
        );
      case "angular_contact":
        return (
          <>
            <circle cx={cx} cy={cy} r={38} fill="#e2e8f0" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={20} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />
            <circle cx={cx - 8} cy={cy - 6} r={8} fill={`url(#${gradId})`} stroke="#0369a1" />
            <circle cx={cx + 10} cy={cy + 4} r={8} fill={`url(#${gradId})`} stroke="#0369a1" />
            <line x1={cx} y1={6} x2={cx} y2={26} stroke="#1e293b" strokeWidth={4} />
            <path d="M88 58 L118 74" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3" />
            <text x={119} y={78} fontSize={11} fontWeight="600" fill="#dc2626">
              Fa
            </text>
          </>
        );
      case "cylindrical_roller":
      case "cylindrical_nj":
      case "cylindrical_nup":
        return (
          <>
            <circle cx={cx} cy={cy} r={38} fill="#e2e8f0" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={18} fill="#f8fafc" stroke="#94a3b8" />
            {[38, 50, 62, 74, 86, 98, 102].map((x) => (
              <rect key={x} x={x - 2.5} y={cy - 18} width={5} height={36} rx={1.5} fill={`url(#${gradId})`} stroke="#0369a1" />
            ))}
            <line x1={cx} y1={6} x2={cx} y2={26} stroke="#1e293b" strokeWidth={4} />
          </>
        );
      case "needle_roller":
        return (
          <>
            <circle cx={cx} cy={cy} r={38} fill="#e2e8f0" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={16} fill="#f8fafc" stroke="#94a3b8" />
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              const rx = cx + Math.cos(a) * 26;
              const ry = cy + Math.sin(a) * 26;
              return (
                <rect
                  key={i}
                  x={rx - 1.5}
                  y={ry - 8}
                  width={3}
                  height={16}
                  fill={`url(#${gradId})`}
                  transform={`rotate(${(a * 180) / Math.PI} ${rx} ${ry})`}
                />
              );
            })}
            <line x1={cx} y1={6} x2={cx} y2={24} stroke="#1e293b" strokeWidth={4} />
          </>
        );
      case "spherical_roller":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={40} ry={34} fill="#e2e8f0" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={16} fill="#f8fafc" stroke="#94a3b8" />
            <ellipse cx={cx - 6} cy={cy} rx={6} ry={13} fill={`url(#${gradId})`} stroke="#0369a1" />
            <ellipse cx={cx + 8} cy={cy - 3} rx={6} ry={13} fill={`url(#${gradId})`} stroke="#0369a1" />
            <line x1={cx} y1={6} x2={cx} y2={24} stroke="#1e293b" strokeWidth={4} />
          </>
        );
      case "self_aligning_ball":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={40} ry={32} fill="#e2e8f0" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={14} fill="#f8fafc" stroke="#94a3b8" />
            <circle cx={cx - 10} cy={cy - 3} r={7} fill={`url(#${gradId})`} stroke="#0369a1" />
            <circle cx={cx + 10} cy={cy + 3} r={7} fill={`url(#${gradId})`} stroke="#0369a1" />
            <line x1={cx} y1={6} x2={cx} y2={22} stroke="#1e293b" strokeWidth={4} />
          </>
        );
      default:
        return (
          <>
            <circle cx={cx} cy={cy} r={38} fill="#e2e8f0" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={20} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />
            <circle cx={cx - 10} cy={cy - 6} r={8} fill={`url(#${gradId})`} stroke="#0369a1" />
            <circle cx={cx + 10} cy={cy + 6} r={8} fill={`url(#${gradId})`} stroke="#0369a1" />
            <line x1={cx} y1={6} x2={cx} y2={26} stroke="#1e293b" strokeWidth={4} />
          </>
        );
    }
  };

  const renderSeal = () => {
    if (sealType === "open") return null;
    const isContact = sealType === "contact_sealed" || sealType === "sealed";
    const shieldY = sealType === "shielded" ? [cy - 34, cy + 34] : [cy - 36, cy + 36];
    return shieldY.map((y, i) => (
      <rect
        key={i}
        x={cx - 40}
        y={y - 2.5}
        width={80}
        height={5}
        fill={isContact ? "#059669" : "#78716c"}
        rx={1.5}
        opacity={0.9}
      />
    ));
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-label={`${BEARING_TYPE_LABELS[type]} cross-section`}
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <marker id={arrowId} markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
        </marker>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill="#f8fafc" rx={8} className="dark:fill-slate-900" />
      {renderBody()}
      {renderSeal()}
      <line x1={6} y1={cy} x2={24} y2={cy} stroke="#1e293b" strokeWidth={2.5} />
      <text x={2} y={cy + 4} fontSize={10} fontWeight="600" fill="#334155">
        Fr
      </text>
    </svg>
  );
}
