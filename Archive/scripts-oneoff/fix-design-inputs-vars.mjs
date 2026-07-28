#!/usr/bin/env node
/** Fixes wrong variable names in designUserInputs blocks after bulk sync. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FIXES = [
  ["src/app/products/fasteners/bolts/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      maxForce: toBase(shearForce, "force", forceUnit),
      axialLoad: toBase(axialForce, "force", forceUnit),
      allowableStressPa: 260e6,
    }), [shearForce, forceUnit, axialForce]);`],
  ["src/app/products/structural/plates/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      length: toBase(length, "length", lengthUnit),
      width: toBase(width, "length", lengthUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      E: toBase(E, "stress", EUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
    }), [length, lengthUnit, width, pressure, pressureUnit, E, EUnit, thickness, thicknessUnit]);`],
  ["src/app/products/fasteners/welds/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      shearForce: toBase(shearForce, "force", shearForceUnit),
      axialLoad: toBase(axialForce, "force", axialForceUnit),
      length: toBase(weldLength, "length", weldLengthUnit),
      weldCount,
      eccentricity: toBase(eccentricity, "length", eccentricityUnit),
    }), [shearForce, shearForceUnit, axialForce, axialForceUnit, weldLength, weldLengthUnit, weldCount, eccentricity, eccentricityUnit]);`],
  ["src/app/products/dynamics/impact/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      mass: toBase(mass, "mass", massUnit),
      velocity: toBase(velocityChange, "velocity", velocityUnit),
      impactDuration,
    }), [mass, massUnit, velocityChange, velocityUnit, impactDuration]);`, 'import { toBase } from "@/lib/units/conversions";'],
  ["src/app/products/dynamics/vibrations/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      length: toBase(length, "length", lengthUnit),
      E: toBase(E, "stress", EUnit),
      inertia: toBase(I, "inertia", inertiaUnit),
      dampingRatio,
    }), [length, lengthUnit, E, EUnit, I, inertiaUnit, dampingRatio]);`, 'import { toBase } from "@/lib/units/conversions";'],
  ["src/app/products/dynamics/suspension/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      mass: sprungMass,
      trackWidth,
      wheelbase,
      lateralAcceleration,
      cgHeight,
    }), [sprungMass, trackWidth, wheelbase, lateralAcceleration, cgHeight]);`],
  ["src/app/products/structural/load-case-manager/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      axialLoad: cases[0]?.axialForce ?? 0,
      bendingMoment: cases[0]?.bendingMoment ?? 0,
      shearForce: cases[0]?.shearForce ?? 0,
      targetSafetyFactor: 2,
    }), [cases]);`],
  ["src/app/products/structural/combined-loading/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      axialLoad: toBase(axialForce, "force", axialUnit),
      bendingMoment: toBase(bendingMoment, "moment", momentUnit),
      torque: toBase(torque, "torque", torqueUnit),
      shearForce: toBase(shearForce, "force", shearUnit),
      allowableStressPa: toBase(yieldStrength, "stress", stressUnit) * 1e6,
    }), [axialForce, axialUnit, bendingMoment, momentUnit, torque, torqueUnit, shearForce, shearUnit, yieldStrength, stressUnit]);`, 'import { toBase } from "@/lib/units/conversions";'],
  ["src/app/products/materials/fatigue/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      stressAmplitude: toBase(alternatingStress, "stress", alternatingUnit) * 1e6,
      meanStress: toBase(meanStress, "stress", meanUnit) * 1e6,
      enduranceLimit: toBase(enduranceLimit, "stress", enduranceUnit) * 1e6,
      targetCycles: 1e6,
    }), [alternatingStress, alternatingUnit, meanStress, meanUnit, enduranceLimit, enduranceUnit]);`],
  ["src/app/products/pressure/heat-exchangers/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      heatDuty: hotFlowRate * hotCp * Math.abs(hotInletTemp - hotOutletTemp) * 1000,
      deltaT: Math.abs(hotInletTemp - coldInletTemp),
    }), [hotFlowRate, hotCp, hotInletTemp, hotOutletTemp, coldInletTemp]);`],
  ["src/app/products/structural/trusses/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      length: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      maxForce: toBase(load, "force", loadUnit),
      E: toBase(E, "stress", EUnit),
      area,
    }), [span, spanUnit, height, heightUnit, load, loadUnit, E, EUnit, area]);`],
  ["src/app/products/fasteners/pins/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      shearForce: toBase(force, "force", forceUnit),
      shaftDiameter: toBase(pinDiameter, "length", lengthUnit),
    }), [force, forceUnit, pinDiameter, lengthUnit]);`],
  ["src/app/products/fasteners/rivets/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      maxForce: toBase(shearForce, "force", shearUnit),
      count: quantity,
    }), [shearForce, shearUnit, quantity]);`],
  ["src/app/products/machine/flywheels/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      speedDriver: rpm,
      energy: 5000,
    }), [rpm]);`],
  ["src/app/products/pressure/hydraulics/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      pressure: toBase(pressure, "pressure", pressureUnit),
      maxForce: toBase(forceGoal, "force", forceUnit),
    }), [pressure, pressureUnit, forceGoal, forceUnit]);`],
  ["src/app/products/profiles/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      requiredI: result?.Ixx,
      width: shape.shape === "rectangle" ? shape.rectangle?.width : undefined,
      height: shape.shape === "rectangle" ? shape.rectangle?.height : undefined,
    }), [result, shape]);`],
  ["src/app/products/materials/sections/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      requiredI: result?.Ixx,
      width,
      height,
    }), [result, width, height]);`],
  ["src/app/products/machine/gear-ratio-design/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      ratio: targetRatio,
      pinionTeeth: minPinionTeeth,
    }), [targetRatio, minPinionTeeth]);`],
  ["src/app/products/materials/rolled-sections/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      sectionDesignation: designation,
    }), [designation]);`],
  ["src/app/products/fasteners/safety-factor/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      appliedStress: yieldStrength / 2,
      yieldStress: yieldStrength,
      loadFactor: 1.5,
    }), [yieldStrength]);`],
  ["src/app/products/springs/torsion-springs/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      modulus: toBase(modulus, "stress", stressUnit) * 1e6,
    }), [wireDiameter, meanDiameter, lengthUnit, activeCoils, modulus, stressUnit]);`],
  ["src/app/products/manufacturing/cam-toolpaths/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      cycleTimeTarget: stockLength / Math.max(feedPerTooth * numFlutes * spindleSpeed / 60, 1),
    }), [stockLength, feedPerTooth, numFlutes, spindleSpeed]);`],
  ["src/app/products/manufacturing/cost-estimator/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      costTarget: materialVolume * materialDensity * materialCostPerKg,
    }), [materialVolume, materialDensity, materialCostPerKg]);`],
  ["src/app/products/manufacturing/tolerance/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      minGap: tolerances[0] ?? 0.05,
      nominalGap: tolerances[1] ?? 0.02,
    }), [tolerances]);`],
  ["src/app/products/dynamics/rotation/page.tsx", `const designUserInputs = useMemo((): ModuleUserInputs => ({
      torque: power,
      inertia: mass * radius * radius,
    }), [power, mass, radius]);`, 'import { toBase } from "@/lib/units/conversions";'],
];

const BLOCK = /const designUserInputs = useMemo\(\(\): ModuleUserInputs => \(\{[\s\S]*?\}\), \[[^\]]*\]\);/;

for (const [file, replacement, addImport] of FIXES) {
  const filePath = path.join(root, file);
  let src = fs.readFileSync(filePath, "utf8");
  if (addImport && !src.includes(addImport.split('"')[1])) {
    src = src.replace(/("use client";\r?\n\r?\n)/, `$1${addImport}\n`);
  }
  if (!BLOCK.test(src)) {
    console.log("skip (no block)", file);
    continue;
  }
  src = src.replace(BLOCK, replacement);
  fs.writeFileSync(filePath, src);
  console.log("fixed", file);
}
