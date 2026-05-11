/**
 * Profiles Post-Processing
 * Processes numerical integration results
 */

/**
 * Calculate centroid from first moments
 */
export function calculateCentroid(
  area: number,
  Qx: number,
  Qy: number
): { x: number; y: number } {
  const x = area > 0 ? Qy / area : 0;
  const y = area > 0 ? Qx / area : 0;
  return { x, y };
}

/**
 * Calculate central moments (about centroid)
 */
export function calculateCentralMoments(
  Ixx: number,
  Iyy: number,
  Ixy: number,
  area: number,
  centroidX: number,
  centroidY: number
): { Ixx_c: number; Iyy_c: number; Ixy_c: number } {
  const Ixx_c = Ixx - area * centroidY * centroidY;
  const Iyy_c = Iyy - area * centroidX * centroidX;
  const Ixy_c = Ixy - area * centroidX * centroidY;

  return { Ixx_c, Iyy_c, Ixy_c };
}

/**
 * Calculate section moduli
 */
export function calculateSectionModuli(
  Ixx: number,
  Iyy: number,
  width: number,
  height: number
): { sx: number; sy: number } {
  const sx = Ixx / (height / 2);
  const sy = Iyy / (width / 2);
  return { sx, sy };
}

/**
 * Calculate polar moment
 */
export function calculatePolarMoment(Ixx: number, Iyy: number): number {
  return Ixx + Iyy;
}
