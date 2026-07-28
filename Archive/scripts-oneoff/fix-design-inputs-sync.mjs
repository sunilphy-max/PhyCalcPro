#!/usr/bin/env node
/**
 * Replaces empty designUserInputs ({}) with live state sync via useSyncDesignInputs.
 * Run: node scripts/fix-design-inputs-sync.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const productsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "products");

/** userInputs field lines + dependency array variable names */
const MODULE_SYNC = {
  "keys-splines": {
    lines: [
      "torque: toBase(torque, \"torque\", torqueUnit),",
      "shaftDiameter: toBase(shaftDiameter, \"length\", lengthUnit),",
      "yieldStress: toBase(yieldStress, \"stress\", stressUnit),",
    ],
    deps: ["torque", "torqueUnit", "shaftDiameter", "lengthUnit", "yieldStress", "stressUnit"],
  },
  bearings: {
    lines: [
      "maxForce: toBase(radialLoad, \"force\", radialUnit),",
      "axialLoad: toBase(axialLoad, \"force\", axialUnit),",
      "speedDriver: speed,",
      "requiredLife: lifeHours,",
      "targetSafetyFactor: safetyFactor,",
    ],
    deps: ["radialLoad", "radialUnit", "axialLoad", "axialUnit", "speed", "lifeHours", "safetyFactor"],
  },
  pipes: {
    lines: [
      "pressure: toBase(pressure, \"pressure\", pressureUnit),",
      "length: toBase(radius, \"length\", radiusUnit),",
      "E: toBase(E, \"stress\", EUnit),",
      "thickness: toBase(thickness, \"length\", thicknessUnit),",
    ],
    deps: ["pressure", "pressureUnit", "radius", "radiusUnit", "E", "EUnit", "thickness", "thicknessUnit"],
  },
  vessels: {
    lines: [
      "pressure: toBase(pressure, \"pressure\", pressureUnit),",
      "length: toBase(radius, \"length\", radiusUnit),",
      "E: toBase(E, \"stress\", EUnit),",
      "thickness: toBase(thickness, \"length\", thicknessUnit),",
    ],
    deps: ["pressure", "pressureUnit", "radius", "radiusUnit", "E", "EUnit", "thickness", "thicknessUnit"],
  },
  "timing-belts": {
    lines: [
      "power: powerUnit === \"kW\" ? power * 1000 : powerUnit === \"hp\" ? power * 745.7 : power,",
      "speedDriver,",
      "ratio: teethDriven / Math.max(teethDriver, 1),",
      "serviceFactor,",
    ],
    deps: ["power", "powerUnit", "speedDriver", "teethDriver", "teethDriven", "serviceFactor"],
  },
  shafts: {
    lines: [
      "torque: loads[0]?.torque != null ? toBase(loads[0].torque, \"torque\", torqueUnit) : undefined,",
      "bendingMoment: loads[0]?.bendingMoment != null ? toBase(loads[0].bendingMoment, \"moment\", momentUnit) : undefined,",
      "length: toBase(length, \"length\", lengthUnit),",
      "targetSafetyFactor: 2,",
    ],
    deps: ["loads", "torqueUnit", "momentUnit", "length", "lengthUnit"],
  },
  gears: null, // already synced manually
  frames: null,
  bolts: {
    lines: [
      "maxForce: toBase(shearForce, \"force\", forceUnit),",
      "axialLoad: toBase(axialLoad, \"force\", forceUnit),",
      "allowableStressPa: toBase(yieldStress, \"stress\", stressUnit),",
    ],
    deps: ["shearForce", "forceUnit", "axialLoad", "yieldStress", "stressUnit"],
  },
  welds: {
    lines: [
      "shearForce: toBase(shearForce, \"force\", forceUnit),",
      "axialLoad: toBase(axialForce, \"force\", forceUnit),",
      "length: toBase(weldLength, \"length\", lengthUnit),",
      "weldCount,",
      "eccentricity: toBase(eccentricity, \"length\", lengthUnit),",
    ],
    deps: ["shearForce", "forceUnit", "axialForce", "weldLength", "lengthUnit", "weldCount", "eccentricity"],
  },
  rivets: {
    lines: [
      "maxForce: toBase(shearForce, \"force\", forceUnit),",
      "count: rivetCount,",
    ],
    deps: ["shearForce", "forceUnit", "rivetCount"],
  },
  pins: {
    lines: [
      "shearForce: toBase(shearForce, \"force\", forceUnit),",
      "shaftDiameter: toBase(pinDiameter, \"length\", lengthUnit),",
    ],
    deps: ["shearForce", "forceUnit", "pinDiameter", "lengthUnit"],
  },
  "shaft-hubs": {
    lines: [
      "torque: toBase(torque, \"torque\", torqueUnit),",
      "shaftDiameter: toBase(shaftDiameter, \"length\", lengthUnit),",
    ],
    deps: ["torque", "torqueUnit", "shaftDiameter", "lengthUnit"],
  },
  "safety-factor": {
    lines: [
      "appliedStress: toBase(appliedStress, \"stress\", stressUnit),",
      "yieldStress: toBase(yieldStress, \"stress\", stressUnit),",
      "loadFactor,",
    ],
    deps: ["appliedStress", "stressUnit", "yieldStress", "loadFactor"],
  },
  plates: {
    lines: [
      "length: toBase(length, \"length\", lengthUnit),",
      "width: toBase(width, \"length\", lengthUnit),",
      "pressure: toBase(q, \"pressure\", pressureUnit),",
      "E: toBase(E, \"stress\", EUnit),",
      "thickness: toBase(thickness, \"length\", thicknessUnit),",
    ],
    deps: ["length", "lengthUnit", "width", "q", "pressureUnit", "E", "EUnit", "thickness", "thicknessUnit"],
  },
  "circular-plates": {
    lines: [
      "length: toBase(radius, \"length\", radiusUnit),",
      "pressure: toBase(pressure, \"pressure\", pressureUnit),",
      "E: toBase(E, \"stress\", EUnit),",
      "thickness: toBase(thickness, \"length\", thicknessUnit),",
    ],
    deps: ["radius", "radiusUnit", "pressure", "pressureUnit", "E", "EUnit", "thickness", "thicknessUnit"],
  },
  trusses: {
    lines: [
      "length: toBase(span, \"length\", lengthUnit),",
      "height: toBase(height, \"length\", lengthUnit),",
      "maxForce: toBase(load, \"force\", loadUnit),",
      "E: toBase(E, \"stress\", EUnit),",
      "area,",
    ],
    deps: ["span", "lengthUnit", "height", "load", "loadUnit", "E", "EUnit", "area"],
  },
  "combined-loading": {
    lines: [
      "axialLoad: toBase(axialForce, \"force\", forceUnit),",
      "bendingMoment: toBase(bendingMoment, \"moment\", momentUnit),",
      "torque: toBase(torque, \"torque\", torqueUnit),",
      "shearForce: toBase(shearForce, \"force\", forceUnit),",
      "allowableStressPa: toBase(yieldStrength, \"stress\", stressUnit),",
    ],
    deps: ["axialForce", "forceUnit", "bendingMoment", "momentUnit", "torque", "torqueUnit", "shearForce", "yieldStrength", "stressUnit"],
  },
  "load-case-manager": {
    lines: [
      "axialLoad: toBase(axialForce, \"force\", forceUnit),",
      "bendingMoment: toBase(bendingMoment, \"moment\", momentUnit),",
      "torque: toBase(torque, \"torque\", torqueUnit),",
      "targetSafetyFactor,",
    ],
    deps: ["axialForce", "forceUnit", "bendingMoment", "momentUnit", "torque", "torqueUnit", "targetSafetyFactor"],
  },
  vibrations: {
    lines: [
      "length: toBase(length, \"length\", lengthUnit),",
      "E: toBase(E, \"stress\", EUnit),",
      "inertia: toBase(I, \"inertia\", inertiaUnit),",
      "excitationHz: excitationFrequency,",
      "dampingRatio,",
    ],
    deps: ["length", "lengthUnit", "E", "EUnit", "I", "inertiaUnit", "excitationFrequency", "dampingRatio"],
  },
  "extension-springs": {
    lines: [
      "wireDiameter: toBase(wireDiameter, \"length\", lengthUnit),",
      "meanDiameter: toBase(meanDiameter, \"length\", lengthUnit),",
      "activeCoils,",
      "modulus: toBase(modulus, \"stress\", stressUnit),",
      "maxForce: toBase(maxForce, \"force\", forceUnit),",
    ],
    deps: ["wireDiameter", "meanDiameter", "lengthUnit", "activeCoils", "modulus", "stressUnit", "maxForce", "forceUnit"],
  },
  "torsion-springs": {
    lines: [
      "wireDiameter: toBase(wireDiameter, \"length\", lengthUnit),",
      "meanDiameter: toBase(meanDiameter, \"length\", lengthUnit),",
      "activeCoils,",
      "modulus: toBase(modulus, \"stress\", stressUnit),",
      "maxForce: toBase(maxTorque, \"torque\", torqueUnit),",
    ],
    deps: ["wireDiameter", "meanDiameter", "lengthUnit", "activeCoils", "modulus", "stressUnit", "maxTorque", "torqueUnit"],
  },
  flywheels: {
    lines: [
      "energy: toBase(energy, \"energy\", energyUnit),",
      "speedDriver: rpm,",
    ],
    deps: ["energy", "energyUnit", "rpm"],
  },
  "bevel-gears": {
    lines: [
      "power: powerUnit === \"kW\" ? power * 1000 : power,",
      "speedDriver: rpm,",
      "ratio: gearRatio,",
      "pinionTeeth,",
    ],
    deps: ["power", "powerUnit", "rpm", "gearRatio", "pinionTeeth"],
  },
  "worm-gears": {
    lines: [
      "power: powerUnit === \"kW\" ? power * 1000 : power,",
      "speedDriver: rpm,",
      "ratio: gearRatio,",
    ],
    deps: ["power", "powerUnit", "rpm", "gearRatio"],
  },
  "planetary-gears": {
    lines: [
      "power: powerUnit === \"kW\" ? power * 1000 : power,",
      "speedDriver: rpm,",
      "ratio: gearRatio,",
    ],
    deps: ["power", "powerUnit", "rpm", "gearRatio"],
  },
  "gear-ratio-design": {
    lines: [
      "ratio: targetRatio,",
      "pinionTeeth: inputTeeth,",
    ],
    deps: ["targetRatio", "inputTeeth"],
  },
  "plain-bearings": {
    lines: [
      "maxForce: toBase(radialLoad, \"force\", loadUnit),",
      "speedDriver: speed,",
      "length: toBase(diameter, \"length\", lengthUnit),",
    ],
    deps: ["radialLoad", "loadUnit", "speed", "diameter", "lengthUnit"],
  },
  "brakes-clutches": {
    lines: [
      "torque: toBase(torque, \"torque\", torqueUnit),",
      "speedDriver: rpm,",
    ],
    deps: ["torque", "torqueUnit", "rpm"],
  },
  cams: {
    lines: [
      "lift: toBase(lift, \"length\", lengthUnit),",
      "baseRadius: toBase(baseRadius, \"length\", lengthUnit),",
      "speedDriver: rpm,",
    ],
    deps: ["lift", "baseRadius", "lengthUnit", "rpm"],
  },
  "roller-chains": {
    lines: [
      "power: powerUnit === \"kW\" ? power * 1000 : power,",
      "speedDriver,",
      "ratio,",
      "serviceFactor,",
    ],
    deps: ["power", "powerUnit", "speedDriver", "ratio", "serviceFactor"],
  },
  "multi-pulley": {
    lines: [
      "power: powerUnit === \"kW\" ? power * 1000 : power,",
      "speedDriver: speed,",
    ],
    deps: ["power", "powerUnit", "speed"],
  },
  hydraulics: {
    lines: [
      "pressure: toBase(pressure, \"pressure\", pressureUnit),",
      "maxForce: toBase(flowRate, \"flow\", flowUnit),",
    ],
    deps: ["pressure", "pressureUnit", "flowRate", "flowUnit"],
  },
  "heat-exchangers": {
    lines: [
      "heatDuty: toBase(heatDuty, \"power\", powerUnit),",
      "deltaT: toBase(deltaT, \"temperature\", tempUnit),",
    ],
    deps: ["heatDuty", "powerUnit", "deltaT", "tempUnit"],
  },
  fatigue: {
    lines: [
      "stressAmplitude: toBase(stressAmplitude, \"stress\", stressUnit),",
      "meanStress: toBase(meanStress, \"stress\", stressUnit),",
      "enduranceLimit: toBase(enduranceLimit, \"stress\", stressUnit),",
      "targetCycles,",
    ],
    deps: ["stressAmplitude", "meanStress", "enduranceLimit", "stressUnit", "targetCycles"],
  },
  corrosion: {
    lines: [
      "minThickness: toBase(minThickness, \"length\", lengthUnit),",
      "temperature,",
    ],
    deps: ["minThickness", "lengthUnit", "temperature"],
  },
  composites: {
    lines: [
      "requiredStrength: toBase(requiredStrength, \"stress\", stressUnit),",
    ],
    deps: ["requiredStrength", "stressUnit"],
  },
  sections: {
    lines: [
      "requiredI: I,",
      "width,",
      "height,",
    ],
    deps: ["I", "width", "height"],
  },
  "rolled-sections": {
    lines: [
      "requiredI: I,",
      "sectionDesignation: designation,",
    ],
    deps: ["I", "designation"],
  },
  "temperature-properties": {
    lines: [
      "temperature,",
      "E,",
    ],
    deps: ["temperature", "E"],
  },
  profiles: {
    lines: [
      "requiredI: I,",
      "width,",
      "height,",
    ],
    deps: ["I", "width", "height"],
  },
  fits: {
    lines: [
      "minGap: toBase(minGap, \"length\", lengthUnit),",
      "nominalGap: toBase(nominalGap, \"length\", lengthUnit),",
    ],
    deps: ["minGap", "nominalGap", "lengthUnit"],
  },
  tolerance: {
    lines: [
      "minGap: toBase(tolerance, \"length\", lengthUnit),",
    ],
    deps: ["tolerance", "lengthUnit"],
  },
  "cam-toolpaths": {
    lines: [
      "cycleTimeTarget: cycleTime,",
    ],
    deps: ["cycleTime"],
  },
  "cost-estimator": {
    lines: [
      "costTarget: targetCost,",
    ],
    deps: ["targetCost"],
  },
  impact: {
    lines: [
      "mass: toBase(mass, \"mass\", massUnit),",
      "velocity: toBase(velocity, \"velocity\", velocityUnit),",
      "impactDuration,",
    ],
    deps: ["mass", "massUnit", "velocity", "velocityUnit", "impactDuration"],
  },
  rotation: {
    lines: [
      "torque: toBase(torque, \"torque\", torqueUnit),",
      "inertia: toBase(inertia, \"inertia\", inertiaUnit),",
    ],
    deps: ["torque", "torqueUnit", "inertia", "inertiaUnit"],
  },
  suspension: {
    lines: [
      "mass: toBase(mass, \"mass\", massUnit),",
      "naturalFrequency,",
      "dampingRatio,",
      "trackWidth: toBase(trackWidth, \"length\", lengthUnit),",
      "wheelbase: toBase(wheelbase, \"length\", lengthUnit),",
    ],
    deps: ["mass", "massUnit", "naturalFrequency", "dampingRatio", "trackWidth", "wheelbase", "lengthUnit"],
  },
  "unit-converter": {
    lines: ["power: value,"],
    deps: ["value"],
  },
  "formula-reference": {
    lines: [],
    deps: [],
  },
};

