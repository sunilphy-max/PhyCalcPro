import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROUTE_TO_MODULE = {
  beams: "beams", frames: "frames", trusses: "trusses", columns: "columns", plates: "plates",
  "combined-loading": "combined-loading", "load-case-manager": "load-case-manager",
  shafts: "shafts", gears: "gears", bearings: "bearings", cams: "cams", flywheels: "flywheels",
  bolts: "bolts", welds: "welds", rivets: "rivets", "safety-factor": "safety-factor",
  database: "material-db", sections: "sections", composites: "composites",
  "temperature-properties": "temperature-properties", fatigue: "fatigue", corrosion: "corrosion",
  pipes: "pipes", vessels: "vessels", hydraulics: "hydraulics", "heat-exchangers": "heat-exchangers",
  vibrations: "vibrations", rotation: "rotation", impact: "impact", suspension: "suspension",
  tolerance: "tolerance", fits: "fits", "cost-estimator": "cost-estimator",
  "cam-toolpaths": "cam-toolpaths", profiles: "profiles",
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
  if (parts[idx + 1] === "profiles") return "profiles";
  return ROUTE_TO_MODULE[parts[idx + 2]] ?? parts[idx + 2];
}

for (const file of findPages("src/app/products")) {
  if (file.includes("products/page.tsx")) continue;
  let src = readFileSync(file, "utf8");
  const moduleId = moduleIdFromPath(file);
  if (!moduleId || moduleId === "page.tsx") continue;
  let changed = false;

  if (!src.includes("useStandardCalculation")) {
    src = src.replace(/("use client";\n\n)/, `$1import { useStandardCalculation } from "@/hooks/useStandardCalculation";\n`);
    const m = src.match(/export default function \w+\(\) \{\n/);
    if (m) {
      src = src.replace(m[0], `${m[0]}  const { wrapResult } = useStandardCalculation("${moduleId}");\n`);
      changed = true;
    }
  }

  if (!src.includes(`moduleId="${moduleId}"`) && src.includes("CalculatorLayout")) {
    src = src.replace(/<CalculatorLayout\n(\s+)title=/, `<CalculatorLayout\n$1moduleId="${moduleId}"\n$1title=`);
    changed = true;
  }

  const newSrc = src.replace(/setResult\((?!wrapResult)/g, "setResult(wrapResult(");
  if (newSrc !== src) {
    src = newSrc.replace(/setResult\(wrapResult\(([\s\S]*?)\);/g, (match, inner) => {
      let depth = 0;
      let end = -1;
      for (let i = 0; i < inner.length; i++) {
        if (inner[i] === "(") depth++;
        if (inner[i] === ")") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end === -1) return match;
      const expr = inner.slice(0, end + 1);
      const rest = inner.slice(end + 1);
      return `setResult(wrapResult(${expr}));${rest}`;
    });
    changed = true;
  }

  if (changed) {
    writeFileSync(file, src);
    console.log("fixed", file, moduleId);
  }
}
