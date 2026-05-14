/**
 * Linear System Solver
 * Solves constrained linear system Ku = F
 */

/**
 * Gaussian elimination with partial pivoting
 * Solves K*u = F for u
 */
export function solveLinearSystem(
  K: number[][],
  F: number[],
  constraints: { dof: number; value: number }[]
): number[] {
  const n = F.length;
  const Km = K.map((row) => [...row]);
  const Fm = [...F];

  // Apply constraints using penalty method
  const penalty = 1e12;
  for (const constraint of constraints) {
    const dof = constraint.dof;
    Km[dof][dof] += penalty;
    Fm[dof] += penalty * constraint.value;
  }

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(Km[k][i]) > Math.abs(Km[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [Km[i], Km[maxRow]] = [Km[maxRow], Km[i]];
    [Fm[i], Fm[maxRow]] = [Fm[maxRow], Fm[i]];

    // Check for singularity
    if (Math.abs(Km[i][i]) < 1e-14) {
      throw new Error(`Singular matrix at row ${i}`);
    }

    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      const factor = Km[k][i] / Km[i][i];
      for (let j = i; j < n; j++) {
        Km[k][j] -= factor * Km[i][j];
      }
      Fm[k] -= factor * Fm[i];
    }
  }

  // Back substitution
  const u: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    u[i] = Fm[i];
    for (let j = i + 1; j < n; j++) {
      u[i] -= Km[i][j] * u[j];
    }
    u[i] /= Km[i][i];
  }

  return u;
}

/**
 * Compute eigenvalues using power iteration
 * For critical speed/buckling analysis
 */
export function computeEigenvalues(
  K: number[][],
  M: number[][], // Mass/Geometric stiffness matrix
  numEigenvalues: number = 1
): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = K.length;
  const eigenvalues: number[] = [];
  const eigenvectors: number[][] = [];

  // Power iteration for dominant eigenvalue
  let v: number[] = Array(n)
    .fill(0)
    .map(() => Math.random());

  // Normalize
  let norm = Math.sqrt(v.reduce((sum, vi) => sum + vi * vi, 0));
  v = v.map((vi) => vi / norm);

  for (let iter = 0; iter < 100; iter++) {
    // Compute K^{-1} * M * v
    const Mv = matrixVectorProduct(M, v);
    const y = solveLinearSystem(K, Mv, []);

    norm = Math.sqrt(y.reduce((sum, yi) => sum + yi * yi, 0));
    const v_new = y.map((yi) => yi / norm);

    // Check convergence
    const residual = v.reduce((sum, vi, i) => sum + (v_new[i] - vi) ** 2, 0);
    if (residual < 1e-6) {
      eigenvalues.push(1 / norm);
      eigenvectors.push(v_new);
      break;
    }

    v = v_new;
  }

  return { eigenvalues, eigenvectors };
}

/**
 * Matrix-vector product
 */
function matrixVectorProduct(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((sum, aij, j) => sum + aij * v[j], 0));
}
