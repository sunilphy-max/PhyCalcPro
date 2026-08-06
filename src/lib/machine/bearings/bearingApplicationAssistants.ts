/**
 * Machine-specific selection assistants (PhyCalc).
 * Maps short forms → Designer deep links + apply payload.
 */

import type { BearingCopilotApplyPayload } from "@/lib/copilot/bearingCopilot";
import type { BearingMountingSystemId } from "@/lib/machine/bearings/bearingProject";
import type { BearingSealType } from "@/lib/machine/bearings/types";

export type BearingAssistantId =
  | "motor"
  | "pump"
  | "fan"
  | "gearbox"
  | "conveyor"
  | "ballscrew";

export type AssistantFieldKind = "number" | "select";

export type AssistantField = {
  id: string;
  label: string;
  kind: AssistantFieldKind;
  unit?: string;
  defaultValue: string | number;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  help?: string;
};

/** Extended apply payload — mounting/seal used by Designer assistant apply. */
export type BearingAssistantApplyPayload = BearingCopilotApplyPayload & {
  mountingSystem?: BearingMountingSystemId;
  sealFilter?: BearingSealType | "all";
};

export type BearingApplicationAssistant = {
  id: BearingAssistantId;
  label: string;
  blurb: string;
  /** Short outcome line for hub cards */
  outcome: string;
  fields: AssistantField[];
  /** Default Designer stage after apply */
  panel: "duty" | "system" | "size" | "verify";
};

export type AssistantAnswers = Record<string, string | number>;

function num(answers: AssistantAnswers, id: string, fallback: number): number {
  const raw = answers[id];
  if (raw === "" || raw == null) return fallback;
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  return Number.isFinite(n) ? n : fallback;
}

function str(answers: AssistantAnswers, id: string, fallback: string): string {
  const raw = answers[id];
  if (raw == null || raw === "") return fallback;
  return String(raw);
}

/** Rough motor overhung / residual radial from shaft power (screening only). */
export function estimateMotorRadialN(powerKw: number, rpm: number, boreMm: number): number {
  const n = Math.max(rpm, 1);
  const d = Math.max(boreMm, 10);
  const torqueNm = (powerKw * 1000) / ((n * Math.PI) / 30);
  // Assume load acts ~0.5×bore beyond bearing centerline (screening).
  const leverM = Math.max(d / 2000, 0.02);
  return Math.max(400, torqueNm / leverM);
}