const DEFAULT_SYNC = {
  lines: ["power,", "maxForce,", "length,", "targetSafetyFactor: 2,"],
  deps: ["power", "maxForce", "length"],
};

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (e.name === "page.tsx") acc.push(f);
  }
  return acc;
}

function getModuleId(filePath) {
  const rel = path.relative(productsDir, filePath).replace(/\\/g, "/");
  const parts = rel.split("/");
  return parts[parts.length - 2];
}

function ensureImport(src, importLine) {
  if (src.includes(importLine.split('"')[1])) return src;
  return src.replace(/("use client";\r?\n\r?\n)/, `$1${importLine}\n`);
}

function patchFile(filePath) {
  const moduleId = getModuleId(filePath);
  if (!moduleId || moduleId === "products") return { status: "skip", moduleId };

  let src = fs.readFileSync(filePath, "utf8");
  const broken = /const designUserInputs = useMemo\(\(\): ModuleUserInputs => \(\{\}\), \[\]\);\s*\n\s*useEffect\(\(\) => \{\s*setUserInputs\(designUserInputs\);\s*\}, \[designUserInputs, setUserInputs\]\);/;

  if (!broken.test(src)) {
    if (src.includes("useSyncDesignInputs") || src.includes("setUserInputs({")) {
      return { status: "already", moduleId };
    }
    return { status: "no-broken", moduleId };
  }

  const sync = MODULE_SYNC[moduleId] ?? DEFAULT_SYNC;
  if (sync === null) return { status: "manual", moduleId };

  const body = sync.lines.length ? sync.lines.map((l) => `      ${l}`).join("\n") : "";
  const deps = sync.deps.join(", ");

  const replacement = `const designUserInputs = useMemo((): ModuleUserInputs => ({
${body}
    }), [${deps}]);

  useSyncDesignInputs("${moduleId}", designUserInputs);`;

  src = src.replace(broken, replacement);

  src = ensureImport(src, 'import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";');

  if (src.includes("applyDesignFields") && !src.includes("useRegisterApplyDesignCandidate")) {
    src = ensureImport(
      src,
      'import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";'
    );
    src = src.replace(
      /(const applyDesignFields = useCallback\([\s\S]*?\), \[[^\]]*\]\);)/,
      `$1\n\n  useRegisterApplyDesignCandidate(applyDesignFields);`
    );
  }

  if (src.includes("setUserInputs") && !src.match(/setUserInputs\s*\(/)) {
    src = src.replace(
      /const \{ mode: workflowMode, setUserInputs \} = useDesignWorkflow\(\);/,
      "const { mode: workflowMode } = useDesignWorkflow();"
    );
    src = src.replace(
      /const \{ mode, setUserInputs \} = useDesignWorkflow\(\);/,
      "const { mode } = useDesignWorkflow();"
    );
  }

  // Remove useEffect from react import if no longer needed
  if (!src.includes("useEffect(") && src.includes("useEffect")) {
    src = src.replace(
      /import \{(.*?)\} from "react";/s,
      (_, imp) => {
        const parts = imp.split(",").map((s) => s.trim()).filter((s) => s && s !== "useEffect");
        return `import { ${parts.join(", ")} } from "react";`;
      }
    );
  }

  fs.writeFileSync(filePath, src);
  return { status: "patched", moduleId };
}

const results = walk(productsDir).map(patchFile);
console.log(`Patched: ${results.filter((r) => r.status === "patched").length}`);
console.log(`Already OK: ${results.filter((r) => r.status === "already").length}`);
console.log(`Skipped/manual: ${results.filter((r) => r.status === "manual" || r.status === "no-broken").length}`);
for (const r of results.filter((r) => r.status === "patched")) {
  console.log("  ", r.moduleId);
}
