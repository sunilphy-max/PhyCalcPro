/** Apply design-code unit map to page unit setters (only keys present in profile). */
export function applyUnitMap(
  units: Record<string, string>,
  setters: Record<string, (unit: string) => void>
): void {
  for (const [key, setter] of Object.entries(setters)) {
    const next = units[key];
    if (next) setter(next);
  }
}
