"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import PressurePipeInputs from "@/components/pressure/pipes/PressurePipeInputs";
import PressurePipeResults from "@/components/pressure/pipes/PressurePipeResults";
import { toBase } from "@/lib/units/conversions";
import { solvePressurePipeEngine } from "@/lib/pressure/pipes/engine";
import type { PressurePipeResult } from "@/lib/pressure/pipes/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("pipes", (units) =>
    applyUnitMap(units, {
      radius: setRadiusUnit,
      thickness: setThicknessUnit,
      length: setLengthUnit,
      pressure: setPressureUnit,
      modulus: setEUnit,
    })
  );
  const [radius, setRadius] = useState(0.5);
  const [radiusUnit, setRadiusUnit] = useState("m");
  const [thickness, setThickness] = useState(0.02);
  const [thicknessUnit, setThicknessUnit] = useState("m");
  const [length, setLength] = useState(3);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [pressure, setPressure] = useState(1e6);
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [E, setE] = useState(210e9);
  const [EUnit, setEUnit] = useState("Pa");
  const [segments, setSegments] = useState(40);
  const [result, setResult] = useState<PressurePipeResult | null>(null);

  const runCheck = () => {
    const config = {
      radius: toBase(radius, "length", radiusUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      length: toBase(length, "length", lengthUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      E: toBase(E, "stress", EUnit),
      segments: Math.max(8, Math.round(segments)),
    };

    setResult(wrapResult(solvePressurePipeEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      pressure: toBase(pressure, "pressure", pressureUnit),
      length: toBase(radius, "length", radiusUnit),
      E: toBase(E, "stress", EUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
    }), [pressure, pressureUnit, radius, radiusUnit, E, EUnit, thickness, thicknessUnit]);

  useSyncDesignInputs("pipes", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.thickness != null) setThickness(fields.thickness as never);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("pipes", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="pipes"
      title="Pressure Pipe Analysis"
      inputs={
        <div className="space-y-4">
          <PressurePipeInputs
            radius={radius}
            setRadius={setRadius}
            radiusUnit={radiusUnit}
            setRadiusUnit={setRadiusUnit}
            thickness={thickness}
            setThickness={setThickness}
            thicknessUnit={thicknessUnit}
            setThicknessUnit={setThicknessUnit}
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            pressure={pressure}
            setPressure={setPressure}
            pressureUnit={pressureUnit}
            setPressureUnit={setPressureUnit}
            E={E}
            setE={setE}
            EUnit={EUnit}
            setEUnit={setEUnit}
            segments={segments}
            setSegments={setSegments}
          onCalculate={calculate}
        />
        </div>
      }
      results={<PressurePipeResults result={result} />}
    />
  );
}
