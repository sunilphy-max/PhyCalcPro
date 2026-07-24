import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { categories, allModules } from "@/data/modules";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import { getModuleMaturity } from "@/data/moduleMaturity";
import { normalizeDocumentationMath } from "@/lib/documentation/normalizeMath";
import {
  extractFaqItems,
  extractTocHeadings,
  parseFrontmatter,
  stripLeadingModuleHeading,
  type FaqItem,
  type ModuleDocFrontmatter,
  type TocHeading,
} from "@/lib/documentation/parseFrontmatter";

const REFERENCE_PATH = path.join(process.cwd(), "docs", "Modules-Technical-Reference.md");
const MODULES_DIR = path.join(process.cwd(), "docs", "modules");

export type ModuleDocSection = {
  moduleId: string;
  title: string;
  markdown: string;
  frontmatter: ModuleDocFrontmatter;
  toc: TocHeading[];
  faq: FaqItem[];
};

export type DocSection = {
  id: string;
  title: string;
  markdown: string;
  level: 2;
};

const MODULE_HEADING_RE = /^### .+? \(`([^`]+)`\)/m;

/** Category groupings for the compiled full reference (matches product sidebar). */
const MODULE_REFERENCE_SECTIONS: { heading: string; moduleIds: string[] }[] = [
  {
    heading: "Structural engineering",
    moduleIds: [
      "beams",
      "frames",
      "trusses",
      "columns",
      "plates",
      "combined-loading",
      "circular-plates",
      "shells",
    ],
  },
  {
    heading: "Power transmission",
    moduleIds: ["v-belts", "timing-belts", "roller-chains", "multi-pulley"],
  },
  {
    heading: "Machine design",
    moduleIds: [
      "shafts",
      "gears",
      "internal-gears-rack",
      "bevel-gears",
      "worm-gears",
      "planetary-gears",
      "gear-ratio-design",
      "power-screws",
      "cams",
      "flywheels",
      "brakes-clutches",
    ],
  },
  {
    heading: "Bearings",
    moduleIds: ["bearings", "plain-bearings", "housing"],
  },
  {
    heading: "Springs",
    moduleIds: ["compression-springs", "extension-springs", "torsion-springs"],
  },
  {
    heading: "Fasteners & connections",
    moduleIds: ["bolts", "welds", "rivets", "keys-splines", "shaft-hubs", "pins"],
  },
  {
    heading: "Materials & sections",
    moduleIds: [
      "material-db",
      "sections",
      "rolled-sections",
      "profiles",
      "composites",
      "temperature-properties",
      "fatigue",
      "corrosion",
    ],
  },
  {
    heading: "Pressure systems",
    moduleIds: ["pipes", "vessels", "hydraulics", "heat-exchangers"],
  },
  {
    heading: "Dynamics & vibrations",
    moduleIds: ["vibrations", "rotation", "motor", "impact", "suspension"],
  },
  {
    heading: "Manufacturing",
    moduleIds: ["tolerance", "fits", "cost-estimator", "cam-toolpaths"],
  },
  {
    heading: "Advanced systems",
    moduleIds: [
      "vacuum-engineering",
      "cryogenic-engineering",
      "magnetic-fields",
      "superconducting-systems",
      "thermal-management",
      "battery-ev-systems",
      "hydrogen-systems",
      "precision-motion",
    ],
  },
  {
    heading: "Tools",
    moduleIds: ["unit-converter"],
  },
];

