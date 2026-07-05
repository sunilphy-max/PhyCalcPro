"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import PlainBearingsInputs from "@/components/machine/plain-bearings/PlainBearingsInputs";
import PlainBearingsResults from "@/components/machine/plain-bearings/PlainBearingsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import type { PlainBearingResult } from "@/lib/machine/plain-bearings/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
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
  const [bearingType, setBearingType] = useState<"journal" | "thrust_pad" | "tilting_pad">("journal");
  const [padDiameterRatio, setPadDiameterRatio] = useState(2);
  const [padCount, setPadCount] = useState(6);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(PlainBearingResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solvePlainBearingEngine({
          bearingType,
          load: toBase(load, "force", loadUnit),
          speed,
          diameter: toBase(diameter, "length", lengthUnit),
          length: toBase(length, "length", lengthUnit),
          clearance: toBase(clearance, "length", lengthUnit),
          viscosity,
          padDiameterRatio,
          padCount,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      maxForce: toBase(load, "force", loadUnit),
      speedDriver: speed,
      length: toBase(diameter, "length", lengthUnit),
    }), [load, loadUnit, speed, diameter, lengthUnit]);

  useSyncDesignInputs("plain-bearings", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    journalDiameter: (v) => setDiameter(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("plain-bearings", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="plain-bearings"
      title="Plain Bearings"
      inputs={
        <PlainBearingsInputs
          bearingType={bearingType}
          setBearingType={setBearingType}
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
          padDiameterRatio={padDiameterRatio}
          setPadDiameterRatio={setPadDiameterRatio}
          padCount={padCount}
          setPadCount={setPadCount}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
      }
      results={<PlainBearingsResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
