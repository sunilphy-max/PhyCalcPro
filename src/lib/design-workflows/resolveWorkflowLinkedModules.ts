import { allModules, type EngineeringModule } from "@/data/modules";

/** Legacy / path-style ids used in workflow configs before module id normalization. */
const MODULE_ID_ALIASES: Record<string, string> = {
  "materials/database": "material-db",
};

export function resolveWorkflowLinkedModule(id: string): EngineeringModule | undefined {
  const canonicalId = MODULE_ID_ALIASES[id] ?? id;

  const exact = allModules.find((module) => module.id === canonicalId && !module.comingSoon);
  if (exact) return exact;

  const routeMatches = allModules
    .filter((module) => !module.comingSoon && module.route.endsWith(`/${canonicalId}`))
    .sort((a, b) => b.route.length - a.route.length);

  if (routeMatches[0]) return routeMatches[0];

  return allModules.find(
    (module) => !module.comingSoon && module.route.split("/").pop() === canonicalId
  );
}

export function resolveWorkflowLinkedModules(ids: string[]): EngineeringModule[] {
  const seen = new Set<string>();
  return ids
    .map((id) => resolveWorkflowLinkedModule(id))
    .filter((module): module is EngineeringModule => {
      if (!module || seen.has(module.id)) return false;
      seen.add(module.id);
      return true;
    });
}
