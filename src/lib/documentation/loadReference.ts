import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { categories, allModules } from "@/data/modules";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import { getModuleMaturity } from "@/data/moduleMaturity";
import { normalizeDocumentationMath } from "@/lib/documentation/normalizeMath";

const REFERENCE_PATH = path.join(process.cwd(), "docs", "Modules-Technical-Reference.md");

export type ModuleDocSection = {
  moduleId: string;
  title: string;
  markdown: string;
};

export type DocSection = {
  id: string;
  title: string;
  markdown: string;
  level: 2;
};

/** Read and lightly normalize the technical reference for web rendering. */
export const loadTechnicalReference = cache((): string => {
  const raw = readFileSync(REFERENCE_PATH, "utf8");
  const linked = raw
    .replace(/^# PhyCalcPro — Modules Technical Reference\n\n/m, "# ")
    .replace(/\[([^\]]+)\]\(\.\/[^)]+\.md\)/g, "$1");
  return normalizeDocumentationMath(linked);
});

const MODULE_HEADING_RE = /^### .+? \(`([^`]+)`\)/;

/** Split per-module sections (### … (`moduleId`)). */
export function parseModuleSections(markdown: string): Map<string, ModuleDocSection> {
  const chunks = markdown.split(/\n(?=### )/);
  const map = new Map<string, ModuleDocSection>();

  for (const chunk of chunks) {
    const idMatch = chunk.match(MODULE_HEADING_RE);
    if (!idMatch) continue;
    const moduleId = idMatch[1];
    const titleLine = chunk.split("\n")[0]?.replace(/^### /, "") ?? moduleId;
    map.set(moduleId, {
      moduleId,
      title: titleLine.replace(/\s*—\s*\*\*[^*]+\*\*\s*$/, "").trim(),
      markdown: chunk.trim(),
    });
  }

  return map;
}

export const getModuleDocSections = cache((): Map<string, ModuleDocSection> => {
  return parseModuleSections(loadTechnicalReference());
});

export function getModuleDoc(moduleId: string): ModuleDocSection | undefined {
  return getModuleDocSections().get(moduleId);
}

/** Major ## sections for in-page navigation (reference view). */
export function parseMajorSections(markdown: string): DocSection[] {
  const chunks = markdown.split(/\n(?=## )/);
  const sections: DocSection[] = [];

  for (const chunk of chunks) {
    const firstLine = chunk.split("\n")[0];
    if (!firstLine?.startsWith("## ")) continue;
    const title = firstLine.replace(/^## /, "").trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    sections.push({
      id,
      title,
      markdown: chunk.trim(),
      level: 2,
    });
  }

  return sections;
}

export function getAllModuleIdsForDocs(): string[] {
  const fromMd = Array.from(getModuleDocSections().keys());
  const fromApp = allModules.map((m) => m.id);
  return Array.from(new Set([...fromApp, ...fromMd, "profiles"]));
}

export function getModuleRoute(moduleId: string): string | undefined {
  if (moduleId === "profiles") return "/products/profiles";
  return allModules.find((m) => m.id === moduleId)?.route;
}

export function getModuleCatalogExtras(moduleId: string) {
  const profile = getModuleStandardProfile(moduleId);
  const maturity = getModuleMaturity(moduleId);
  return { profile, maturity };
}

export { categories, allModules };
