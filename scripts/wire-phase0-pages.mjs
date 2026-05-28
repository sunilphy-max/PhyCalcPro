import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const PRODUCTS = "src/app/products";

const ROUTE_TO_MODULE = {
  beams: "beams",
  frames: "frames",
  trusses: "trusses",
  columns: "columns",
  plates: "plates",
  "combined-loading": "combined-loading",
  "load-case-manager": "load-case-manager",
  shafts: "shafts",
  gears: "gears",
  bearings: "bearings",
  cams: "cams",
  flywheels: "flywheels",
  bolts: "bolts",
  welds: "welds",
  rivets: "rivets",
  "safety-factor": "safety-factor",
  database: "material-db",
  sections: "sections",
  composites: "composites",
  "temperature-properties": "temperature-properties",
  fatigue: "fatigue",
  corrosion: "corrosion",
  pipes: "pipes",
  vessels: "vessels",
  hydraulics: "hydraulics",
  "heat-exchangers": "heat-exchangers",
  vibrations: "vibrations",
  rotation: "rotation",
  impact: "impact",
  suspension: "suspension",
  tolerance: "tolerance",
  fits: "fits",
  "cost-estimator": "cost-estimator",
  "cam-toolpaths": "cam-toolpaths",
  profiles: "profiles",
};

function findPages(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) findPages(p, acc);
    else if (name === "page.tsx") acc.push(p);
  }
  return acc;
}

function moduleIdFromPath(filePath) {
  const parts = filePath.replace(/\\/g, "/").split("/");
  const idx = parts.indexOf("products");
  const slug = parts[idx + 2] ?? parts[idx + 1];
  return ROUTE_TO_MODULE[slug] ?? slug;
}

function wirePage(filePath) {
  let src = readFileSync(filePath, "utf8");
  const moduleId = moduleIdFromPath(filePath);
  if (!moduleId) return false;

  let changed = false;

  if (!src.includes("useStandardCalculation")) {
    if (!src.includes('"use client"')) return false;
    src = src.replace(
      /("use client";\n\n)/,
      `$1import { useStandardCalculation } from "@/hooks/useStandardCalculation";\n`
    );
    changed = true;
  }

  if (!src.includes("wrapResult")) {
    const hookInsert = `  const { wrapResult } = useStandardCalculation("${moduleId}");\n`;
    const match = src.match(/export default function \w+\(\) \{\n/);
    if (match) {
      src = src.replace(match[0], match[0] + hookInsert);
      changed = true;
    }
  }

  src = src.replace(
    /setResult\((attachGearCalculationSpec|attachBeamCalculationSpec)\([^)]+\)\)/g,
    (m) => {
      changed = true;
      const inner = m.match(/\((.+)\)/)?.[1] ?? "";
      return `setResult(wrapResult(${inner.split(",")[0]?.trim() ?? "raw"}))`;
    }
  );

  src = src.replace(/setResult\((\w+)\);/g, (full, arg) => {
    if (arg === "wrapResult" || full.includes("wrapResult")) return full;
    changed = true;
    return `setResult(wrapResult(${arg}));`;
  });

  src = src.replace(/setResult\(\s*\n\s*attachBeamCalculationSpec/g, "setResult(wrapResult(");
  src = src.replace(/attachBeamCalculationSpec\(([^)]+)\)\s*\)/g, "$1)");

  if (!src.includes(`moduleId="${moduleId}"`)) {
    src = src.replace(
      /<CalculatorLayout\n(\s+)title=/,
      `<CalculatorLayout\n$1moduleId="${moduleId}"\n$1title=`
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(filePath, src);
    console.log("wired", filePath, moduleId);
  }
  return changed;
}

for (const page of findPages(PRODUCTS)) {
  try {
    wirePage(page);
  } catch (e) {
    console.error("fail", page, e.message);
  }
}