export const BEARING_APPLICATION_ASSISTANTS: BearingApplicationAssistant[] = [
  {
    id: "motor",
    label: "Electric motor",
    blurb: "DE locating + NDE floating deep-groove / cylindrical pair — PhyCalc motor path.",
    outcome: "Size DE/NDE bearings from shaft, speed, and duty",
    panel: "system",
    fields: [
      {
        id: "boreMm",
        label: "Shaft diameter",
        kind: "number",
        unit: "mm",
        defaultValue: 25,
        min: 5,
        max: 200,
        step: 1,
      },
      {
        id: "powerKw",
        label: "Shaft power",
        kind: "number",
        unit: "kW",
        defaultValue: 7.5,
        min: 0.1,
        max: 5000,
        step: 0.1,
        help: "Used to estimate residual radial load when Fr is left blank or zero.",
      },
      {
        id: "rpm",
        label: "Speed",
        kind: "number",
        unit: "rpm",
        defaultValue: 1500,
        min: 1,
        max: 30000,
        step: 1,
      },
      {
        id: "radialLoadN",
        label: "Radial load Fr",
        kind: "number",
        unit: "N",
        defaultValue: 0,
        min: 0,
        step: 10,
        help: "Leave 0 to estimate from power and shaft diameter.",
      },
      {
        id: "axialLoadN",
        label: "Axial load Fa",
        kind: "number",
        unit: "N",
        defaultValue: 0,
        min: 0,
        step: 10,
      },
      {
        id: "lifeHours",
        label: "Target L₁₀ life",
        kind: "number",
        unit: "h",
        defaultValue: 20000,
        min: 100,
        step: 100,
      },
      {
        id: "lube",
        label: "Lubrication",
        kind: "select",
        defaultValue: "grease",
        options: [
          { value: "grease", label: "Grease (sealed / shielded)" },
          { value: "oil", label: "Oil bath / mist" },
        ],
      },
    ],
  },
  {
    id: "pump",
    label: "Centrifugal pump",
    blurb: "Overhung impeller duty — combined loads with locating + floating stations.",
    outcome: "Screen pump DE/NDE bearings from impeller loads",
    panel: "system",
    fields: [
      {
        id: "boreMm",
        label: "Shaft diameter",
        kind: "number",
        unit: "mm",
        defaultValue: 40,
        min: 10,
        max: 250,
        step: 1,
      },
      {
        id: "rpm",
        label: "Speed",
        kind: "number",
        unit: "rpm",
        defaultValue: 2950,
        min: 1,
        max: 20000,
        step: 1,
      },
      {
        id: "radialLoadN",
        label: "Radial load Fr",
        kind: "number",
        unit: "N",
        defaultValue: 3500,
        min: 0,
        step: 50,
      },
      {
        id: "axialLoadN",
        label: "Axial (thrust) Fa",
        kind: "number",
        unit: "N",
        defaultValue: 1200,
        min: 0,
        step: 50,
      },
      {
        id: "lifeHours",
        label: "Target L₁₀ life",
        kind: "number",
        unit: "h",
        defaultValue: 25000,
        min: 100,
        step: 100,
      },
      {
        id: "lube",
        label: "Lubrication",
        kind: "select",
        defaultValue: "oil",
        options: [
          { value: "grease", label: "Grease" },
          { value: "oil", label: "Oil" },
        ],
      },
    ],
  },
  {
    id: "fan",
    label: "Fan / blower",
    blurb: "Belt or direct-drive radial-dominant duty with contamination-aware grease defaults.",
    outcome: "Size fan shaft bearings from belt / impeller loads",
    panel: "duty",
    fields: [
      {
        id: "boreMm",
        label: "Shaft diameter",
        kind: "number",
        unit: "mm",
        defaultValue: 30,
        min: 8,
        max: 200,
        step: 1,
      },
      {
        id: "rpm",
        label: "Speed",
        kind: "number",
        unit: "rpm",
        defaultValue: 1000,
        min: 1,
        max: 10000,
        step: 1,
      },
      {
        id: "drive",
        label: "Drive type",
        kind: "select",
        defaultValue: "belt",
        options: [
          { value: "belt", label: "Belt / sheave (high Fr)" },
          { value: "direct", label: "Direct couple" },
        ],
      },
      {
        id: "radialLoadN",
        label: "Radial load Fr",
        kind: "number",
        unit: "N",
        defaultValue: 4500,
        min: 0,
        step: 50,
        help: "Belt tension dominates for sheave drives.",
      },
      {
        id: "axialLoadN",
        label: "Axial load Fa",
        kind: "number",
        unit: "N",
        defaultValue: 200,
        min: 0,
        step: 10,
      },
      {
        id: "lifeHours",
        label: "Target L₁₀ life",
        kind: "number",
        unit: "h",
        defaultValue: 40000,
        min: 100,
        step: 100,
      },
    ],
  },
  {
    id: "gearbox",
    label: "Industrial gearbox",
    blurb: "Pinion / intermediate shaft with combined loads and locating + floating pair.",
    outcome: "Screen gearbox shaft bearings for combined Fa/Fr",
    panel: "system",
    fields: [
      {
        id: "boreMm",
        label: "Shaft diameter",
        kind: "number",
        unit: "mm",
        defaultValue: 50,
        min: 15,
        max: 300,
        step: 1,
      },
      {
        id: "rpm",
        label: "Speed",
        kind: "number",
        unit: "rpm",
        defaultValue: 1200,
        min: 1,
        max: 15000,
        step: 1,
      },
      {
        id: "radialLoadN",
        label: "Radial load Fr",
        kind: "number",
        unit: "N",
        defaultValue: 12000,
        min: 0,
        step: 100,
      },
      {
        id: "axialLoadN",
        label: "Axial load Fa",
        kind: "number",
        unit: "N",
        defaultValue: 4000,
        min: 0,
        step: 100,
      },
      {
        id: "shock",
        label: "Duty severity",
        kind: "select",
        defaultValue: "normal",
        options: [
          { value: "normal", label: "Steady / moderate" },
          { value: "shock", label: "Shock / misalignment" },
        ],
      },
      {
        id: "lifeHours",
        label: "Target L₁₀ life",
        kind: "number",
        unit: "h",
        defaultValue: 30000,
        min: 100,
        step: 100,
      },
    ],
  },
  {
    id: "conveyor",
    label: "Conveyor pulley",
    blurb: "Idler / head pulley radial support — deep groove or spherical for misalignment.",
    outcome: "Select pulley bearings from belt tension and speed",
    panel: "duty",
    fields: [
      {
        id: "boreMm",
        label: "Shaft diameter",
        kind: "number",
        unit: "mm",
        defaultValue: 45,
        min: 15,
        max: 250,
        step: 1,
      },
      {
        id: "rpm",
        label: "Speed",
        kind: "number",
        unit: "rpm",
        defaultValue: 120,
        min: 1,
        max: 2000,
        step: 1,
      },
      {
        id: "radialLoadN",
        label: "Radial load Fr",
        kind: "number",
        unit: "N",
        defaultValue: 8000,
        min: 0,
        step: 100,
      },
      {
        id: "axialLoadN",
        label: "Axial load Fa",
        kind: "number",
        unit: "N",
        defaultValue: 500,
        min: 0,
        step: 50,
      },
      {
        id: "align",
        label: "Alignment",
        kind: "select",
        defaultValue: "rigid",
        options: [
          { value: "rigid", label: "Well aligned (deep groove)" },
          { value: "misalign", label: "Misalignment / deflection (spherical)" },
        ],
      },
      {
        id: "lifeHours",
        label: "Target L₁₀ life",
        kind: "number",
        unit: "h",
        defaultValue: 50000,
        min: 100,
        step: 100,
      },
    ],
  },
  {
    id: "ballscrew",
    label: "Ballscrew support",
    blurb: "Duplex angular-contact O/X for axial-dominant screw support.",
    outcome: "Size duplex AC bearings for ballscrew thrust",
    panel: "system",
    fields: [
      {
        id: "boreMm",
        label: "Shaft / journal diameter",
        kind: "number",
        unit: "mm",
        defaultValue: 20,
        min: 6,
        max: 80,
        step: 1,
      },
      {
        id: "rpm",
        label: "Speed",
        kind: "number",
        unit: "rpm",
        defaultValue: 2000,
        min: 1,
        max: 20000,
        step: 1,
      },
      {
        id: "radialLoadN",
        label: "Radial load Fr",
        kind: "number",
        unit: "N",
        defaultValue: 800,
        min: 0,
        step: 10,
      },
      {
        id: "axialLoadN",
        label: "Axial load Fa",
        kind: "number",
        unit: "N",
        defaultValue: 5000,
        min: 0,
        step: 50,
      },
      {
        id: "duplex",
        label: "Duplex arrangement",
        kind: "select",
        defaultValue: "back_to_back",
        options: [
          { value: "back_to_back", label: "Back-to-back (O)" },
          { value: "face_to_face", label: "Face-to-face (X)" },
          { value: "tandem", label: "Tandem (T)" },
        ],
      },
      {
        id: "lifeHours",
        label: "Target L₁₀ life",
        kind: "number",
        unit: "h",
        defaultValue: 10000,
        min: 100,
        step: 100,
      },
    ],
  },
];

