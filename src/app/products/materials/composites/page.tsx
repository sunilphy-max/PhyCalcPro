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
import CompositeInputs from "@/components/materials/composites/CompositeInputs";
import CompositeResults from "@/components/materials/composites/CompositeResults";
import { toBase } from "@/lib/units/conversions";
import { solveCompositeEngine } from "@/lib/materials/composites/engine";
import type { CompositeResult } from "@/lib/materials/composites/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("composites");
  const [fiberVolumeFraction, setFiberVolumeFraction] = useState(0.6);
  const [fiberModulus, setFiberModulus] = useState(230e9);
  const [matrixModulus, setMatrixModulus] = useState(3.5e9);
  const [fiberStrength, setFiberStrength] = useState(3500e6);
  const [matrixStrength, setMatrixStrength] = useState(80e6);
  const [fiberDensity, setFiberDensity] = useState(1800);
  const [matrixDensity, setMatrixDensity] = useState(1200);
  const [fiberPoisson, setFiberPoisson] = useState(0.2);
  const [matrixPoisson, setMatrixPoisson] = useState(0.35);
  const [stressUnit, setStressUnit] = useState("Pa");
  const [densityUnit, setDensityUnit] = useState("kg/m3");
  const [result, setResult] = useState<CompositeResult | null>(null);

  const runCheck = () => {
    const config = {
      fiberVolumeFraction,
      fiberModulus: toBase(fiberModulus, "stress", stressUnit),
      matrixModulus: toBase(matrixModulus, "stress", stressUnit),
      fiberStrength: toBase(fiberStrength, "stress", stressUnit),
      matrixStrength: toBase(matrixStrength, "stress", stressUnit),
      fiberDensity: toBase(fiberDensity, "density", densityUnit),
      matrixDensity: toBase(matrixDensity, "density", densityUnit),
      fiberPoisson,
      matrixPoisson,
    };

    setResult(wrapResult(solveCompositeEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      requiredStrength: fiberStrength,
    }), [fiberStrength]);

  useSyncDesignInputs("composites", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    plyCount: (v) => setFiberVolumeFraction(Math.min(0.7, Math.max(0.2, Number(v) / 20))),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("composites", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="composites"
        title="Composite Property Calculator"
        inputs={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Composite design overview</h3>
              <p className="text-sm text-slate-500 mt-1">
                Use fiber and matrix properties to estimate longitudinal and transverse composite performance.
              </p>
            </div>
          </div>
        }
        results={
          <CompositeResults
            result={result}
            stressUnit={stressUnit}
            densityUnit={densityUnit}
          />
        }
      />
  );
}
