"use client";

import { useCalculatorModule } from "@/hooks/useCalculatorModule";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState } from "react";
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
  const [useIsoLookup, setUseIsoLookup] = useState(true);
  const [isoHoleLetter, setIsoHoleLetter] = useState("H");
  const [isoHoleGrade, setIsoHoleGrade] = useState(7);
  const [isoShaftLetter, setIsoShaftLetter] = useState("g");
  const [isoShaftGrade, setIsoShaftGrade] = useState(6);
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
      ...(useIsoLookup
        ? {
            isoHoleLetter: isoHoleLetter,
            isoHoleGrade: isoHoleGrade,
            isoShaftLetter: isoShaftLetter,
            isoShaftGrade: isoShaftGrade,
          }
        : {}),
    };

    const raw = solveFitsEngine(config);

    setResult(
      wrapResult({
        holeMin: fromBase(raw.holeMin, "length", nominalUnit),
        holeMax: fromBase(raw.holeMax, "length", nominalUnit),
        shaftMin: fromBase(raw.shaftMin, "length", nominalUnit),
        shaftMax: fromBase(raw.shaftMax, "length", nominalUnit),
        clearanceMin: fromBase(raw.clearanceMin, "length", nominalUnit),
        clearanceMax: fromBase(raw.clearanceMax, "length", nominalUnit),
        fitType: raw.fitType,
      })
    );
  };

  return (
    <CalculatorLayout
      moduleId="fits"
      title="Fits & Clearances Calculator"
      left={
        <FitInputs
          nominalSize={nominalSize}
          setNominalSize={setNominalSize}
          nominalUnit={nominalUnit}
          setNominalUnit={setNominalUnit}
          useIsoLookup={useIsoLookup}
          setUseIsoLookup={setUseIsoLookup}
          isoHoleLetter={isoHoleLetter}
          setIsoHoleLetter={setIsoHoleLetter}
          isoHoleGrade={isoHoleGrade}
          setIsoHoleGrade={setIsoHoleGrade}
          isoShaftLetter={isoShaftLetter}
          setIsoShaftLetter={setIsoShaftLetter}
          isoShaftGrade={isoShaftGrade}
          setIsoShaftGrade={setIsoShaftGrade}
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
        />
      }
      center={
        <CalculatorGuidancePanel title="Fit overview">
          <p>
            Compute hole and shaft limits and the resulting clearance or interference range. ISO 286 lookup
            uses simplified IT grade deviations for screening.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<FitResults result={result} displayUnit={nominalUnit} />}
    />
  );
}
