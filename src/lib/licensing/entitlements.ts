import type { DesignCodeId } from "@/lib/standards/types";
import { allFeaturesUnlocked } from "./validationMode";
import type { Entitlement, PlanTier } from "./types";

export function defaultEntitlement(): Entitlement {
  return { tier: "free", expiresAt: null, source: "default" };
}

export function tierRank(tier: PlanTier): number {
  switch (tier) {
    case "pro":
      return 3;
    case "supporter":
      return 2;
    default:
      return 1;
  }
}

export function hasMinTier(entitlement: Entitlement, required: PlanTier): boolean {
  if (entitlement.expiresAt && new Date(entitlement.expiresAt).getTime() < Date.now()) {
    return required === "free";
  }
  return tierRank(entitlement.tier) >= tierRank(required);
}

export function canUseDesignCode(entitlement: Entitlement, code: DesignCodeId): boolean {
  if (allFeaturesUnlocked()) return true;
  if (code === "INDICATIVE") return true;
  return hasMinTier(entitlement, "pro");
}

export function canExportPdf(entitlement: Entitlement): boolean {
  if (allFeaturesUnlocked()) return true;
  return hasMinTier(entitlement, "pro");
}

export function canExportCsv(_entitlement: Entitlement): boolean {
  return true;
}

export function tierLabel(tier: PlanTier): string {
  switch (tier) {
    case "pro":
      return "Pro";
    case "supporter":
      return "Supporter";
    default:
      return "Free";
  }
}
