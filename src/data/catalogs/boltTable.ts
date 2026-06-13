/**
 * ISO metric screw thread table (ISO 261/262 sizes, ISO 724 geometry).
 * Tensile-stress areas As per ISO 898-1: As = (π/4)·((d2 + d3)/2)²,
 * matching the published table values (e.g. M12 → 84.3 mm²).
 */

export type ThreadSeries = "coarse" | "fine";

export type BoltTableEntry = {
  /** e.g. "M12" or "M12x1.25" */
  designation: string;
  /** Nominal (major) diameter (m) */
  d: number;
  /** Thread pitch (m) */
  pitch: number;
  series: ThreadSeries;
  /** Tensile-stress area As (m²) */
  stressArea: number;
  /** Minor diameter d3 (m) */
  minorDiameter: number;
  /** Pitch diameter d2 (m) */
  pitchDiameter: number;
};

function entry(dMm: number, pitchMm: number, series: ThreadSeries): BoltTableEntry {
  const d = dMm / 1000;
  const P = pitchMm / 1000;
  const d2 = d - 0.6495 * P;
  const d3 = d - 1.2269 * P;
  const dS = (d2 + d3) / 2;
  return {
    designation: series === "coarse" ? `M${dMm}` : `M${dMm}x${pitchMm}`,
    d,
    pitch: P,
    series,
    stressArea: (Math.PI / 4) * dS * dS,
    minorDiameter: d3,
    pitchDiameter: d2,
  };
}

/** ISO 261 coarse-pitch series, M3–M64 */
export const COARSE_THREADS: BoltTableEntry[] = [
  entry(3, 0.5, "coarse"),
  entry(3.5, 0.6, "coarse"),
  entry(4, 0.7, "coarse"),
  entry(5, 0.8, "coarse"),
  entry(6, 1, "coarse"),
  entry(8, 1.25, "coarse"),
  entry(10, 1.5, "coarse"),
  entry(12, 1.75, "coarse"),
  entry(14, 2, "coarse"),
  entry(16, 2, "coarse"),
  entry(18, 2.5, "coarse"),
  entry(20, 2.5, "coarse"),
  entry(22, 2.5, "coarse"),
  entry(24, 3, "coarse"),
  entry(27, 3, "coarse"),
  entry(30, 3.5, "coarse"),
  entry(33, 3.5, "coarse"),
  entry(36, 4, "coarse"),
  entry(39, 4, "coarse"),
  entry(42, 4.5, "coarse"),
  entry(45, 4.5, "coarse"),
  entry(48, 5, "coarse"),
  entry(52, 5, "coarse"),
  entry(56, 5.5, "coarse"),
  entry(60, 5.5, "coarse"),
  entry(64, 6, "coarse"),
];

/** Common ISO 261 fine-pitch sizes */
export const FINE_THREADS: BoltTableEntry[] = [
  entry(8, 1, "fine"),
  entry(10, 1.25, "fine"),
  entry(10, 1, "fine"),
  entry(12, 1.5, "fine"),
  entry(12, 1.25, "fine"),
  entry(14, 1.5, "fine"),
  entry(16, 1.5, "fine"),
  entry(18, 1.5, "fine"),
  entry(20, 1.5, "fine"),
  entry(22, 1.5, "fine"),
  entry(24, 2, "fine"),
  entry(27, 2, "fine"),
  entry(30, 2, "fine"),
  entry(33, 2, "fine"),
  entry(36, 3, "fine"),
  entry(39, 3, "fine"),
];

export const boltTable: BoltTableEntry[] = [...COARSE_THREADS, ...FINE_THREADS];

export function findThread(designation: string): BoltTableEntry | undefined {
  return boltTable.find((t) => t.designation === designation);
}
