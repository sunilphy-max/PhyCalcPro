import type { MaterialProfile } from "@/lib/materials/materialProfiles";
import type { TeachPrompt } from "@/components/workspace/WorkspaceTeachPanel";
import { allModules } from "@/data/modules";
import {
  buildBeamWorkspaceContract,
  defaultReportSections,
  type DesignWorkspaceContract,
  type WorkspaceTabId,
} from "@/lib/workspace/designWorkspaceContract";

export type WorkspaceTabFlags = Partial<Record<Exclude<WorkspaceTabId, "calculator">, boolean>>;

export type ModuleWorkspaceEntry = {
  title: string;
  knowledgeSlug: string;
  /** Catalog profile for Materials tab filtering; omit = show full catalog (apply still works by name) */
  materialProfile?: MaterialProfile;
  /** Whether this module binds catalog mechanical properties into inputs */
  acceptsCatalogMaterial: boolean;
  tabs?: WorkspaceTabFlags;
  teachPrompts?: TeachPrompt[];
  relatedModuleIds?: string[];
  diagramKind?: DesignWorkspaceContract["diagramModel"];
};

const GENERIC_TEACH: TeachPrompt[] = [
  {
    id: "units",
    question: "Why do units matter?",
    answer:
      "Solvers work in SI base units internally. Display units are for convenience — always confirm the unit next to each field before interpreting utilization.",
  },
  {
    id: "utilization",
    question: "What is utilization?",
    answer:
      "Utilization is demand / capacity (or deflection / limit). Values ≤ 1.0 typically pass for the chosen allowable or code check; > 1.0 needs a larger section, stronger material, or reduced load.",
  },
  {
    id: "indicative",
    question: "What does indicative / screening mean?",
    answer:
      "Many modules are screening-level: useful for sizing and trade studies, not a stamped code worksheet. Check the maturity badge and Calculation Basis before release.",
  },
  {
    id: "materials",
    question: "How do I pick a material?",
    answer:
      "Use the Materials workspace tab or the in-form Material select. Catalog values populate E, Fy, and related properties. Prefer grades called out by your design standard.",
  },
];

const BEAM_TEACH: TeachPrompt[] = [
  {
    id: "moment",
    question: "What is bending moment?",
    answer:
      "Bending moment is the internal torque that causes curvature. Maximum moment usually governs section sizing because bending stress σ = M·c / I peaks there.",
  },
  {
    id: "l360",
    question: "Why L/360?",
    answer:
      "L/360 is a common serviceability deflection limit for floors and many general beams — span/360 keeps bounce and finishes within typical architectural expectations.",
  },
  {
    id: "a992",
    question: "Why choose ASTM A992?",
    answer:
      "A992 is the preferred US structural steel for W-shapes: Fy ≈ 345 MPa with good weldability. European designs often start from S355JR.",
  },
  ...GENERIC_TEACH,
];

const SHAFT_TEACH: TeachPrompt[] = [
  {
    id: "fatigue",
    question: "Why check fatigue on shafts?",
    answer:
      "Rotating shafts see fully reversed bending. Endurance limit and stress concentration at shoulders/keyways often govern diameter more than static yield.",
  },
  {
    id: "stepped",
    question: "Why use stepped geometry?",
    answer:
      "Steps locate bearings and gears and reduce mass, but introduce Kt. Model shoulders and features explicitly when fatigue matters.",
  },
  ...GENERIC_TEACH,
];

const BEARING_TEACH: TeachPrompt[] = [
  {
    id: "life",
    question: "What is L10 life?",
    answer:
      "ISO 281 basic rating life L10 is the life 90% of a bearing population is expected to achieve or exceed under the stated load and speed.",
  },
  {
    id: "static",
    question: "When does static capacity govern?",
    answer:
      "High peak loads, low speed, or oscillation can make static safety (ISO 76) govern over fatigue life.",
  },
  ...GENERIC_TEACH,
];

