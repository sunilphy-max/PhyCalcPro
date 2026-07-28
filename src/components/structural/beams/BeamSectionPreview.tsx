"use client";

import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";

type Props = {
  designation: string;
  section: RolledSectionProps;
};

function scaleToViewBox(
  points: Array<[number, number]>,
  size = 120,
  pad = 10
): string {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 1e-9);
  const h = Math.max(maxY - minY, 1e-9);
  const scale = Math.min((size - 2 * pad) / w, (size - 2 * pad) / h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return points
    .map(([x, y]) => {
      const sx = size / 2 + (x - cx) * scale;
      const sy = size / 2 - (y - cy) * scale;
      return `${sx},${sy}`;
    })
    .join(" ");
}

function iBeamPoints(
  height: number,
  width: number,
  tw: number,
  tf: number
): Array<[number, number]> {
  const hw = width / 2;
  const hh = height / 2;
  const halfTw = tw / 2;
  return [
    [-hw, hh],
    [hw, hh],
    [hw, hh - tf],
    [halfTw, hh - tf],
    [halfTw, -hh + tf],
    [hw, -hh + tf],
    [hw, -hh],
    [-hw, -hh],
    [-hw, -hh + tf],
    [-halfTw, -hh + tf],
    [-halfTw, hh - tf],
    [-hw, hh - tf],
  ];
}

function channelPoints(
  height: number,
  width: number,
  tw: number,
  tf: number
): Array<[number, number]> {
  const hw = width / 2;
  const hh = height / 2;
  return [
    [-hw, hh],
    [hw, hh],
    [hw, hh - tf],
    [-hw + tw, hh - tf],
    [-hw + tw, -hh + tf],
    [hw, -hh + tf],
    [hw, -hh],
    [-hw, -hh],
  ];
}

function outlineFor(section: RolledSectionProps): {
  points: Array<[number, number]>;
  kind: string;
} {
  const d = Math.max(section.depth, 1e-6);
  const bf = Math.max(section.flangeWidth, 1e-6);
  const tf = Math.min(d * 0.08, d / 6);
  const tw = Math.min(bf * 0.12, bf / 5);

  if (section.family === "Pipe") {
    const r = d / 2;
    const n = 24;
    const outer: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      outer.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return { points: outer, kind: "pipe" };
  }

  if (section.family === "RHS" || section.family === "SHS") {
    return {
      points: [
        [-bf / 2, d / 2],
        [bf / 2, d / 2],
        [bf / 2, -d / 2],
        [-bf / 2, -d / 2],
      ],
      kind: "box",
    };
  }

  if (section.family === "C" || section.family === "UPN") {
    return { points: channelPoints(d, bf, tw, tf), kind: "channel" };
  }

  return { points: iBeamPoints(d, bf, tw, tf), kind: "I" };
}

function propChip(label: string, value: string) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
      <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-[11px] font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export default function BeamSectionPreview({ designation, section }: Props) {
  const { points, kind } = outlineFor(section);
  const path = scaleToViewBox(points);

  return (
    <div
      className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/60"
      data-export-diagram="true"
      data-export-caption={`${designation} cross-section`}
    >
      <div className="shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="h-24 w-24"
          role="img"
          aria-label={`${designation} ${kind} cross-section preview`}
        >
          <polygon
            points={path}
            fill="#e2e8f0"
            stroke="#0f172a"
            strokeWidth={1.5}
            className="dark:fill-slate-700 dark:stroke-slate-200"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {designation}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Depth {(section.depth * 1000).toFixed(0)} mm · Width{" "}
            {(section.flangeWidth * 1000).toFixed(0)} mm
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {propChip("Ix", `${(section.ix * 1e6).toFixed(1)}×10⁻⁶ m⁴`)}
          {propChip("Iy", `${(section.iy * 1e6).toFixed(1)}×10⁻⁶ m⁴`)}
          {propChip("Sx", `${(section.sx * 1e6).toFixed(1)}×10⁻⁶ m³`)}
          {propChip("A", `${(section.area * 1e4).toFixed(1)} cm²`)}
          {propChip("Weight", `${section.weight.toFixed(1)} kg/m`)}
          {propChip("Family", section.family)}
        </div>
      </div>
    </div>
  );
}
