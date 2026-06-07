"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ShaftHubInputs from "@/components/fasteners/shaft-hubs/ShaftHubInputs";
import ShaftHubResults from "@/components/fasteners/shaft-hubs/ShaftHubResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveShaftHubEngine } from "@/lib/fasteners/shaft-hubs/engine";
import type { ShaftHubResult } from "@/lib/fasteners/shaft-hubs/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("shaft-hubs", (units) =>
    applyUnitMap(units, {
      shaftDiameter: setLengthUnit,
      hubOuterDiameter: setLengthUnit,
      hubLength: setLengthUnit,
      interference: setInterferenceUnit,
      modulus: setStressUnit,
    })
  );

  const [shaftDiameter, setShaftDiameter] = useState(50);
  const [hubOuterDiameter, setHubOuterDiameter] = useState(100);
  const [hubLength, setHubLength] = useState(60);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [interference, setInterference] = useState(0.05);
  const [interferenceUnit, setInterferenceUnit] = useState("mm");
  const [frictionCoeff, setFrictionCoeff] = useState(0.12);
  const [modulus, setModulus] = useState(210);
  const [stressUnit, setStressUnit] = useState("GPa");
  const [result, setResult] = useState<(ShaftHubResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const torqueUnit = "N·m";

  const runCheck = () => {
    setResult(
      wrapResult(
        solveShaftHubEngine({
          shaftDiameter: toBase(shaftDiameter, "length", lengthUnit),
          hubOuterDiameter: toBase(hubOuterDiameter, "length", lengthUnit),
          hubLength: toBase(hubLength, "length", lengthUnit),
          interference: toBase(interference, "length", interferenceUnit),
          frictionCoeff,
          modulus: toBase(modulus, "stress", stressUnit),
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      shaftDiameter: toBase(shaftDiameter, "length", lengthUnit),
      torque: result?.frictionTorque,
    }), [shaftDiameter, lengthUnit, result]);

  useSyncDesignInputs("shaft-hubs", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    interference: (v) => setInterference(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("shaft-hubs", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="shaft-hubs"
      title="Shaft Hub Fit"
      inputs={
        <ShaftHubInputs
          shaftDiameter={shaftDiameter}
          setShaftDiameter={setShaftDiameter}
          hubOuterDiameter={hubOuterDiameter}
          setHubOuterDiameter={setHubOuterDiameter}
          hubLength={hubLength}
          setHubLength={setHubLength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          interference={interference}
          setInterference={setInterference}
          interferenceUnit={interferenceUnit}
          setInterferenceUnit={setInterferenceUnit}
          frictionCoeff={frictionCoeff}
          setFrictionCoeff={setFrictionCoeff}
          modulus={modulus}
          setModulus={setModulus}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
        />
      }
      results={<ShaftHubResults result={result} stressUnit={stressUnit} torqueUnit={torqueUnit} />}
    />
  );
}
