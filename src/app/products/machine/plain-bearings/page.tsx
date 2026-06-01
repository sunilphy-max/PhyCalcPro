"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import PlainBearingsInputs from "@/components/machine/plain-bearings/PlainBearingsInputs";
import PlainBearingsResults from "@/components/machine/plain-bearings/PlainBearingsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import type { PlainBearingResult } from "@/lib/machine/plain-bearings/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("plain-bearings", (units) =>
    applyUnitMap(units, {
      load: setLoadUnit,
      diameter: setLengthUnit,
      length: setLengthUnit,
      clearance: setLengthUnit,
    })
  );

  const [load, setLoad] = useState(5000);
  const [loadUnit, setLoadUnit] = useState("N");
  const [speed, setSpeed] = useState(1200);
  const [diameter, setDiameter] = useState(50);
  const [length, setLength] = useState(40);
  const [clearance, setClearance] = useState(0.05);
  const [viscosity, setViscosity] = useState(0.03);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(PlainBearingResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    setResult(
      wrapResult(
        solvePlainBearingEngine({
          load: toBase(load, "force", loadUnit),
          speed,
          diameter: toBase(diameter, "length", lengthUnit),
          length: toBase(length, "length", lengthUnit),
          clearance: toBase(clearance, "length", lengthUnit),
          viscosity,
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="plain-bearings"
      title="Plain Bearings"
      left={
        <PlainBearingsInputs
          load={load}
          setLoad={setLoad}
          loadUnit={loadUnit}
          setLoadUnit={setLoadUnit}
          speed={speed}
          setSpeed={setSpeed}
          diameter={diameter}
          setDiameter={setDiameter}
          length={length}
          setLength={setLength}
          clearance={clearance}
          setClearance={setClearance}
          viscosity={viscosity}
          setViscosity={setViscosity}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Plain journal bearings">
          <p>
            Short-bearing Sommerfeld screening for full-film operation. Increase viscosity or reduce load if minimum
            film thickness is marginal; verify thermal equilibrium for high-speed duty.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<PlainBearingsResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
