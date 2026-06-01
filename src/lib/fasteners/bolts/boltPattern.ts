import type { BoltPatternConfig, BoltPatternResult, BoltPatternBoltLoad } from "./boltPatternTypes";

function evenPositions(count: number, radius: number) {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    positions.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }
  return positions;
}

function polarInertia(positions: { x: number; y: number }[]) {
  return positions.reduce((sum, p) => sum + p.x * p.x + p.y * p.y, 0);
}

/**
 * Elastic bolt pattern load sharing: direct + moment from eccentric shear.
 * Simplified VDI 2230 / Shigley-style stiffness method (equal stiffness per bolt).
 */
export function solveBoltPattern(config: BoltPatternConfig): BoltPatternResult {
  const n = Math.max(2, Math.round(config.boltCount));
  const positions =
    config.positions?.length === n
      ? config.positions
      : evenPositions(n, Math.max(config.patternRadius, 1e-6));

  const cx = positions.reduce((s, p) => s + p.x, 0) / n;
  const cy = positions.reduce((s, p) => s + p.y, 0) / n;
  const rel = positions.map((p) => ({ x: p.x - cx, y: p.y - cy }));

  const direct = Math.hypot(config.shearForce, config.axialForce) / n;
  const ex = config.eccentricityX ?? 0;
  const ey = config.eccentricityY ?? 0;
  const moment = config.shearForce * ey - config.shearForce * ex;
  const j = Math.max(polarInertia(rel), 1e-18);

  const bolts: BoltPatternBoltLoad[] = rel.map((p, index) => {
    const momentComponent = (moment * Math.hypot(p.x, p.y)) / j;
    const force = Math.max(0, direct + momentComponent);
    return { index, x: positions[index].x, y: positions[index].y, force };
  });

  const forces = bolts.map((b) => b.force);
  return {
    boltCount: n,
    centroidX: cx,
    centroidY: cy,
    maxBoltForce: Math.max(...forces),
    minBoltForce: Math.min(...forces),
    meanBoltForce: forces.reduce((a, b) => a + b, 0) / n,
    bolts,
    polarMoment: j,
    appliedMoment: moment,
  };
}
