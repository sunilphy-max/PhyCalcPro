"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import WeldInputs from "@/components/fasteners/welds/WeldInputs";
import WeldResults from "@/components/fasteners/welds/WeldResults";
import { toBase } from "@/lib/units/conversions";
import { solveWeldEngine } from "@/lib/fasteners/welds/engine";
import type { WeldResult, WeldType, WeldMaterial } from "@/lib/fasteners/welds/types";

const MATERIALS: Record<string, WeldMaterial> = {
  Steel: {
    name: "Steel",
    strength: 250e6,
    yieldStress: 250e6,
  },
  Stainless: {
    name: "Stainless",
    strength: 210e6,
    yieldStress: 210e6,
  },
  Aluminum: {
    name: "Aluminum",
    strength: 150e6,
    yieldStress: 150e6,
  },
};

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("welds", (units) =>
    applyUnitMap(units, { length: setWeldLengthUnit, force: setShearForceUnit })
  );
  const [weldType, setWeldType] = useState<WeldType>("fillet");
  const [weldSize, setWeldSize] = useState(0.01);
  const [weldSizeUnit, setWeldSizeUnit] = useState("m");
  const [weldLength, setWeldLength] = useState(0.2);
  const [weldLengthUnit, setWeldLengthUnit] = useState("m");
  const [weldCount, setWeldCount] = useState(4);
  const [shearForce, setShearForce] = useState(15000);
  const [shearForceUnit, setShearForceUnit] = useState("N");
  const [axialForce, setAxialForce] = useState(5000);
  const [axialForceUnit, setAxialForceUnit] = useState("N");
  const [eccentricity, setEccentricity] = useState(0.05);
  const [eccentricityUnit, setEccentricityUnit] = useState("m");
  const [material, setMaterial] = useState("Steel");
  const [result, setResult] = useState<WeldResult | null>(null);

  const runCheck = () => {
    const config = {
      weldType,
      weldSize: toBase(weldSize, "length", weldSizeUnit),
      weldLength: toBase(weldLength, "length", weldLengthUnit),
      weldCount: Math.max(1, Math.round(weldCount)),
      shearForce: toBase(shearForce, "force", shearForceUnit),
      axialForce: toBase(axialForce, "force", axialForceUnit),
      eccentricity: toBase(eccentricity, "length", eccentricityUnit),
      material: MATERIALS[material] || MATERIALS.Steel,
    };

    setResult(wrapResult(solveWeldEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      shearForce: toBase(shearForce, "force", shearForceUnit),
      axialLoad: toBase(axialForce, "force", axialForceUnit),
      length: toBase(weldLength, "length", weldLengthUnit),
      weldCount,
      eccentricity: toBase(eccentricity, "length", eccentricityUnit),
    }), [shearForce, shearForceUnit, axialForce, axialForceUnit, weldLength, weldLengthUnit, weldCount, eccentricity, eccentricityUnit]);

  useSyncDesignInputs("welds", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    weldSize: (v) => setWeldSize(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("welds", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="welds"
        title="Weld Strength Evaluation"
        inputs={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Weld design guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Use throat area and weld count to evaluate shear, axial, and resultant stresses on the weld group.
              </p>
            </div>
          </div>
        }
        results={
          <WeldResults
            result={result}
            lengthUnit={weldSizeUnit}
            forceUnit={shearForceUnit}
            stressUnit="Pa"
          />
        }
      />
  );
}
