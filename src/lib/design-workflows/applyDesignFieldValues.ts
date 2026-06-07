/** Apply design-mode / select-mode candidate fields to page setters. */
export function applyDesignFieldValues(
  fields: Record<string, unknown>,
  setters: Record<string, (value: unknown) => void>
): void {
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;
    const setter = setters[key];
    if (setter) setter(value);
  }
}
