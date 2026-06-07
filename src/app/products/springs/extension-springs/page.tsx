"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import ExtensionSpringInputs from "@/components/springs/extension-springs/ExtensionSpringInputs";
import ExtensionSpringResults from "@/components/springs/extension-springs/ExtensionSpringResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveExtensionSpringEngine } from "@/lib/springs/extension-springs/engine";
import type { ExtensionSpringResult } from "@/lib/springs/extension-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("extension-springs", (units) =>
    applyUnitMap(units, {
      wireDiameter: setLengthUnit,
      meanDiameter: setLengthUnit,
      freeLength: setLengthUnit,
      deflection: setLengthUnit,
      modulus: setStressUnit,
      stress: setStressUnit,
    })
  );

  const [wireDiameter, setWireDiameter] = useState(2);
  const [meanDiameter, setMeanDiameter] = useState(20);
  const [activeCoils, setActiveCoils] = useState(10);
  const [freeLength, setFreeLength] = useState(60);
  const [deflection, setDeflection] = useState(15);
  const [modulus, setModulus] = useState(81);
  const [ultimateStrength, setUltimateStrength] = useState(1400);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<(ExtensionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveExtensionSpringEngine({
          wireDiameter: toBase(wireDiameter, "length", lengthUnit),
          meanDiameter: toBase(meanDiameter, "length", lengthUnit),
          activeCoils,
          freeLength: toBase(freeLength, "length", lengthUnit),
          deflection: toBase(deflection, "length", lengthUnit),
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
      deflection: toBase(deflection, "length", lengthUnit),
    }), [wireDiameter, meanDiameter, lengthUnit, activeCoils, modulus, stressUnit, deflection]);

  useSyncDesignInputs("extension-springs", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("extension-springs", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="extension-springs"
      title="Extension Spring"
      left={
        <ExtensionSpringInputs
          wireDiameter={wireDiameter}
          setWireDiameter={setWireDiameter}
          meanDiameter={meanDiameter}
          setMeanDiameter={setMeanDiameter}
          activeCoils={activeCoils}
          setActiveCoils={setActiveCoils}
          freeLength={freeLength}
          setFreeLength={setFreeLength}
          deflection={deflection}
          setDeflection={setDeflection}
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
        <CalculatorGuidancePanel title="Extension springs">
          <p>
            Includes indicative initial tension estimate. Confirm hook stress and loop geometry separately.
            Rate uses the same helical spring formula as compression springs.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<ExtensionSpringResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
    />
  );
}
