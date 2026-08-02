import type { ContributorBreakdown, DrawingExtract, GdtStackConfig } from "@/lib/manufacturing/gdt/types";
import type {
  BomRow,
  AssemblyNode,
  ManualStackPick,
  NamedStack,
  PackageValidationIssue,
} from "@/lib/manufacturing/package";
import type { ToleranceResult } from "@/lib/manufacturing/types";

export type ToleranceInputMode = "simple" | "gdt" | "package";

/**
 * Serializable tolerance stack-up study.
 * PDF binaries are not stored (quota / privacy) — extracts + BOM structure + chains are.
 */
export type ToleranceProjectData = {
  version: 1 | 2;
  inputMode: ToleranceInputMode;
  toleranceUnit: string;
  monteCarloSamples: number;
  /** Simple bilateral mode */
  tolerances: number[];
  tolerancesY: number[];
  tolerancesZ: number[];
  /** Single-drawing GD&T assist */
  extract: DrawingExtract | null;
  gdtConfig: GdtStackConfig | null;
  /** Package / BOM mode */
  bomRows: BomRow[];
  tree: AssemblyNode[];
  hasBom: boolean;
  packageIssues: PackageValidationIssue[];
  extractsByPart: Record<string, DrawingExtract>;
  selectedPn: string | null;
  selectedDrawing: string | null;
  /** Click-selected BOM branch roots (drawing hierarchy). */
  selectedBranches?: string[];
  /** @deprecated v1 single chain — migrated into stacks[0] on load when stacks empty */
  manualPicks: ManualStackPick[];
  chainConfirmed: boolean;
  /** v2: multi-stack program */
  stacks?: NamedStack[];
  activeStackId?: string | null;
  /** Last computed snapshot (optional; can re-solve on load) */
  resultSnapshot?: ToleranceResult | null;
  gdtBreakdown?: ContributorBreakdown[];
};

/** Migrate v1 single-chain studies into a stacks array. */
export function normalizeToleranceProject(data: ToleranceProjectData): ToleranceProjectData {
  if (data.stacks && data.stacks.length > 0) {
    return { ...data, version: 2 };
  }
  if (data.manualPicks?.length && data.selectedPn) {
    const stack: NamedStack = {
      id: "migrated-primary",
      name: "Primary stack",
      level: "assembly",
      contextPartNumber: data.selectedPn,
      method: "WC",
      picks: data.manualPicks,
      chainConfirmed: data.chainConfirmed,
      status: data.chainConfirmed ? "confirmed" : "draft",
      resultSnapshot: null,
    };
    return {
      ...data,
      version: 2,
      stacks: [stack],
      activeStackId: stack.id,
    };
  }
  return { ...data, version: 2, stacks: data.stacks ?? [], activeStackId: data.activeStackId ?? null };
}
