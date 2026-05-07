export function maxAbs(arr: number[]) {
  if (!arr || arr.length === 0) return 0;

  let max = 0;

  for (const v of arr) {
    if (Number.isFinite(v)) {
      const a = Math.abs(v);
      if (a > max) max = a;
    }
  }

  return max;
}