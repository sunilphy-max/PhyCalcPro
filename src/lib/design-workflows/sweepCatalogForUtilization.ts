export type CatalogCandidate<TFields extends Record<string, unknown> = Record<string, unknown>> = {
  label: string;
  utilization: number;
  fields: TFields;
  detail?: string;
};

export type CatalogSweepResult<TFields extends Record<string, unknown> = Record<string, unknown>> = {
  best: CatalogCandidate<TFields> | null;
  ranked: CatalogCandidate<TFields>[];
};

/**
 * Rank catalog entries by utilization against a target (typically 1.0).
 * Passing candidates (utilization <= target) sort first, then by lowest utilization / mass proxy.
 */
export function sweepCatalogForUtilization(
  items: Array<{
    label: string;
    utilization: number;
    fields: Record<string, unknown>;
    detail?: string;
  }>,
  targetUtilization = 1,
  limit = 12
): CatalogSweepResult {
  const ranked = [...items].sort((a, b) => {
    const aPass = a.utilization <= targetUtilization;
    const bPass = b.utilization <= targetUtilization;
    if (aPass !== bPass) return aPass ? -1 : 1;
    return a.utilization - b.utilization;
  });

  const passing = ranked.filter((item) => item.utilization <= targetUtilization);
  return {
    best: passing[0] ?? ranked[0] ?? null,
    ranked: ranked.slice(0, limit),
  };
}
