import type { Material } from "@/data/materials";
import type { MaterialProfile } from "@/lib/materials/materialProfiles";

/** Browser event for centralized material apply across any module UI. */
export const MATERIAL_APPLY_EVENT = "phycalcpro:apply-material";

export type MaterialApplyDetail = {
  material: Material;
  /** Prefer matching this profile when multiple MaterialSelects exist */
  profile?: MaterialProfile;
  source?: "workspace" | "database" | "url" | "ai";
};

export function dispatchMaterialApply(detail: MaterialApplyDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MATERIAL_APPLY_EVENT, { detail }));
}

export function subscribeMaterialApply(
  handler: (detail: MaterialApplyDetail) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const custom = event as CustomEvent<MaterialApplyDetail>;
    if (custom.detail?.material) handler(custom.detail);
  };
  window.addEventListener(MATERIAL_APPLY_EVENT, listener);
  return () => window.removeEventListener(MATERIAL_APPLY_EVENT, listener);
}
