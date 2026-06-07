"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import PlateInputs from "@/components/structural/plates/PlateInputs";
import PlateResults from "@/components/structural/plates/PlateResults";
import { toBase } from "@/lib/units/conversions";
import { solvePlateEngine } from "@/lib/structural/plates/engine";
import type { BoundaryType, PlateResult } from "@/lib/structural/plates/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("plates");
  const [length, setLength] = useState(2);
  const [width, setWidth] = useState(1.2);
  const [thickness, setThickness] = useState(0.015);
  const [pressure, setPressure] = useState(10000);
  const [E, setE] = useState(210e9);
  const [nu, setNu] = useState(0.3);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [thicknessUnit, setThicknessUnit] = useState("mm");
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [EUnit, setEUnit] = useState("Pa");
  const [meshSegments, setMeshSegments] = useState(8);
  const [boundaryType, setBoundaryType] = useState<BoundaryType>("clamped");
  const [result, setResult] = useState<PlateResult | null>(null);

  const runCheck = () => {
    const config = {
      length: toBase(length, "length", lengthUnit),
      width: toBase(width, "length", lengthUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      E: toBase(E, "stress", EUnit),
      nu,
      q: toBase(pressure, "pressure", pressureUnit),
      elementsX: meshSegments,
      elementsY: meshSegments,
      boundaryType,
    };

    setResult(wrapResult(solvePlateEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      length: toBase(length, "length", lengthUnit),
      width: toBase(width, "length", lengthUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      E: toBase(E, "stress", EUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
    }), [length, lengthUnit, width, pressure, pressureUnit, E, EUnit, thickness, thicknessUnit]);

  useSyncDesignInputs("plates", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.thickness != null) setThickness(fields.thickness as never);
  }, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("plates", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="plates"
      title="Plate Bending Analysis"
      inputs={
        <PlateInputs
          length={length}
          setLength={setLength}
          width={width}
          setWidth={setWidth}
          thickness={thickness}
          setThickness={setThickness}
          pressure={pressure}
          setPressure={setPressure}
          E={E}
          setE={setE}
          nu={nu}
          setNu={setNu}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          thicknessUnit={thicknessUnit}
          setThicknessUnit={setThicknessUnit}
          pressureUnit={pressureUnit}
          setPressureUnit={setPressureUnit}
          EUnit={EUnit}
          setEUnit={setEUnit}
          boundaryType={boundaryType}
          setBoundaryType={setBoundaryType}
          meshSegments={meshSegments}
          setMeshSegments={setMeshSegments}
          onCalculate={calculate}
        />
      }
      results={<PlateResults result={result} />}
    />
  );
}
