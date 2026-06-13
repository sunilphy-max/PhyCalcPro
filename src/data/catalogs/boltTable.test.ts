import { describe, expect, it } from "vitest";
import { boltTable, COARSE_THREADS, findThread } from "./boltTable";

/**
 * Benchmark: ISO 898-1 Table 4 published tensile-stress areas (mm²).
 */
const PUBLISHED_AS_MM2: Record<string, number> = {
  M3: 5.03,
  M4: 8.78,
  M5: 14.2,
  M6: 20.1,
  M8: 36.6,
  M10: 58.0,
  M12: 84.3,
  M16: 157,
  M20: 245,
  M24: 353,
  M30: 561,
  M36: 817,
  M42: 1121,
  M48: 1473,
  M56: 2030,
  M64: 2676,
  "M8x1": 39.2,
  "M10x1.25": 61.2,
  "M12x1.5": 88.1,
  "M16x1.5": 167,
  "M20x1.5": 272,
  "M24x2": 384,
};

describe("ISO metric bolt table vs ISO 898-1 stress areas", () => {
  for (const [designation, expectedMm2] of Object.entries(PUBLISHED_AS_MM2)) {
    it(`${designation}: As ≈ ${expectedMm2} mm²`, () => {
      const thread = findThread(designation);
      expect(thread).toBeDefined();
      const asMm2 = thread!.stressArea * 1e6;
      expect(asMm2 / expectedMm2).toBeGreaterThan(0.99);
      expect(asMm2 / expectedMm2).toBeLessThan(1.01);
    });
  }

  it("covers M3 through M64 coarse", () => {
    expect(COARSE_THREADS[0]!.designation).toBe("M3");
    expect(COARSE_THREADS[COARSE_THREADS.length - 1]!.designation).toBe("M64");
    expect(COARSE_THREADS.length).toBeGreaterThanOrEqual(26);
  });

  it("has unique designations", () => {
    const names = boltTable.map((t) => t.designation);
    expect(new Set(names).size).toBe(names.length);
  });
});
