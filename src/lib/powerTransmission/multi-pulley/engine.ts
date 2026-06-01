import type { MultiPulleyConfig, MultiPulleyResult } from "./types";

function segmentGeometry(D1: number, D2: number, C: number, crossed: boolean) {
  const sinArg = Math.min(1, Math.abs(D2 - D1) / (2 * C));
  const wrap1 = (Math.PI + (crossed ? 2 : -2) * Math.asin(sinArg)) * (180 / Math.PI);
  const wrap2 = (Math.PI + (crossed ? -2 : 2) * Math.asin(sinArg)) * (180 / Math.PI);
  const beltLength = 2 * C + (Math.PI * (D1 + D2)) / 2 + ((D2 - D1) ** 2) / (4 * C);
  return { wrap1, wrap2, beltLength };
}

/** Open belt path through N pulleys in listed order. */
export function solveMultiPulley(config: MultiPulleyConfig): MultiPulleyResult {
  const n = config.diameters.length;
  if (n < 2) throw new Error("At least two pulleys required.");

  const crossed = config.driveType === "crossed";
  const wrapAnglesDeg = Array(n).fill(0);
  const segmentLengths: number[] = [];
  const radialLoads: number[] = [];
  const tensionEstimate = 1000;
  let totalBeltLength = 0;

  for (let i = 0; i < n - 1; i++) {
    const D1 = Math.max(config.diameters[i], 1e-6);
    const D2 = Math.max(config.diameters[i + 1], 1e-6);
    const C = Math.max(
      config.centerDistances[i] ?? (D1 + D2) / 2,
      (D1 + D2) / 2 + 1e-6
    );
    const seg = segmentGeometry(D1, D2, C, crossed);
    segmentLengths.push(seg.beltLength);
    totalBeltLength += seg.beltLength;
    wrapAnglesDeg[i] += seg.wrap1;
    wrapAnglesDeg[i + 1] += seg.wrap2;
  }

  for (let i = 0; i < n; i++) {
    const D = Math.max(config.diameters[i], 1e-6);
    const wrapRad = (wrapAnglesDeg[i] * Math.PI) / 180;
    radialLoads.push((2 * tensionEstimate * Math.sin(wrapRad / 2)) / D);
  }

  return {
    totalBeltLength,
    wrapAnglesDeg,
    minWrapAngle: Math.min(...wrapAnglesDeg),
    segmentLengths,
    radialLoads,
    pulleyCount: n,
  };
}
