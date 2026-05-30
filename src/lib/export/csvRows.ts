export type CsvRow = Record<string, string | number | null | undefined>;

const SKIP_KEYS = new Set(["calculationSpec"]);

export function buildCsvRowsFromResult(
  result: Record<string, unknown> | null | undefined,
  extra?: CsvRow[]
): CsvRow[] | undefined {
  if (!result) return extra?.length ? extra : undefined;

  const rows: CsvRow[] = [];
  for (const [key, value] of Object.entries(result)) {
    if (SKIP_KEYS.has(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) {
      rows.push({ metric: key, value });
    } else if (typeof value === "string" || typeof value === "boolean") {
      rows.push({ metric: key, value: String(value) });
    }
  }

  if (extra?.length) {
    const seen = new Set(rows.map((r) => r.metric));
    for (const row of extra) {
      if (!seen.has(String(row.metric))) rows.push(row);
    }
  }

  return rows.length ? rows : undefined;
}

export function mergeCsvRows(...groups: (CsvRow[] | undefined)[]): CsvRow[] | undefined {
  const merged: CsvRow[] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    if (!group) continue;
    for (const row of group) {
      const key = String(row.metric);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
  }
  return merged.length ? merged : undefined;
}
