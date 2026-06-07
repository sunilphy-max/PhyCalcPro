"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import FlywheelInputs from "@/components/machine/flywheels/FlywheelInputs";
import FlywheelResults from "@/components/machine/flywheels/FlywheelResults";
import { toBase } from "@/lib/units/conversions";
import { solveFlywheelEngine } from "@/lib/machine/flywheels/engine";
import type { FlywheelResult } from "@/lib/machine/flywheels/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("flywheels");
  const [outerDiameter, setOuterDiameter] = useState(1);
  const [outerDiameterUnit, setOuterDiameterUnit] = useState("m");
  const [thickness, setThickness] = useState(0.1);
  const [thicknessUnit, setThicknessUnit] = useState("m");
  const [faceWidth, setFaceWidth] = useState(0.2);
  const [faceWidthUnit, setFaceWidthUnit] = useState("m");
  const [density, setDensity] = useState(7850);
  const [densityUnit, setDensityUnit] = useState("kg/m3");
  const [rpm, setRpm] = useState(1800);
  const [yieldStress, setYieldStress] = useState(250e6);
  const [yieldStressUnit, setYieldStressUnit] = useState("Pa");
  const [result, setResult] = useState<FlywheelResult | null>(null);

  const runCheck = () => {
    const config = {
      outerDiameter: toBase(outerDiameter, "length", outerDiameterUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      faceWidth: toBase(faceWidth, "length", faceWidthUnit),
      density: toBase(density, "density", densityUnit),
      rpm,
      yieldStress: toBase(yieldStress, "stress", yieldStressUnit),
    };

    setResult(wrapResult(solveFlywheelEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      speedDriver: rpm,
      energy: 5000,
    }), [rpm]);

  useSyncDesignInputs("flywheels", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    outerDiameter: (v) => setOuterDiameter(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("flywheels", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="flywheels"
        title="Flywheel Energy & Stress"
        inputs={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Flywheel design guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Optimize rim mass and rotational speed to store energy while keeping hoop stress below material limits.
              </p>
            </div>
          </div>
        }
        results={
          <FlywheelResults
            result={result}
            lengthUnit={outerDiameterUnit}
            densityUnit={densityUnit}
            stressUnit={yieldStressUnit}
          />
        }
      />
  );
}
