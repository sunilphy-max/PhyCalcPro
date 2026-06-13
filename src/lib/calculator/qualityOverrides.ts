/** Shared quality checklist flags for modules with charts and exportable visuals. */
export function chartModuleQuality(options?: { physicsValidation?: boolean }) {
  return {
    unitIntegrity: true,
    physicsValidation: options?.physicsValidation ?? true,
    chartConformance: true,
    pictorialCoverage: true,
    exportConsistency: true,
  };
}

/** Metrics-only modules — honest export checklist without chart claims. */
export function metricsModuleQuality() {
  return {
    unitIntegrity: true,
    physicsValidation: true,
    chartConformance: false,
    pictorialCoverage: false,
    exportConsistency: true,
  };
}