export function getBearingAssistant(
  id: string | null | undefined
): BearingApplicationAssistant | null {
  if (!id) return null;
  return BEARING_APPLICATION_ASSISTANTS.find((a) => a.id === id) ?? null;
}

export function defaultAssistantAnswers(assistant: BearingApplicationAssistant): AssistantAnswers {
  const out: AssistantAnswers = {};
  for (const f of assistant.fields) {
    out[f.id] = f.defaultValue;
  }
  return out;
}

export function parseAssistantId(value: string | null | undefined): BearingAssistantId | null {
  if (!value) return null;
  const hit = BEARING_APPLICATION_ASSISTANTS.find((a) => a.id === value);
  return hit?.id ?? null;
}

function lubePayload(lube: string): Pick<
  BearingAssistantApplyPayload,
  "lubricantType" | "isoVgGrade" | "operatingTempC" | "contamination" | "sealFilter"
> {
  if (lube === "grease") {
    return {
      lubricantType: "grease",
      isoVgGrade: 100,
      operatingTempC: 70,
      contamination: "normal_clean",
      sealFilter: "sealed",
    };
  }
  return {
    lubricantType: "oil",
    isoVgGrade: 68,
    operatingTempC: 70,
    contamination: "normal_clean",
    sealFilter: "open",
  };
}

