"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import TorsionSpringInputs from "@/components/springs/torsion-springs/TorsionSpringInputs";
import TorsionSpringResults from "@/components/springs/torsion-springs/TorsionSpringResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveTorsionSpringEngine } from "@/lib/springs/torsion-springs/engine";
import type { TorsionSpringResult } from "@/lib/springs/torsion-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("torsion-springs", (units) =>
    applyUnitMap(units, {
      wireDiameter: setLengthUnit,
      meanDiameter: setLengthUnit,
      legLength: setLengthUnit,
      modulus: setStressUnit,
      stress: setStressUnit,
    })
  );

  const [wireDiameter, setWireDiameter] = useState(2);
  const [meanDiameter, setMeanDiameter] = useState(20);
  const [activeCoils, setActiveCoils] = useState(6);
  const [legLength, setLegLength] = useState(30);
  const [deflectionAngleDeg, setDeflectionAngleDeg] = useState(90);
  const [modulus, setModulus] = useState(210);
  const [ultimateStrength, setUltimateStrength] = useState(1400);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<(TorsionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveTorsionSpringEngine({
          wireDiameter: toBase(wireDiameter, "length", lengthUnit),
          meanDiameter: toBase(meanDiameter, "length", lengthUnit),
          activeCoils,
          legLength: toBase(legLength, "length", lengthUnit),
          deflectionAngleDeg,
          modulus: toBase(modulus, "stress", stressUnit),
          ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      modulus: toBase(modulus, "stress", stressUnit) * 1e6,
    }), [wireDiameter, meanDiameter, lengthUnit, activeCoils, modulus, stressUnit]);

  useSyncDesignInputs("torsion-springs", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("torsion-springs", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="torsion-springs"
      title="Torsion Spring"
      left={
        <TorsionSpringInputs
          wireDiameter={wireDiameter}
          setWireDiameter={setWireDiameter}
          meanDiameter={meanDiameter}
          setMeanDiameter={setMeanDiameter}
          activeCoils={activeCoils}
          setActiveCoils={setActiveCoils}
          legLength={legLength}
          setLegLength={setLegLength}
          deflectionAngleDeg={deflectionAngleDeg}
          setDeflectionAngleDeg={setDeflectionAngleDeg}
          modulus={modulus}
          setModulus={setModulus}
          ultimateStrength={ultimateStrength}
          setUltimateStrength={setUltimateStrength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Torsion springs">
          <p>
            Rate k = Ed⁴/(116Dn). Bending stress uses straight-beam approximation — verify leg attachment
            and coil spacing for production designs.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<TorsionSpringResults result={result} stressUnit={stressUnit} />}
    />
  );
}
