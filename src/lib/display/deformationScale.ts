/**
 * Scale factor to exaggerate structural displacements for SVG diagrams.
 * Maps physical displacement (m) to the same coordinate system as geometry before px scaling.
 */
export function computeDeformationExaggeration(options: {
  displacements: { dx: number; dy: number }[];
  bboxWidthM: number;
  bboxHeightM: number;
  drawableWidthPx: number;
  drawableHeightPx: number;
  /** Fraction of the smaller drawable side used for peak displacement (default 10%) */
  targetFraction?: number;
  maxExaggeration?: number;
}): number {
  const {
    displacements,
    bboxWidthM,
    bboxHeightM,
    drawableWidthPx,
    drawableHeightPx,
    targetFraction = 0.1,
    maxExaggeration = 300,
  } = options;

  const maxDispM = Math.max(
    ...displacements.map((d) => Math.hypot(d.dx, d.dy)),
    1e-12
  );

  const pxPerM = Math.min(
    drawableWidthPx / Math.max(bboxWidthM, 1e-6),
    drawableHeightPx / Math.max(bboxHeightM, 1e-6)
  );

  const targetPx =
    Math.min(drawableWidthPx, drawableHeightPx) * targetFraction;

  const raw = targetPx / (maxDispM * pxPerM);
  return Math.min(maxExaggeration, Math.max(1, raw));
}
