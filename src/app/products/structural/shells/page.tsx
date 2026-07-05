"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ShellsInputs from "@/components/structural/shells/ShellsInputs";
import ShellsResults from "@/components/structural/shells/ShellsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveShellEngine } from "@/lib/structural/shells/engine";
import type { ShellResult } from "@/lib/structural/shells/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("shells", (units) =>
    applyUnitMap(units, {
      radius: setLengthUnit,
      thickness: setLengthUnit,
      length: setLengthUnit,
      pressure: setPressureUnit,
      force: setForceUnit,
      moment: setMomentUnit,
      modulus: setModulusUnit,
      stress: setStressUnit,
    })
  );

  const [radius, setRadius] = useState(0.5);
  const [thickness, setThickness] = useState(0.01);
  const [length, setLength] = useState(2);
  const [internalPressure, setInternalPressure] = useState(500);
  const [axialForce, setAxialForce] = useState(0);
  const [bendingMoment, setBendingMoment] = useState(0);
  const [modulus, setModulus] = useState(210);
  const [allowableStress, setAllowableStress] = useState(170);
  const [endCondition, setEndCondition] = useState<"open" | "closed">("closed");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [pressureUnit, setPressureUnit] = useState("kPa");
  const [forceUnit, setForceUnit] = useState("kN");
  const [momentUnit, setMomentUnit] = useState("kN·m");
  const [modulusUnit, setModulusUnit] = useState("GPa");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<(ShellResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveShellEngine({
          radius: toBase(radius, "length", lengthUnit),
          thickness: toBase(thickness, "length", lengthUnit),
          length: toBase(length, "length", lengthUnit),
          internalPressure: toBase(internalPressure, "pressure", pressureUnit),
          axialForce: toBase(axialForce, "force", forceUnit),
          bendingMoment: toBase(bendingMoment, "moment", momentUnit),
          modulus: toBase(modulus, "stress", modulusUnit),
          poisson: 0.3,
          endCondition,
          allowableStress: toBase(allowableStress, "stress", stressUnit),
        })
      )
    );
  };

  const designUserInputs = useMemo((): ModuleUserInputs => ({
    pressure: toBase(internalPressure, "pressure", pressureUnit),
    thickness: toBase(thickness, "length", lengthUnit),
    length: toBase(length, "length", lengthUnit),
  }), [internalPressure, pressureUnit, thickness, lengthUnit, length]);

  useSyncDesignInputs("shells", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.thickness != null) setThickness(fields.thickness as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("shells", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="shells"
      title="Cylindrical Shells"
      inputs={
        <ShellsInputs
          radius={radius}
          setRadius={setRadius}
          thickness={thickness}
          setThickness={setThickness}
          length={length}
          setLength={setLength}
          internalPressure={internalPressure}
          setInternalPressure={setInternalPressure}
          axialForce={axialForce}
          setAxialForce={setAxialForce}
          bendingMoment={bendingMoment}
          setBendingMoment={setBendingMoment}
          modulus={modulus}
          setModulus={setModulus}
          allowableStress={allowableStress}
          setAllowableStress={setAllowableStress}
          endCondition={endCondition}
          setEndCondition={setEndCondition}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          pressureUnit={pressureUnit}
          setPressureUnit={setPressureUnit}
          forceUnit={forceUnit}
          setForceUnit={setForceUnit}
          momentUnit={momentUnit}
          setMomentUnit={setMomentUnit}
          modulusUnit={modulusUnit}
          setModulusUnit={setModulusUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
        />
      }
      results={<ShellsResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
    />
  );
}
