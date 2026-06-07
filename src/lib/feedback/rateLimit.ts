const WINDOW_MS = 60_000;
const hits = new Map<string, number>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const last = hits.get(key) ?? 0;
  if (now - last < WINDOW_MS) {
    return true;
  }
  hits.set(key, now);
  return false;
}
