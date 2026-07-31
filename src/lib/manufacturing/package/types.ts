/** PhyCalcPro drawing-package BOM + assembly tree types. */

export type BomNodeType = "toplevel" | "assembly" | "subassembly" | "component";

export type BomRow = {
  level: number;
  parentPartNumber: string | null;
  partNumber: string;
  revision: string;
  drawingFile: string;
  qty: number;
  description: string;
};

export type PackageValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type AssemblyNode = {
  partNumber: string;
  revision: string;
  drawingFile: string;
  qty: number;
  description: string;
  level: number;
  nodeType: BomNodeType;
  children: AssemblyNode[];
};

export type DrawingFileEntry = {
  /** Basename of PDF in the ZIP (or single upload name). */
  fileName: string;
  /** Relative path inside ZIP if nested. */
  path: string;
  bytes: Uint8Array;
};

export type DrawingPackage = {
  bomRows: BomRow[];
  tree: AssemblyNode[];
  drawings: DrawingFileEntry[];
  issues: PackageValidationIssue[];
  /** True when ZIP path and BOM.xlsx was present and parsed. */
  hasBom: boolean;
};
