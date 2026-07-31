import type { ContributorBreakdown, DrawingExtract, GdtStackConfig } from "@/lib/manufacturing/gdt/types";
import type { BomRow, AssemblyNode, ManualStackPick, PackageValidationIssue } from "@/lib/manufacturing/package";
import type { ToleranceResult } from "@/lib/manufacturing/types";

export type ToleranceInputMode = "simple" | "gdt" | "package";

/**
 * Serializable tolerance stack-up study.
 * PDF binaries are not stored (quota / privacy) — extracts + BOM structure + chain are.
 */
export type ToleranceProjectData = {
  version: 1;
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
  manualPicks: ManualStackPick[];
  chainConfirmed: boolean;
  /** Last computed snapshot (optional; can re-solve on load) */
  resultSnapshot?: ToleranceResult | null;
  gdtBreakdown?: ContributorBreakdown[];
};
