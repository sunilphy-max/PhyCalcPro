/**
 * Screws Linear Solver
 * Solves linear system for screw deformation and stress
 */

/**
 * Gaussian elimination with partial pivoting
 */
export function solveLinearSystem(
  K: number[][],
  F: number[],
  constraints: number[]
): number[] {
  const n = K.length;
  const KM = K.map((row) => [...row]);
  const FM = [...F];

  // Apply penalty method for constraints
  const penalty = 1e12;
  for (const c of constraints) {
    KM[c][c] += penalty;
    FM[c] = 0;
  }

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n - 1; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(KM[k][i]) > Math.abs(KM[maxRow][i])) {
        maxRow = k;
      }
    }

    [KM[i], KM[maxRow]] = [KM[maxRow], KM[i]];
    [FM[i], FM[maxRow]] = [FM[maxRow], FM[i]];

    for (let k = i + 1; k < n; k++) {
      if (Math.abs(KM[i][i]) < 1e-12) continue;
      const c = KM[k][i] / KM[i][i];
      for (let j = i; j < n; j++) {
        KM[k][j] -= c * KM[i][j];
      }
      FM[k] -= c * FM[i];
    }
  }

  // Back substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = FM[i];
    for (let j = i + 1; j < n; j++) {
      sum -= KM[i][j] * x[j];
    }
    x[i] = Math.abs(KM[i][i]) > 1e-12 ? sum / KM[i][i] : 0;
  }

  return x;
}
