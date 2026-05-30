/**
 * Consistent numeric + unit formatting for charts and metric cards.
 */
export function formatEngineeringValue(
  value: number | null | undefined,
  unit: string,
  options?: { digits?: number; useExponential?: boolean }
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const digits = options?.digits ?? (Math.abs(value) < 0.01 || Math.abs(value) >= 1e4 ? 3 : 2);
  const formatted = options?.useExponential
    ? value.toExponential(digits)
    : value.toLocaleString(undefined, { maximumFractionDigits: digits });
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatAxisTitle(label: string, unit?: string): string {
  const trimmed = label.trim();
  if (!unit) return trimmed;
  if (trimmed.includes(`(${unit})`) || trimmed.endsWith(unit)) return trimmed;
  return `${trimmed} (${unit})`;
}
