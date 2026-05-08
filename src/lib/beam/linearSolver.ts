export function solveLinearSystem(
  A: number[][],
  b: number[]
) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let k = 0; k < n; k++) {
    let max = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[max][k])) {
        max = i;
      }
    }

    [M[k], M[max]] = [M[max], M[k]];
    const pivot = M[k][k];
    if (Math.abs(pivot) < 1e-12) {
      continue;
    }

    for (let j = k; j <= n; j++) {
      M[k][j] /= pivot;
    }

    for (let i = 0; i < n; i++) {
      if (i !== k) {
        const factor = M[i][k];
        for (let j = k; j <= n; j++) {
          M[i][j] -= factor * M[k][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}
