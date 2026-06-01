/**
 * Scaffolds expansion modules — types, engine, page, inputs, results.
 * Run: node scripts/scaffold-expansion.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const modules = [
  { id: "v-belts", cat: "power-transmission", lib: "powerTransmission", title: "V-Belt Drive", solver: "solveVBeltDrive" },
  { id: "timing-belts", cat: "power-transmission", lib: "powerTransmission", title: "Timing Belt Drive", solver: "solveTimingBeltDrive" },
  { id: "roller-chains", cat: "power-transmission", lib: "powerTransmission", title: "Roller Chain Drive", solver: "solveRollerChainDrive" },
  { id: "multi-pulley", cat: "power-transmission", lib: "powerTransmission", title: "Multi-Pulley Layout", solver: "solveMultiPulley" },
  { id: "bevel-gears", cat: "machine", lib: "machine", title: "Bevel Gear Screening", solver: "solveBevelGearEngine" },
  { id: "worm-gears", cat: "machine", lib: "machine", title: "Worm Gear Drive", solver: "solveWormGearEngine" },
  { id: "planetary-gears", cat: "machine", lib: "machine", title: "Planetary Gear Set", solver: "solvePlanetaryGearEngine" },
  { id: "gear-ratio-design", cat: "machine", lib: "machine", title: "Gear Ratio Design", solver: "solveGearRatioDesignEngine" },
  { id: "compression-springs", cat: "springs", lib: "springs", title: "Compression Spring", solver: "solveCompressionSpringEngine" },
  { id: "extension-springs", cat: "springs", lib: "springs", title: "Extension Spring", solver: "solveExtensionSpringEngine" },
  { id: "torsion-springs", cat: "springs", lib: "springs", title: "Torsion Spring", solver: "solveTorsionSpringEngine" },
  { id: "keys-splines", cat: "fasteners", lib: "fasteners", title: "Keys & Splines", solver: "solveKeysSplinesEngine" },
  { id: "shaft-hubs", cat: "fasteners", lib: "fasteners", title: "Shaft Hub Fit", solver: "solveShaftHubEngine" },
  { id: "pins", cat: "fasteners", lib: "fasteners", title: "Pin & Clevis", solver: "solvePinEngine" },
  { id: "brakes-clutches", cat: "machine", lib: "machine", title: "Brakes & Clutches", solver: "solveBrakesClutchesEngine" },
  { id: "plain-bearings", cat: "machine", lib: "machine", title: "Plain Bearing", solver: "solvePlainBearingEngine" },
  { id: "circular-plates", cat: "structural", lib: "structural", title: "Circular Plate", solver: "solveCircularPlateEngine" },
  { id: "rolled-sections", cat: "materials", lib: "materials", title: "Rolled Sections", solver: "solveRolledSectionsEngine" },
  { id: "formula-reference", cat: "tools", lib: "tools", title: "Engineering Formulas", solver: "solveFormulaReferenceEngine" },
  { id: "unit-converter", cat: "tools", lib: "tools", title: "Unit Converter", solver: "solveUnitConverterEngine" },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function pascal(id) {
  return id.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
}

function writeIfMissing(file, content) {
  if (fs.existsSync(file)) return;
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
  console.log("created", path.relative(root, file));
}

for (const m of modules) {
  const libPath = path.join(root, "src", "lib", m.lib, m.id);
  const compPath = path.join(root, "src", "components", m.cat, m.id);
  const pagePath = path.join(root, "src", "app", "products", m.cat, m.id, "page.tsx");
  const layoutPath = path.join(root, "src", "app", "products", m.cat, "layout.tsx");
  const P = pascal(m.id);
  const typeName = `${P}Config`;
  const resultName = `${P}Result`;

  writeIfMissing(
    layoutPath,
    `export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`
  );

  writeIfMissing(
    path.join(libPath, "types.ts"),
    `export type ${typeName} = Record<string, number | string>;
export type ${resultName} = Record<string, number | string>;
`
  );

  writeIfMissing(
    path.join(libPath, "engine.ts"),
    `import type { ${typeName}, ${resultName} } from "./types";

export function ${m.solver}(config: ${typeName}): ${resultName} {
  void config;
  return { status: "pending" };
}
`
  );

  writeIfMissing(
    path.join(compPath, `${P}Inputs.tsx`),
    `"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = { onCalculate: () => void };

export default function ${P}Inputs({ onCalculate }: Props) {
  return (
    <CalculatorInputPanel title="${m.title}" description="Enter design parameters.">
      <p className="text-sm text-slate-500">Configure inputs on the page state.</p>
      <CalculatorCalculateButton onClick={onCalculate} label="Calculate" />
    </CalculatorInputPanel>
  );
}
`
  );

  writeIfMissing(
    path.join(compPath, `${P}Results.tsx`),
    `import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard } from "@/components/calculator/results";
import type { ${resultName} } from "@/lib/${m.lib}/${m.id}/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = { result: (${resultName} & { calculationSpec?: CalculationSpec }) | null };

export default function ${P}Results({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="${m.id}"
      fileName="${m.id}"
      title="Export ${m.title} results"
      description="Export the current summary for review."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Run the calculation to view results."
      heading="Results"
    >
      {result ? (
        <CalculatorMetricCard label="Status" value={String(result.status ?? "ok")} tone="blue" size="lg" />
      ) : null}
    </CalculatorResultsShell>
  );
}
`
  );

  writeIfMissing(
    pagePath,
    `"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import ${P}Inputs from "@/components/${m.cat}/${m.id}/${P}Inputs";
import ${P}Results from "@/components/${m.cat}/${m.id}/${P}Results";
import { ${m.solver} } from "@/lib/${m.lib}/${m.id}/engine";
import type { ${resultName} } from "@/lib/${m.lib}/${m.id}/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("${m.id}");
  const [result, setResult] = useState<(${resultName} & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    setResult(wrapResult(${m.solver}({})));
  };

  return (
    <CalculatorLayout
      moduleId="${m.id}"
      title="${m.title}"
      left={<${P}Inputs onCalculate={calculate} />}
      center={
        <CalculatorGuidancePanel title="${m.title}">
          <p>Indicative screening calculator using closed-form engineering formulas.</p>
        </CalculatorGuidancePanel>
      }
      right={<${P}Results result={result} />}
    />
  );
}
`
  );
}

console.log("Scaffold complete.");
