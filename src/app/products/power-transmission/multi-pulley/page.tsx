"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import MultiPulleyInputs from "@/components/power-transmission/multi-pulley/MultiPulleyInputs";
import MultiPulleyResults from "@/components/power-transmission/multi-pulley/MultiPulleyResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveMultiPulley } from "@/lib/powerTransmission/multi-pulley/engine";
import type { MultiPulleyResult } from "@/lib/powerTransmission/multi-pulley/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("multi-pulley", (units) =>
    applyUnitMap(units, { diameter: setLengthUnit, centerDistance: setLengthUnit })
  );

  const [pulleys, setPulleys] = useState([
    { diameter: 150, centerDistance: 500 },
    { diameter: 300, centerDistance: 400 },
    { diameter: 200, centerDistance: 0 },
  ]);
  const [driveType, setDriveType] = useState<"open" | "crossed">("open");
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(MultiPulleyResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    const diameters = pulleys.map((p) => toBase(p.diameter, "length", lengthUnit));
    const centerDistances = pulleys
      .slice(0, -1)
      .map((p) => toBase(p.centerDistance, "length", lengthUnit));
    setResult(
      wrapResult(
        solveMultiPulley({
          diameters,
          centerDistances,
          driveType,
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="multi-pulley"
      title="Multi-Pulley Layout"
      left={
        <MultiPulleyInputs
          pulleys={pulleys}
          setPulleys={setPulleys}
          driveType={driveType}
          setDriveType={setDriveType}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Multi-pulley drives">
          <p>
            Chain of 2–8 pulleys with per-segment wrap angles, total belt length, and indicative radial
            bearing loads. Aim for wrap ≥ 120° on the driver.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<MultiPulleyResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
