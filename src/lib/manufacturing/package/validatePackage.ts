import type { AssemblyNode, BomNodeType, BomRow, DrawingFileEntry, PackageValidationIssue } from "./types";

function nodeTypeForLevel(level: number, hasChildren: boolean): BomNodeType {
  if (level <= 0) return "toplevel";
  if (hasChildren) return level === 1 ? "assembly" : "subassembly";
  return "component";
}

/** Build parent/child assembly tree from flat BOM rows. */
export function buildAssemblyTree(rows: BomRow[]): AssemblyNode[] {
  if (rows.length === 0) return [];

  const byPn = new Map<string, AssemblyNode>();
  for (const row of rows) {
    byPn.set(row.partNumber, {
      partNumber: row.partNumber,
      revision: row.revision,
      drawingFile: row.drawingFile,
      qty: row.qty,
      description: row.description,
      level: row.level,
      nodeType: "component",
      children: [],
    });
  }

  const roots: AssemblyNode[] = [];
  for (const row of rows) {
    const node = byPn.get(row.partNumber)!;
    const parentPn = row.parentPartNumber;
    if (parentPn && byPn.has(parentPn) && parentPn !== row.partNumber) {
      byPn.get(parentPn)!.children.push(node);
    } else if (row.level === 0 || !parentPn) {
      roots.push(node);
    } else {
      roots.push(node);
    }
  }

  const assignTypes = (node: AssemblyNode) => {
    node.nodeType = nodeTypeForLevel(node.level, node.children.length > 0);
    for (const child of node.children) assignTypes(child);
  };
  for (const r of roots) assignTypes(r);

  // Prefer single level-0 root; if multiple roots, return all
  return roots.length > 0 ? roots : [...byPn.values()].filter((n) => n.level === 0);
}

export function validateDrawingPackage(
  rows: BomRow[],
  drawings: DrawingFileEntry[]
): PackageValidationIssue[] {
  const issues: PackageValidationIssue[] = [];
  const pdfNames = new Set(drawings.map((d) => d.fileName.toLowerCase()));
  const bomDrawings = new Set(rows.map((r) => r.drawingFile.toLowerCase()).filter(Boolean));
  const seenPn = new Set<string>();

  for (const row of rows) {
    const key = row.partNumber.toLowerCase();
    if (seenPn.has(key)) {
      issues.push({
        severity: "error",
        code: "duplicate_part",
        message: `Duplicate part number: ${row.partNumber}`,
      });
    }
    seenPn.add(key);

    if (!row.drawingFile) {
      issues.push({
        severity: "error",
        code: "missing_drawing_ref",
        message: `Part ${row.partNumber} has no Drawing File in BOM.`,
      });
    } else if (!pdfNames.has(row.drawingFile.toLowerCase())) {
      issues.push({
        severity: "error",
        code: "drawing_missing_from_zip",
        message: `Drawing listed in BOM but missing from package: ${row.drawingFile} (${row.partNumber})`,
      });
    }

    if (row.parentPartNumber && !rows.some((r) => r.partNumber === row.parentPartNumber)) {
      issues.push({
        severity: "warning",
        code: "missing_parent",
        message: `Parent ${row.parentPartNumber} not found for ${row.partNumber}`,
      });
    }
  }

  for (const d of drawings) {
    if (!bomDrawings.has(d.fileName.toLowerCase())) {
      issues.push({
        severity: "warning",
        code: "orphan_pdf",
        message: `PDF in package not referenced in BOM: ${d.fileName}`,
      });
    }
  }

  if (rows.length === 0) {
    issues.push({
      severity: "error",
      code: "empty_bom",
      message: "BOM has no rows.",
    });
  }

  return issues;
}