function buildSectionFromBody(body: string): ModuleDocSection | null {
  const idMatch = body.match(MODULE_HEADING_RE);
  if (!idMatch) return null;
  const moduleId = idMatch[1];
  const titleLine =
    body
      .split("\n")
      .find((line) => line.startsWith("### "))
      ?.replace(/^### /, "") ?? moduleId;
  return {
    moduleId,
    title: titleLine.replace(/\s*—\s*\*\*[^*]+\*\*\s*$/, "").trim(),
    markdown: body.trim(),
    frontmatter: {},
    toc: extractTocHeadings(body),
    faq: extractFaqItems(body),
  };
}

function readModuleFile(filePath: string): ModuleDocSection | null {
  const raw = readFileSync(filePath, "utf8").trim();
  const { data, body } = parseFrontmatter(raw);
  const section = buildSectionFromBody(body);
  if (!section) return null;
  return {
    ...section,
    frontmatter: data,
    toc: extractTocHeadings(body),
    faq: extractFaqItems(body),
  };
}

/** Platform markdown: sections 1–2 plus maturity/roadmap (legacy inline module sections stripped). */
function loadPlatformParts(): { intro: string; maturity: string } {
  const raw = readFileSync(REFERENCE_PATH, "utf8");
  const moduleSectionStart = raw.search(/\n## 3\. /);
  const maturityStart = raw.search(/\n## 12\. Maturity/);
  const intro =
    moduleSectionStart >= 0 ? raw.slice(0, moduleSectionStart).trimEnd() : raw.trimEnd();
  const maturity = maturityStart >= 0 ? raw.slice(maturityStart).trim() : "";
  return { intro, maturity };
}

function normalizeReferenceMarkdown(markdown: string): string {
  return normalizeDocumentationMath(
    markdown
      .replace(/^# PhyCalcPro — Modules Technical Reference\n\n/m, "# ")
      .replace(/\[([^\]]+)\]\(\.\/[^)]+\.md\)/g, "$1")
  );
}

/** Split per-module sections from legacy monolith (### … (`moduleId`)). */
export function parseModuleSections(markdown: string): Map<string, ModuleDocSection> {
  const chunks = markdown.split(/\n(?=### )/);
  const map = new Map<string, ModuleDocSection>();

  for (const chunk of chunks) {
    const section = buildSectionFromBody(chunk.trim());
    if (!section) continue;
    const existing = map.get(section.moduleId);
    if (!existing || section.markdown.length > existing.markdown.length) {
      map.set(section.moduleId, section);
    }
  }

  return map;
}

function loadModuleFilesFromDisk(): Map<string, ModuleDocSection> {
  const map = new Map<string, ModuleDocSection>();
  if (!existsSync(MODULES_DIR)) return map;

  const skip = new Set(["bearings-suite-audit.md", "spring-modules-user-tasks.md"]);
  for (const file of readdirSync(MODULES_DIR).filter((f) => f.endsWith(".md"))) {
    if (skip.has(file)) continue;
    const section = readModuleFile(path.join(MODULES_DIR, file));
    if (section) map.set(section.moduleId, section);
  }
  return map;
}

export const getModuleDocSections = cache((): Map<string, ModuleDocSection> => {
  const map = loadModuleFilesFromDisk();

  // Legacy fallback: inline sections in monolith (longest wins)
  if (map.size === 0) {
    return parseModuleSections(readFileSync(REFERENCE_PATH, "utf8"));
  }

  return map;
});

export function getModuleDoc(moduleId: string): ModuleDocSection | undefined {
  return getModuleDocSections().get(moduleId);
}

/** Raw module markdown prepared for KaTeX (delimiter conversion, equation promotion). */
export function getModuleDocForDisplay(moduleId: string): ModuleDocSection | undefined {
  const doc = getModuleDoc(moduleId);
  if (!doc) return undefined;
  const withoutHeading = stripLeadingModuleHeading(doc.markdown);
  return {
    ...doc,
    markdown: normalizeDocumentationMath(withoutHeading),
  };
}

function compileModuleReference(markdownById: Map<string, ModuleDocSection>): string {
  const parts: string[] = [
    "## 3. Module reference",
    "",
    "Per-module engineering knowledge guides live in `docs/modules/{moduleId}.md`. Each page covers selection/analysis workflow, worked examples, FAQ, plus **purpose**, **physics & theory**, **governing equations**, **numerical method**, **inputs**, **outputs**, **design codes & checks**, **assumptions & limitations**, and **references**. Browse individually at `/documentation/modules/{moduleId}`.",
    "",
  ];

  for (const { heading, moduleIds } of MODULE_REFERENCE_SECTIONS) {
    const blocks = moduleIds
      .map((id) => markdownById.get(id)?.markdown)
      .filter((block): block is string => Boolean(block));
    if (!blocks.length) continue;
    parts.push(`## ${heading}`, "", blocks.join("\n\n---\n\n"), "");
  }

  return parts.join("\n");
}

/** Read platform + all module docs for web rendering. */
export const loadTechnicalReference = cache((): string => {
  const { intro, maturity } = loadPlatformParts();
  const moduleMap = getModuleDocSections();
  const compiled = moduleMap.size > 0 ? compileModuleReference(moduleMap) : "";
  const combined = [intro, compiled, maturity].filter(Boolean).join("\n\n");
  return normalizeReferenceMarkdown(combined);
});

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
  if (moduleId === "profiles") return "/products/materials/profiles";
  return allModules.find((m) => m.id === moduleId)?.route;
}

export function getRelatedModules(moduleId: string) {
  const mod = allModules.find((m) => m.id === moduleId);
  if (!mod) return [];
  const category = categories.find((c) => c.id === mod.category);
  if (!category) return [];
  return category.modules.filter((m) => m.id !== moduleId && !m.comingSoon).slice(0, 6);
}

export function getModuleCatalogExtras(moduleId: string) {
  const profile = getModuleStandardProfile(moduleId);
  const maturity = getModuleMaturity(moduleId);
  return { profile, maturity };
}

export { categories, allModules };
