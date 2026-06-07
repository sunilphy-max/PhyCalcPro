import { allModules } from "@/data/modules";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

export type ComputedDesignCandidate = {
  option: string;
  size: string;
  utilization: number;
  margin: number;
  status: "pass" | "review" | "fail";
  governing: string;
  detail: string;
  fields?: Record<string, unknown>;
};

export type ComputedDesignSet = {
  moduleId: string;
  title: string;
  method: string;
  assumptions: string[];
  equations: string[];
  candidates: ComputedDesignCandidate[];
  recommendation: string;
};

function statusFromUtilization(utilization: number): ComputedDesignCandidate["status"] {
  if (utilization <= 0.9) return "pass";
  if (utilization <= 1.05) return "review";
  return "fail";
}

function toCandidate(
  label: string,
  detail: string,
  utilization: number,
  governing = "design target",
  fields?: Record<string, unknown>
): ComputedDesignCandidate {
  return {
    option: label,
    size: label,
    utilization,
    margin: utilization > 0 ? 1 / utilization : Number.POSITIVE_INFINITY,
    status: statusFromUtilization(utilization),
    governing,
    detail,
    fields,
  };
}

function selectRecommendation(candidates: ComputedDesignCandidate[]): string {
  const preferred = candidates.find((item) => item.status === "pass") ?? candidates[0];
  if (!preferred) return "No candidate generated.";
  return `${preferred.option} is the first passing candidate with ${preferred.governing} governing.`;
}

export function getComputedDesignSet(
  moduleId: string,
  userInputs: ModuleUserInputs = {}
): ComputedDesignSet | undefined {
  const catalogModule =
    allModules.find((item) => item.id === moduleId) ??
    (moduleId === "profiles"
      ? { id: "profiles", title: "Cross-Sectional Area Properties", category: "materials" }
      : undefined);
  if (!catalogModule) return undefined;

  const design = runModuleDesignMode(moduleId, userInputs);
  if (!design) return undefined;

  const candidates = design.ranked.map((item) =>
    toCandidate(item.label, item.detail ?? "", item.utilization, "design target", item.fields)
  );

  return {
    moduleId: catalogModule.id,
    title: catalogModule.title,
    method: design.method,
    assumptions: ["Computed from live calculator inputs via module design registry."],
    equations: ["utilization = demand / capacity (module-specific)"],
    candidates,
    recommendation: selectRecommendation(candidates),
  };
}

export function getComputedDesignCoverage() {
  const modules = [
    ...allModules.filter((m) => !m.comingSoon),
    { id: "profiles", comingSoon: false },
  ];
  const withCandidates = modules.filter((m) => {
    const set = getComputedDesignSet(m.id, {});
    return set && set.candidates.length > 0;
  });
  return {
    total: modules.length,
    withCandidates: withCandidates.length,
    checkOnly: allModules.filter((m) => m.category === "tools").length,
  };
}
