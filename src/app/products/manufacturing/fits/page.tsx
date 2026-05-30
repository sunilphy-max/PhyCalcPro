"use client";

import { useCalculatorModule } from "@/hooks/useCalculatorModule";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import FitInputs from "@/components/manufacturing/FitInputs";
import FitResults from "@/components/manufacturing/FitResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveFitsEngine } from "@/lib/manufacturing/engine";
import type { FitResult } from "@/lib/manufacturing/types";

export default function Page() {
  const { wrapResult } = useCalculatorModule("fits", (units) =>
    applyUnitMap(units, {
      nominalSize: setNominalUnit,
      tolerance: setToleranceUnit,
    })
  );
  const [nominalSize, setNominalSize] = useState(50);
  const [nominalUnit, setNominalUnit] = useState("mm");
  const [holeUpper, setHoleUpper] = useState(0.05);
  const [holeLower, setHoleLower] = useState(-0.05);
  const [shaftUpper, setShaftUpper] = useState(-0.01);
  const [shaftLower, setShaftLower] = useState(-0.07);
  const [toleranceUnit, setToleranceUnit] = useState("mm");
  const [result, setResult] = useState<FitResult | null>(null);

  const calculate = () => {
    const config = {
      nominalSize: toBase(nominalSize, "length", nominalUnit),
      holeUpper: toBase(holeUpper, "length", toleranceUnit),
      holeLower: toBase(holeLower, "length", toleranceUnit),
      shaftUpper: toBase(shaftUpper, "length", toleranceUnit),
      shaftLower: toBase(shaftLower, "length", toleranceUnit),
    };

    const raw = solveFitsEngine(config);

    setResult(wrapResult({
      holeMin: fromBase(raw.holeMin, "length", nominalUnit),
      holeMax: fromBase(raw.holeMax, "length", nominalUnit),
      shaftMin: fromBase(raw.shaftMin, "length", nominalUnit),
      shaftMax: fromBase(raw.shaftMax, "length", nominalUnit),
      clearanceMin: fromBase(raw.clearanceMin, "length", nominalUnit),
      clearanceMax: fromBase(raw.clearanceMax, "length", nominalUnit),
      fitType: raw.fitType,
    }));
  };

  return (
    <DashboardLayout title="Fits & Clearances">
      <CalculatorLayout
        moduleId="fits"
        title="Fits & Clearances Calculator"
        left={<FitInputs
          nominalSize={nominalSize}
          setNominalSize={setNominalSize}
          nominalUnit={nominalUnit}
          setNominalUnit={setNominalUnit}
          holeUpper={holeUpper}
          setHoleUpper={setHoleUpper}
          holeLower={holeLower}
          setHoleLower={setHoleLower}
          shaftUpper={shaftUpper}
          setShaftUpper={setShaftUpper}
          shaftLower={shaftLower}
          setShaftLower={setShaftLower}
          toleranceUnit={toleranceUnit}
          setToleranceUnit={setToleranceUnit}
          onCalculate={calculate}
        />}
        center={
          <CalculatorGuidancePanel title="Fit overview">
            <p>
              Compute hole and shaft limits and the resulting clearance or interference range. Change design
              standard above to align units with US / EU / ISO practice.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<FitResults result={result} displayUnit={nominalUnit} />}
      />
    </DashboardLayout>
  );
}
