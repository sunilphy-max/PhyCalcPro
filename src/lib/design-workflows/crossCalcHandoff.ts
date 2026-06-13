/**
 * Cross-calculator data handoff. A source module publishes result-derived
 * prefill parameters for a downstream module (gear forces -> shaft loads ->
 * bearing reactions); the target page shows an import banner and applies
 * them on request. Stored in sessionStorage so a handoff survives navigation
 * but not a new browser session.
 */

export type CalcHandoff = {
  fromModuleId: string;
  fromTitle: string;
  /** Human-readable description of what is being carried over */
  summary: string;
  /** Base-SI parameters for the target module */
  params: Record<string, number>;
  createdAt: string;
};

function storageKey(toModuleId: string) {
  return `phycalcpro:handoff:${toModuleId}`;
}

export function publishHandoff(
  toModuleId: string,
  handoff: Omit<CalcHandoff, "createdAt">
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      storageKey(toModuleId),
      JSON.stringify({ ...handoff, createdAt: new Date().toISOString() })
    );
  } catch {
    // Storage full or unavailable — handoff is best-effort.
  }
}

export function peekHandoff(toModuleId: string): CalcHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey(toModuleId));
    if (!raw) return null;
    return JSON.parse(raw) as CalcHandoff;
  } catch {
    return null;
  }
}

export function clearHandoff(toModuleId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(toModuleId));
}