export function toAssistantApplyPayload(
  id: BearingAssistantId,
  answers: AssistantAnswers
): BearingAssistantApplyPayload {
  const boreMm = num(answers, "boreMm", 25);
  const rpm = num(answers, "rpm", 1500);
  const lifeHours = num(answers, "lifeHours", 20000);

  switch (id) {
    case "motor": {
      const powerKw = num(answers, "powerKw", 7.5);
      let radial = num(answers, "radialLoadN", 0);
      if (radial <= 0) radial = estimateMotorRadialN(powerKw, rpm, boreMm);
      const axial = num(answers, "axialLoadN", 0);
      const lube = str(answers, "lube", "grease");
      return {
        radialLoad: radial,
        axialLoad: axial,
        speed: rpm,
        lifeHours,
        safetyFactor: 1.5,
        bearingType: "deep_groove",
        applicationProfile: "high_speed",
        arrangement: "single",
        maxBoreMm: boreMm,
        mountingSystem: "locating_dg_floating_nu",
        resetCatalogFilters: true,
        ...lubePayload(lube),
      };
    }
    case "pump": {
      const lube = str(answers, "lube", "oil");
      return {
        radialLoad: num(answers, "radialLoadN", 3500),
        axialLoad: num(answers, "axialLoadN", 1200),
        speed: rpm,
        lifeHours,
        safetyFactor: 1.5,
        bearingType: "angular_contact",
        applicationProfile: "combined_loads",
        arrangement: "single",
        maxBoreMm: boreMm,
        mountingSystem: "locating_ac_floating_nu",
        resetCatalogFilters: true,
        ...lubePayload(lube),
      };
    }
    case "fan": {
      const drive = str(answers, "drive", "belt");
      const radial =
        drive === "belt"
          ? Math.max(num(answers, "radialLoadN", 4500), 2000)
          : num(answers, "radialLoadN", 1500);
      return {
        radialLoad: radial,
        axialLoad: num(answers, "axialLoadN", 200),
        speed: rpm,
        lifeHours,
        safetyFactor: 1.5,
        bearingType: "deep_groove",
        applicationProfile: "general_radial",
        arrangement: "single",
        maxBoreMm: boreMm,
        mountingSystem: "locating_dg_floating_nu",
        lubricantType: "grease",
        isoVgGrade: 100,
        operatingTempC: 60,
        contamination: drive === "belt" ? "slight_contamination" : "normal_clean",
        sealFilter: "sealed",
        resetCatalogFilters: true,
      };
    }
    case "gearbox": {
      const shock = str(answers, "shock", "normal");
      const heavy = shock === "shock";
      return {
        radialLoad: num(answers, "radialLoadN", 12000),
        axialLoad: num(answers, "axialLoadN", 4000),
        speed: rpm,
        lifeHours,
        safetyFactor: heavy ? 2 : 1.5,
        bearingType: heavy ? "spherical_roller" : "tapered_roller",
        applicationProfile: heavy ? "heavy_shock" : "combined_loads",
        arrangement: "single",
        maxBoreMm: boreMm,
        mountingSystem: heavy ? "single" : "locating_dg_floating_nu",
        lubricantType: "oil",
        isoVgGrade: 220,
        operatingTempC: 80,
        contamination: "normal_clean",
        sealFilter: "open",
        resetCatalogFilters: true,
      };
    }
    case "conveyor": {
      const align = str(answers, "align", "rigid");
      return {
        radialLoad: num(answers, "radialLoadN", 8000),
        axialLoad: num(answers, "axialLoadN", 500),
        speed: rpm,
        lifeHours,
        safetyFactor: 1.5,
        bearingType: align === "misalign" ? "spherical_roller" : "deep_groove",
        applicationProfile: align === "misalign" ? "heavy_shock" : "general_radial",
        arrangement: "single",
        maxBoreMm: boreMm,
        mountingSystem: "single",
        lubricantType: "grease",
        isoVgGrade: 100,
        operatingTempC: 50,
        contamination: "slight_contamination",
        sealFilter: "sealed",
        resetCatalogFilters: true,
      };
    }
    case "ballscrew": {
      const duplex = str(answers, "duplex", "back_to_back");
      const arrangement =
        duplex === "face_to_face"
          ? "face_to_face"
          : duplex === "tandem"
            ? "tandem"
            : "back_to_back";
      return {
        radialLoad: num(answers, "radialLoadN", 800),
        axialLoad: num(answers, "axialLoadN", 5000),
        speed: rpm,
        lifeHours,
        safetyFactor: 1.5,
        bearingType: "angular_contact",
        applicationProfile: "combined_loads",
        arrangement,
        maxBoreMm: boreMm,
        mountingSystem: "duplex_angular",
        lubricantType: "grease",
        isoVgGrade: 68,
        operatingTempC: 40,
        contamination: "high_clean",
        sealFilter: "open",
        resetCatalogFilters: true,
      };
    }
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

const ANSWER_QUERY_PREFIX = "a_";

export function answersToQueryParams(answers: AssistantAnswers): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(answers)) {
    if (value === "" || value == null) continue;
    params.set(`${ANSWER_QUERY_PREFIX}${key}`, String(value));
  }
  return params;
}

