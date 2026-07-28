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
  if (!src.includes("CalculatorLayout") || src.includes("moduleId=")) continue;
  const moduleId = moduleIdFromPath(file);
  src = src.replace(
    /<CalculatorLayout\r?\n\s+title=/,
    `<CalculatorLayout\n        moduleId="${moduleId}"\n        title=`
  );
  writeFileSync(file, src);
  console.log("moduleId", file, moduleId);
}
