/**
 * Writes functional pages for all expansion modules.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const modules = [
  ["compression-springs", "springs", "springs", "solveCompressionSpringEngine", "Compression Spring", `{ wireDiameter: toBase(2, "length", "mm"), meanDiameter: toBase(20, "length", "mm"), activeCoils: 8, freeLength: toBase(50, "length", "mm"), deflection: toBase(10, "length", "mm"), modulus: 210e9, ultimateStrength: 1400e6 }`],
  ["extension-springs", "springs", "springs", "solveExtensionSpringEngine", "Extension Spring", `{ wireDiameter: toBase(2, "length", "mm"), meanDiameter: toBase(20, "length", "mm"), activeCoils: 10, freeLength: toBase(60, "length", "mm"), deflection: toBase(15, "length", "mm"), modulus: 210e9, ultimateStrength: 1400e6 }`],
  ["torsion-springs", "springs", "springs", "solveTorsionSpringEngine", "Torsion Spring", `{ wireDiameter: toBase(2, "length", "mm"), meanDiameter: toBase(20, "length", "mm"), activeCoils: 6, legLength: toBase(30, "length", "mm"), modulus: 210e9, deflectionAngleDeg: 90, ultimateStrength: 1400e6 }`],
  ["timing-belts", "power-transmission", "powerTransmission", "solveTimingBeltDrive", "Timing Belt Drive", `{ power: 5000, speedDriver: 1200, pitch: toBase(5, "length", "mm"), teethDriver: 24, teethDriven: 48, beltWidth: toBase(20, "length", "mm"), serviceFactor: 1.2 }`],
  ["roller-chains", "power-transmission", "powerTransmission", "solveRollerChainDrive", "Roller Chain Drive", `{ power: 10000, speedDriver: 900, teethDriver: 19, teethDriven: 57, pitch: toBase(15.875, "length", "mm"), strands: 1, serviceFactor: 1.3 }`],
  ["multi-pulley", "power-transmission", "powerTransmission", "solveMultiPulley", "Multi-Pulley Layout", `{ diameters: [toBase(150, "length", "mm"), toBase(300, "length", "mm")], centerDistances: [toBase(500, "length", "mm")], driveType: "open" }`],
  ["bevel-gears", "machine", "machine", "solveBevelGearEngine", "Bevel Gear Screening", `{ power: 10000, speed: 1200, pinionTeeth: 20, gearRatio: 3, module: toBase(4, "length", "mm"), faceWidth: toBase(30, "length", "mm"), yieldStress: 250e6, pressureAngleDeg: 20 }`],
  ["worm-gears", "machine", "machine", "solveWormGearEngine", "Worm Gear Drive", `{ power: 3000, speed: 1450, wormStarts: 2, gearTeeth: 40, module: toBase(3, "length", "mm"), faceWidth: toBase(30, "length", "mm"), frictionCoeff: 0.05, leadAngleDeg: 5, yieldStress: 200e6 }`],
  ["planetary-gears", "machine", "machine", "solvePlanetaryGearEngine", "Planetary Gear Set", `{ sunTeeth: 20, planetTeeth: 30, targetRatio: 6, module: toBase(2, "length", "mm"), power: 5000, speed: 1500 }`],
  ["gear-ratio-design", "machine", "machine", "solveGearRatioDesignEngine", "Gear Ratio Design", `{ targetRatio: 3.5, maxTeeth: 120, minPinionTeeth: 17 }`],
  ["keys-splines", "fasteners", "fasteners", "solveKeysSplinesEngine", "Keys & Splines", `{ torque: 500, shaftDiameter: toBase(40, "length", "mm"), keyWidth: toBase(12, "length", "mm"), keyHeight: toBase(8, "length", "mm"), keyLength: toBase(60, "length", "mm"), yieldStress: 350e6, keyType: "parallel" }`],
  ["shaft-hubs", "fasteners", "fasteners", "solveShaftHubEngine", "Shaft Hub Fit", `{ shaftDiameter: toBase(50, "length", "mm"), hubOuterDiameter: toBase(100, "length", "mm"), hubLength: toBase(60, "length", "mm"), interference: toBase(0.05, "length", "mm"), frictionCoeff: 0.12, modulus: 210e9 }`],
  ["pins", "fasteners", "fasteners", "solvePinEngine", "Pin & Clevis", `{ force: 20000, pinDiameter: toBase(16, "length", "mm"), plateThickness: toBase(12, "length", "mm"), pinMaterialYield: 350e6, pinCount: 1 }`],
  ["brakes-clutches", "machine", "machine", "solveBrakesClutchesEngine", "Brakes & Clutches", `{ frictionCoeff: 0.35, outerRadius: toBase(120, "length", "mm"), innerRadius: toBase(80, "length", "mm"), actuationForce: 5000, speed: 1500, engagementTime: 2, safetyFactorTarget: 2 }`],
  ["plain-bearings", "machine", "machine", "solvePlainBearingEngine", "Plain Bearing", `{ load: 5000, speed: 1200, diameter: toBase(50, "length", "mm"), length: toBase(40, "length", "mm"), clearance: toBase(0.05, "length", "mm"), viscosity: 0.03 }`],
  ["circular-plates", "structural", "structural", "solveCircularPlateEngine", "Circular Plate", `{ radius: toBase(0.5, "length", "m"), thickness: toBase(10, "length", "mm"), pressure: 100000, modulus: 210e9, poisson: 0.3, boundary: "simply_supported" }`],
  ["rolled-sections", "materials", "materials", "solveRolledSectionsEngine", "Rolled Sections", `{ designation: "W310x97" }`],
  ["formula-reference", "tools", "tools", "solveFormulaReferenceEngine", "Engineering Formulas", `{ formulaId: "kinetic_energy", inputs: { mass: 10, velocity: 5 } }`],
  ["unit-converter", "tools", "tools", "solveUnitConverterEngine", "Unit Converter", `{ value: 1000, dimension: "length", fromUnit: "mm", toUnit: "in" }`],
];

function pascal(id) {
  return id.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
}

for (const [id, cat, lib, solver, title, config] of modules) {
  if (id === "v-belts") continue;
  const P = pascal(id);
  const file = path.join(root, "src", "app", "products", cat, id, "page.tsx");
  fs.writeFileSync(
    file,
    `"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { toBase } from "@/lib/units/conversions";
import { ${solver} } from "@/lib/${lib}/${id}/engine";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("${id}");
  const [result, setResult] = useState<Record<string, unknown> & { calculationSpec?: CalculationSpec } | null>(null);

  const calculate = () => {
    setResult(wrapResult(${solver}(${config})));
  };

  const numericEntries = result
    ? Object.entries(result).filter(([k, v]) => k !== "calculationSpec" && typeof v === "number")
    : [];
  const textEntries = result
    ? Object.entries(result).filter(([k, v]) => k !== "calculationSpec" && typeof v === "string")
    : [];

  return (
    <CalculatorLayout
      moduleId="${id}"
      title="${title}"
      left={
        <CalculatorInputPanel
          title="${title}"
          description="Run indicative screening with default example values."
          footer={<CalculatorCalculateButton onClick={calculate} label="Calculate" />}
        >
          <p className="text-sm text-slate-500">Defaults represent a typical sizing case. Extend inputs in a future revision.</p>
        </CalculatorInputPanel>
      }
      center={
        <CalculatorGuidancePanel title="${title}">
          <p>Closed-form engineering screening — verify with manufacturer data and applicable standards.</p>
        </CalculatorGuidancePanel>
      }
      right={
        <CalculatorResultsShell
          moduleId="${id}"
          fileName="${id}"
          title="Export results"
          empty={!result}
          emptyMessage="Calculate to view results."
          heading="Results"
          calculationSpec={result?.calculationSpec}
        >
          {result ? (
            <>
              <CalculatorMetricGrid cols={2}>
                {numericEntries.slice(0, 8).map(([k, v]) => (
                  <CalculatorMetricCard key={k} label={k.replace(/([A-Z])/g, " $1")} numericValue={v as number} tone="blue" />
                ))}
              </CalculatorMetricGrid>
              {textEntries.map(([k, v]) => (
                <CalculatorMetricCard key={k} label={k} value={String(v)} tone="blue" />
              ))}
            </>
          ) : null}
        </CalculatorResultsShell>
      }
    />
  );
}
`
  );
  console.log("page", id);
}

console.log("Done.");
