import { allModules } from "@/data/modules";

export type PowerTrainStepId =
  | "motor"
  | "v-belts"
  | "multi-pulley"
  | "shafts"
  | "bearings"
  | "keys-splines"
  | "housing"
  | "bolts"
  | "frames";

export type PowerTrainStepStatus = "pending" | "in_progress" | "complete" | "skipped";

export type PowerTrainStepDef = {
  id: PowerTrainStepId;
  moduleId: string;
  label: string;
  optional?: boolean;
  route: string;
};

export const POWER_TRAIN_STEPS: PowerTrainStepDef[] = [
  { id: "motor", moduleId: "motor", label: "Motor", route: "/products/dynamics/motor" },
  { id: "v-belts", moduleId: "v-belts", label: "V-Belt", route: "/products/power-transmission/v-belts" },
  {
    id: "multi-pulley",
    moduleId: "multi-pulley",
    label: "Pulley",
    optional: true,
    route: "/products/power-transmission/multi-pulley",
  },
  { id: "shafts", moduleId: "shafts", label: "Shaft", route: "/products/machine/shafts" },
  { id: "bearings", moduleId: "bearings", label: "Bearing", route: "/products/bearings/selection" },
  { id: "keys-splines", moduleId: "keys-splines", label: "Key", route: "/products/fasteners/keys-splines" },
  { id: "housing", moduleId: "housing", label: "Housing", route: "/products/bearings/housing" },
  { id: "bolts", moduleId: "bolts", label: "Fasteners", route: "/products/fasteners/bolts" },
  { id: "frames", moduleId: "frames", label: "Frame", route: "/products/structural/frames" },
];

/** Resolve routes from catalog when available. */
export function getPowerTrainStepRoute(moduleId: string): string {
  const fromCatalog = allModules.find((m) => m.id === moduleId)?.route;
  const fromSteps = POWER_TRAIN_STEPS.find((s) => s.moduleId === moduleId)?.route;
  return fromCatalog ?? fromSteps ?? "/products";
}

export type PowerTrainStepState = {
  status: PowerTrainStepStatus;
  moduleId: string;
  lastResultSummary?: string;
  completedAt?: string;
};

export type PowerTrainAssembly = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  steps: Record<PowerTrainStepId, PowerTrainStepState>;
  sharedParams: Record<string, number>;
};

const INDEX_KEY = "phycalcpro:assembly:index";
const ACTIVE_KEY = "phycalcpro:assembly:active";
const assemblyKey = (id: string) => `phycalcpro:assembly:${id}`;

function defaultSteps(): Record<PowerTrainStepId, PowerTrainStepState> {
  const steps = {} as Record<PowerTrainStepId, PowerTrainStepState>;
  for (const step of POWER_TRAIN_STEPS) {
    steps[step.id] = { status: "pending", moduleId: step.moduleId };
  }
  return steps;
}

function readIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

export function createPowerTrainAssembly(name?: string): PowerTrainAssembly {
  const id = `pt-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const assembly: PowerTrainAssembly = {
    id,
    name: name?.trim() || `Power train ${new Date().toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now,
    steps: defaultSteps(),
    sharedParams: {},
  };
  assembly.steps.motor.status = "in_progress";
  savePowerTrainAssembly(assembly);
  setActiveAssemblyId(id);
  return assembly;
}

export function savePowerTrainAssembly(assembly: PowerTrainAssembly): void {
  if (typeof window === "undefined") return;
  const updated = { ...assembly, updatedAt: new Date().toISOString() };
  window.sessionStorage.setItem(assemblyKey(updated.id), JSON.stringify(updated));
  const index = readIndex();
  if (!index.includes(updated.id)) {
    writeIndex([updated.id, ...index]);
  }
}

export function loadPowerTrainAssembly(id: string): PowerTrainAssembly | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(assemblyKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as PowerTrainAssembly;
  } catch {
    return null;
  }
}

export function listPowerTrainAssemblies(): PowerTrainAssembly[] {
  return readIndex()
    .map((id) => loadPowerTrainAssembly(id))
    .filter((a): a is PowerTrainAssembly => a != null);
}

export function setActiveAssemblyId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) window.sessionStorage.setItem(ACTIVE_KEY, id);
  else window.sessionStorage.removeItem(ACTIVE_KEY);
}

export function getActiveAssemblyId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ACTIVE_KEY);
}

export function stepIdForModule(moduleId: string): PowerTrainStepId | null {
  const step = POWER_TRAIN_STEPS.find((s) => s.moduleId === moduleId);
  return step?.id ?? null;
}

export function markAssemblyStepComplete(
  assemblyId: string,
  moduleId: string,
  summary?: string,
  params?: Record<string, number>
): PowerTrainAssembly | null {
  const assembly = loadPowerTrainAssembly(assemblyId);
  if (!assembly) return null;
  const stepId = stepIdForModule(moduleId);
  if (!stepId) return assembly;

  const now = new Date().toISOString();
  assembly.steps[stepId] = {
    ...assembly.steps[stepId],
    status: "complete",
    lastResultSummary: summary,
    completedAt: now,
  };

  const stepIndex = POWER_TRAIN_STEPS.findIndex((s) => s.id === stepId);
  const next = POWER_TRAIN_STEPS[stepIndex + 1];
  if (next && assembly.steps[next.id].status === "pending") {
    assembly.steps[next.id] = { ...assembly.steps[next.id], status: "in_progress" };
  }

  if (params) {
    assembly.sharedParams = { ...assembly.sharedParams, ...params };
  }

  savePowerTrainAssembly(assembly);
  return assembly;
}

export function skipAssemblyStep(assemblyId: string, stepId: PowerTrainStepId): PowerTrainAssembly | null {
  const assembly = loadPowerTrainAssembly(assemblyId);
  if (!assembly) return null;
  assembly.steps[stepId] = { ...assembly.steps[stepId], status: "skipped" };
  const stepIndex = POWER_TRAIN_STEPS.findIndex((s) => s.id === stepId);
  const next = POWER_TRAIN_STEPS[stepIndex + 1];
  if (next && assembly.steps[next.id].status === "pending") {
    assembly.steps[next.id] = { ...assembly.steps[next.id], status: "in_progress" };
  }
  savePowerTrainAssembly(assembly);
  return assembly;
}

export function nextStepAfter(moduleId: string): PowerTrainStepDef | null {
  const idx = POWER_TRAIN_STEPS.findIndex((s) => s.moduleId === moduleId);
  if (idx < 0) return null;
  return POWER_TRAIN_STEPS[idx + 1] ?? null;
}

export function deletePowerTrainAssembly(id: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(assemblyKey(id));
  writeIndex(readIndex().filter((x) => x !== id));
  if (getActiveAssemblyId() === id) setActiveAssemblyId(null);
}
