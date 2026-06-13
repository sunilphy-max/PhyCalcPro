"use client";

import type { ShapeProperties } from "@/lib/profiles/types";

type Props = {
  shape: ShapeProperties;
  area: number;
};

function scaleToViewBox(
  points: Array<[number, number]>,
  size = 280,
  pad = 24
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

function rectanglePath(w: number, h: number): string {
  return scaleToViewBox([
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ]);
}

function circlePath(d: number): string {
  const r = d / 2;
  return scaleToViewBox([
    [-r, 0],
    [0, r],
    [r, 0],
    [0, -r],
  ]);
}

export default function ProfileCrossSectionPreview({ shape, area }: Props) {
  const shapeName = shape.shape.replace(/_/g, " ");
  let pathD = "";
  let label = shapeName;

  if (shape.shape === "rectangle" && shape.rectangle) {
    pathD = rectanglePath(shape.rectangle.width, shape.rectangle.height);
    label = `Rectangle ${shape.rectangle.width.toFixed(3)} × ${shape.rectangle.height.toFixed(3)} m`;
  } else if (shape.shape === "circle" && shape.circle) {
    pathD = circlePath(shape.circle.diameter);
    label = `Circle Ø ${shape.circle.diameter.toFixed(3)} m`;
  } else if (shape.shape === "hollow_circle" && shape.hollowCircle) {
    const ro = shape.hollowCircle.outerDiameter / 2;
    const ri = shape.hollowCircle.innerDiameter / 2;
    pathD = scaleToViewBox([
      [-ro, 0],
      [0, ro],
      [ro, 0],
      [0, -ro],
      [-ri, 0],
      [0, ri],
      [ri, 0],
      [0, -ri],
    ]);
    label = `Hollow Ø ${shape.hollowCircle.outerDiameter.toFixed(3)} / ${shape.hollowCircle.innerDiameter.toFixed(3)} m`;
  } else if (shape.shape === "i_beam" && shape.iBeam) {
    const { height, width, webThickness, flangeThickness } = shape.iBeam;
    const hw = width / 2;
    const hh = height / 2;
    const tw = webThickness / 2;
    const tf = flangeThickness;
    pathD = scaleToViewBox([
      [-hw, hh],
      [hw, hh],
      [hw, hh - tf],
      [tw, hh - tf],
      [tw, -hh + tf],
      [hw, -hh + tf],
      [hw, -hh],
      [-hw, -hh],
      [-hw, -hh + tf],
      [-tw, -hh + tf],
      [-tw, hh - tf],
      [-hw, hh - tf],
    ]);
    label = `I-beam ${width.toFixed(3)} × ${height.toFixed(3)} m`;
  } else {
    pathD = scaleToViewBox([
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
    ]);
  }

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-export-diagram="true"
      data-export-caption="Cross-section outline"
      role="img"
      aria-label={`${label}. Area ${area.toExponential(3)} square metres.`}
    >
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Cross-section outline</h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <svg viewBox="0 0 280 280" className="mx-auto mt-3 h-auto w-full max-w-xs">
        <polygon
          points={pathD}
          fill="rgba(59,130,246,0.15)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-600 dark:text-blue-400"
        />
        <line x1="140" y1="20" x2="140" y2="260" stroke="#94a3b8" strokeDasharray="4 4" opacity="0.5" />
        <line x1="20" y1="140" x2="260" y2="140" stroke="#94a3b8" strokeDasharray="4 4" opacity="0.5" />
      </svg>
    </div>
  );
}
