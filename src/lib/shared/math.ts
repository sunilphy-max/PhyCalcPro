export function maxAbs(arr: number[]) {
  if (!arr || arr.length === 0) return 0;
  return Math.max(...arr.map(Math.abs));
}