export function answersFromSearchParams(
  searchParams: URLSearchParams | { forEach?: (cb: (v: string, k: string) => void) => void }
): AssistantAnswers {
  const out: AssistantAnswers = {};
  if (typeof searchParams.forEach !== "function") return out;
  searchParams.forEach((value, key) => {
    if (!key.startsWith(ANSWER_QUERY_PREFIX)) return;
    const id = key.slice(ANSWER_QUERY_PREFIX.length);
    const n = Number.parseFloat(value);
    out[id] = Number.isFinite(n) && String(n) === value ? n : value;
  });
  return out;
}

/** Parse assistant answers from Next.js ReadonlyURLSearchParams (get-only). */
export function answersFromParamGetter(
  get: (key: string) => string | null,
  fieldIds: string[]
): AssistantAnswers {
  const out: AssistantAnswers = {};
  for (const id of fieldIds) {
    const value = get(`${ANSWER_QUERY_PREFIX}${id}`);
    if (value == null || value === "") continue;
    const n = Number.parseFloat(value);
    out[id] = Number.isFinite(n) && String(n) === value ? n : value;
  }
  return out;
}

export function assistantToDesignerHref(
  id: BearingAssistantId,
  answers?: AssistantAnswers
): string {
  const assistant = getBearingAssistant(id);
  if (!assistant) return "/products/bearings/designer";
  const merged = { ...defaultAssistantAnswers(assistant), ...(answers ?? {}) };
  const params = new URLSearchParams();
  params.set("intent", "design");
  params.set("mode", "design");
  params.set("panel", assistant.panel);
  params.set("assistant", id);
  const answerParams = answersToQueryParams(merged);
  answerParams.forEach((v, k) => params.set(k, v));
  return `/products/bearings/designer?${params.toString()}`;
}

export type BearingAssistantHubCard = {
  id: BearingAssistantId;
  label: string;
  outcome: string;
  blurb: string;
  /** Skip form — open Designer with defaults */
  href: string;
  /** Guided short form */
  formHref: string;
};

export function bearingAssistantHubCards(): BearingAssistantHubCard[] {
  return BEARING_APPLICATION_ASSISTANTS.map((a) => ({
    id: a.id,
    label: a.label,
    outcome: a.outcome,
    blurb: a.blurb,
    href: assistantToDesignerHref(a.id),
    formHref: `/products/bearings/assistant/${a.id}`,
  }));
}

/** Worked examples derived from assistants (replaces static BEARING_SUITE_EXAMPLES). */
export function bearingAssistantExamples(): Array<{
  id: BearingAssistantId;
  title: string;
  href: string;
  blurb: string;
}> {
  const titles: Record<BearingAssistantId, string> = {
    motor: "Electric motor L₁₀ life",
    pump: "Centrifugal pump DE/NDE",
    fan: "Fan / blower belt drive",
    gearbox: "Gearbox pinion shaft",
    conveyor: "Conveyor pulley selection",
    ballscrew: "Ballscrew duplex angular contact",
  };
  return BEARING_APPLICATION_ASSISTANTS.map((a) => ({
    id: a.id,
    title: titles[a.id],
    href: `/products/bearings/assistant/${a.id}`,
    blurb: a.blurb,
  }));
}

export const ASSISTANT_SESSION_KEY = "phycalcpro.bearingAssistantApply";

export function storeAssistantApply(payload: BearingAssistantApplyPayload): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(ASSISTANT_SESSION_KEY, JSON.stringify(payload));
}

export function consumeAssistantApply(): BearingAssistantApplyPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(ASSISTANT_SESSION_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(ASSISTANT_SESSION_KEY);
  try {
    return JSON.parse(raw) as BearingAssistantApplyPayload;
  } catch {
    return null;
  }
}
