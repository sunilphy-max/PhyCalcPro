"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import HydraulicsInputs from "@/components/pressure/hydraulics/HydraulicsInputs";
import HydraulicsResults from "@/components/pressure/hydraulics/HydraulicsResults";
import { toBase } from "@/lib/units/conversions";
import { solveHydraulicsEngine } from "@/lib/pressure/hydraulics/engine";
import type { HydraulicsResult } from "@/lib/pressure/hydraulics/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("hydraulics");
  const [boreDiameter, setBoreDiameter] = useState(0.1);
  const [rodDiameter, setRodDiameter] = useState(0.04);
  const [strokeLength, setStrokeLength] = useState(0.5);
  const [boreUnit, setBoreUnit] = useState("m");
  const [strokeUnit, setStrokeUnit] = useState("m");
  const [pressure, setPressure] = useState(10e6);
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [forceGoal, setForceGoal] = useState(50000);
  const [forceUnit, setForceUnit] = useState("N");
  const [result, setResult] = useState<HydraulicsResult | null>(null);

  const runCheck = () => {
    const config = {
      boreDiameter: toBase(boreDiameter, "length", boreUnit),
      rodDiameter: toBase(rodDiameter, "length", boreUnit),
      strokeLength: toBase(strokeLength, "length", strokeUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      forceGoal: toBase(forceGoal, "force", forceUnit),
    };

    setResult(wrapResult(solveHydraulicsEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      pressure: toBase(pressure, "pressure", pressureUnit),
      maxForce: toBase(forceGoal, "force", forceUnit),
    }), [pressure, pressureUnit, forceGoal, forceUnit]);

  useSyncDesignInputs("hydraulics", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    bore: (v) => setBoreDiameter(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("hydraulics", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="hydraulics"
        title="Hydraulic Actuator Sizing"
        inputs={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Hydraulics module</h3>
              <p className="text-sm text-slate-500 mt-1">
                Estimate piston and rod loads, annulus retract force, and cylinder volume requirement.
              </p>
            </div>
          </div>
        }
        results={
          <HydraulicsResults
            result={result}
            lengthUnit={boreUnit}
            pressureUnit={pressureUnit}
            forceUnit={forceUnit}
          />
        }
      />
  );
}
