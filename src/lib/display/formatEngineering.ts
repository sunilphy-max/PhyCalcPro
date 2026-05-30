/** Use scientific notation for very large/small magnitudes (e.g. E, SF from near-zero stress). */
export function shouldUseScientificNotation(value: number): boolean {
  const abs = Math.abs(value);
  if (abs === 0 || !Number.isFinite(value)) return false;
  return abs >= 1e3 || (abs > 0 && abs < 0.01);
}

/**
 * Format a bare number for UI (metric cards, tables). Auto-switches to scientific when appropriate.
 */
export function formatDisplayNumber(
  value: number | null | undefined,
  options?: { digits?: number; useExponential?: boolean }
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const useExp =
    options?.useExponential ?? shouldUseScientificNotation(value);
  const digits =
    options?.digits ??
    (useExp ? 3 : Math.abs(value) >= 100 ? 1 : 2);
  return useExp
    ? value.toExponential(digits)
    : value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

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
  const formatted = formatDisplayNumber(value, options);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatAxisTitle(label: string, unit?: string): string {
  const trimmed = label.trim();
  if (!unit) return trimmed;
  if (trimmed.includes(`(${unit})`) || trimmed.endsWith(unit)) return trimmed;
  return `${trimmed} (${unit})`;
}
