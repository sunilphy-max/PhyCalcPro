/**
 * Cross-calculator data handoff. A source module publishes result-derived
 * prefill parameters for a downstream module (gear forces -> shaft loads ->
 * bearing reactions); the target page shows an import banner and applies
 * them on request. Stored in sessionStorage so a handoff survives navigation
 * but not a new browser session.
 */

import { normalizeHandoffParams } from "@/lib/design-workflows/handoffParamRegistry";

export type CalcHandoff = {
  fromModuleId: string;
  fromTitle: string;
  /** Human-readable description of what is being carried over */
  summary: string;
  /** Base-SI parameters for the target module */
  params: Record<string, number>;
  createdAt: string;
  /** When true, target may auto-apply without user click (assembly workflow). */
  autoApply?: boolean;
};

const ASSEMBLY_AUTO_APPLY_KEY = "phycalcpro:handoff:autoApply";

function storageKey(toModuleId: string) {
  return `phycalcpro:handoff:${toModuleId}`;
}

export function setAssemblyAutoApply(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) window.sessionStorage.setItem(ASSEMBLY_AUTO_APPLY_KEY, "1");
  else window.sessionStorage.removeItem(ASSEMBLY_AUTO_APPLY_KEY);
}

export function shouldAssemblyAutoApply(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ASSEMBLY_AUTO_APPLY_KEY) === "1";
}

export type PublishHandoffOptions = {
  autoApply?: boolean;
};

export function publishHandoff(
  toModuleId: string,
  handoff: Omit<CalcHandoff, "createdAt">,
  options?: PublishHandoffOptions
): void {
  if (typeof window === "undefined") return;
  const autoApply = options?.autoApply ?? shouldAssemblyAutoApply();
  try {
    window.sessionStorage.setItem(
      storageKey(toModuleId),
      JSON.stringify({
        ...handoff,
        params: normalizeHandoffParams(handoff.params),
        createdAt: new Date().toISOString(),
        autoApply,
      })
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
    const parsed = JSON.parse(raw) as CalcHandoff;
    return { ...parsed, params: normalizeHandoffParams(parsed.params) };
  } catch {
    return null;
  }
}

export function clearHandoff(toModuleId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(toModuleId));
}
