/**
 * Replace noop applyDesignFields with useApplyDesignFields + module-specific setters.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const productsRoot = path.join(import.meta.dirname, "..", "src", "app", "products");

/** moduleId -> { fieldKey: setterName } */
const MAP = {
  "timing-belts": {
    pitch: "setPitch",
    teethDriver: "setTeethDriver",
    teethDriven: "setTeethDriven",
  },
  "roller-chains": {
    chainPitch: "setPitch",
  },
  "multi-pulley": {
    driverDiameter: "setDriverDiameter",
    drivenDiameter: "setDrivenDiameter",
  },
  "extension-springs": {
    wireDiameter: "setWireDiameter",
    meanDiameter: "setMeanDiameter",
    activeCoils: "setActiveCoils",
  },
  "torsion-springs": {
    legLength: "setLegLength",
  },
  "bevel-gears": {
    module: "setModule",
    faceWidth: "setFaceWidth",
  },
  "worm-gears": {
    module: "setModule",
    wheelTeeth: "setWheelTeeth",
  },
  "planetary-gears": {
    sunTeeth: "setSunTeeth",
    planetTeeth: "setPlanetTeeth",
    ringTeeth: "setRingTeeth",
  },
  "plain-bearings": {
    journalDiameter: "setDiameter",
  },
  "brakes-clutches": {
    discDiameter: "setDiscDiameter",
  },
  "gear-ratio-design": {
    pinionTeeth: "setPinionTeeth",
    gearTeeth: "setGearTeeth",
  },
  welds: { weldSize: "setWeldSize" },
  rivets: { rivetDiameter: "setDiameter" },
  pins: { pinDiameter: "setDiameter" },
  "keys-splines": { keyWidth: "setKeyWidth", keyHeight: "setKeyHeight" },
  "shaft-hubs": { interference: "setInterference" },
  "safety-factor": { diameter: "setDiameter" },
  hydraulics: { bore: "setBore" },
  "heat-exchangers": { hxType: "setHxType" },
  fatigue: { alternatingStress: "setAlternatingStress" },
  corrosion: { corrosionRate: "setCorrosionRate" },
  composites: { plyCount: "setPlyCount" },
  "temperature-properties": { material: "setMaterial" },
  "rolled-sections": { sectionDesignation: "setDesignation" },
  sections: { width: "setWidth", height: "setHeight" },
  fits: { fitClass: "setFitClass" },
  tolerance: { minGap: "setMinGap" },
  impact: { area: "setArea" },
  rotation: { radius: "setRadius" },
  suspension: { rollStiffness: "setRollStiffness" },
  cams: { baseRadius: "setBaseRadius" },
  flywheels: { outerDiameter: "setOuterDiameter" },
  "circular-plates": { thickness: "setThickness" },
  "combined-loading": { width: "setWidth", height: "setHeight" },
  "load-case-manager": { width: "setWidth", height: "setHeight" },
  "cost-estimator": { machiningTime: "setMachiningTime" },
  "cam-toolpaths": { feedRate: "setFeedRate" },
  "formula-reference": {},
  "unit-converter": {},
  "material-db": { material: "setMaterial" },
};

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name === "page.tsx") files.push(full);
  }
  return files;
}

function moduleIdFromPath(file) {
  const rel = path.relative(productsRoot, file).replace(/\\/g, "/");
  const parts = rel.split("/");
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}

function buildSettersBlock(map) {
  const entries = Object.entries(map);
  if (entries.length === 0) return null;
  const lines = entries.map(
    ([field, setter]) =>
      `    ${field}: (v) => ${setter}(typeof v === "number" ? v : Number(v)),`
  );
  return `  const applyDesignFields = useApplyDesignFields({\n${lines.join("\n")}\n  });`;
}

let changed = 0;
for (const file of walk(productsRoot)) {
  let content = readFileSync(file, "utf8");
  if (!content.includes("(_fields: Record<string, unknown>) => {}, []);")) continue;

  const moduleId = moduleIdFromPath(file);
  const map = MAP[moduleId];
  if (!map) continue;

  const settersBlock = buildSettersBlock(map);
  if (!settersBlock) continue;

  if (!content.includes("useApplyDesignFields")) {
    content = content.replace(
      /import \{ useRegisterApplyDesignCandidate \} from "@\/hooks\/useRegisterApplyDesignCandidate";/,
      `import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";\nimport { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";`
    );
  }

  content = content.replace(
    /  const applyDesignFields = useCallback\(\(_fields: Record<string, unknown>\) => \{\}, \[\]\);\n\n  useRegisterApplyDesignCandidate\(applyDesignFields\);/,
    `${settersBlock}\n\n  useRegisterApplyDesignCandidate(applyDesignFields);`
  );

  writeFileSync(file, content, "utf8");
  changed++;
  console.log("wired:", moduleId);
}
console.log(`Wired ${changed} pages.`);