/** Explicit overrides; all other modules get a sensible default from allModules. */
const OVERRIDES: Partial<Record<string, Partial<ModuleWorkspaceEntry>>> = {
  beams: {
    title: "Beam Design Workspace",
    materialProfile: "structural",
    acceptsCatalogMaterial: true,
    teachPrompts: BEAM_TEACH,
    diagramKind: { kind: "beam-2d" },
    tabs: { model: true, knowledge: true, materials: true, report: true, ai: true, teach: true },
  },
  shafts: {
    title: "Shaft Design Workspace",
    materialProfile: "machine-shaft",
    acceptsCatalogMaterial: true,
    teachPrompts: SHAFT_TEACH,
    diagramKind: { kind: "shaft-1d" },
    tabs: { model: true, knowledge: true, materials: true, report: true, ai: true, teach: true },
  },
  bearings: {
    title: "Rolling Bearing Workspace",
    acceptsCatalogMaterial: false,
    teachPrompts: BEARING_TEACH,
    diagramKind: { kind: "bearing-schematic" },
    tabs: { knowledge: true, materials: true, report: true, ai: true, teach: true, model: false },
  },
  "plain-bearings": {
    title: "Plain Bearing Workspace",
    acceptsCatalogMaterial: false,
    teachPrompts: BEARING_TEACH,
    tabs: { knowledge: true, materials: true, report: true, ai: true, teach: true },
  },
  housing: {
    title: "Bearing Housing Workspace",
    materialProfile: "structural",
    acceptsCatalogMaterial: true,
    teachPrompts: GENERIC_TEACH,
  },
  columns: { materialProfile: "structural", acceptsCatalogMaterial: true },
  frames: { materialProfile: "structural", acceptsCatalogMaterial: true },
  trusses: { materialProfile: "structural", acceptsCatalogMaterial: true },
  plates: { materialProfile: "plate-shell", acceptsCatalogMaterial: true },
  "circular-plates": { materialProfile: "plate-shell", acceptsCatalogMaterial: true },
  shells: { materialProfile: "plate-shell", acceptsCatalogMaterial: true },
  "combined-loading": { materialProfile: "structural", acceptsCatalogMaterial: true },
  gears: { materialProfile: "machine-gear", acceptsCatalogMaterial: true },
  "internal-gears-rack": { materialProfile: "machine-gear", acceptsCatalogMaterial: true },
  "bevel-gears": { materialProfile: "machine-gear", acceptsCatalogMaterial: true },
  "worm-gears": { materialProfile: "machine-gear", acceptsCatalogMaterial: true },
  "planetary-gears": { materialProfile: "machine-gear", acceptsCatalogMaterial: true },
  flywheels: { materialProfile: "machine-shaft", acceptsCatalogMaterial: true },
  welds: { materialProfile: "weld-base", acceptsCatalogMaterial: true },
  rivets: { materialProfile: "rivet", acceptsCatalogMaterial: true },
  bolts: { materialProfile: "bolt", acceptsCatalogMaterial: true },
  vessels: { materialProfile: "pressure", acceptsCatalogMaterial: true },
  pipes: { materialProfile: "pressure", acceptsCatalogMaterial: true },
  vibrations: { materialProfile: "dynamics", acceptsCatalogMaterial: true },
  impact: { materialProfile: "dynamics", acceptsCatalogMaterial: true },
  "compression-springs": {
    materialProfile: "machine-shaft",
    acceptsCatalogMaterial: true,
    title: "Compression Spring Workspace",
  },
  "extension-springs": { materialProfile: "machine-shaft", acceptsCatalogMaterial: true },
  "torsion-springs": { materialProfile: "machine-shaft", acceptsCatalogMaterial: true },
};

const DEFAULT_TABS: WorkspaceTabFlags = {
  knowledge: true,
  materials: true,
  report: true,
  ai: true,
  teach: true,
  model: false,
};

export function getModuleWorkspaceEntry(moduleId: string): ModuleWorkspaceEntry {
  const mod = allModules.find((m) => m.id === moduleId);
  const override = OVERRIDES[moduleId] ?? {};
  return {
    title: override.title ?? `${mod?.title ?? moduleId} Workspace`,
    knowledgeSlug: override.knowledgeSlug ?? moduleId,
    materialProfile: override.materialProfile,
    acceptsCatalogMaterial: override.acceptsCatalogMaterial ?? Boolean(override.materialProfile),
    tabs: { ...DEFAULT_TABS, ...override.tabs },
    teachPrompts: override.teachPrompts ?? GENERIC_TEACH,
    relatedModuleIds: override.relatedModuleIds,
    diagramKind: override.diagramKind ?? { kind: "generic" },
  };
}

export function buildWorkspaceContractForModule(moduleId: string): DesignWorkspaceContract {
  const entry = getModuleWorkspaceEntry(moduleId);
  if (moduleId === "beams") {
    return buildBeamWorkspaceContract({
      title: entry.title,
      knowledgeSlug: entry.knowledgeSlug,
      relatedModuleIds: entry.relatedModuleIds,
      diagramModel: entry.diagramKind,
    });
  }
  return {
    moduleId,
    title: entry.title,
    knowledgeSlug: entry.knowledgeSlug,
    reportSections: defaultReportSections(),
    relatedModuleIds: entry.relatedModuleIds,
    diagramModel: entry.diagramKind,
    aiContext: { moduleId },
    materialBindings: entry.materialProfile
      ? { boundFields: ["E", "yieldStress", "density"] }
      : undefined,
  };
}

/** Modules that can deep-link `?material=` from the materials database. */
export function modulesAcceptingCatalogMaterial(): { id: string; title: string; route: string }[] {
  return allModules
    .filter((m) => !m.comingSoon && getModuleWorkspaceEntry(m.id).acceptsCatalogMaterial && m.route)
    .map((m) => ({ id: m.id, title: m.title, route: m.route }));
}
