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
import type { WeldResult, WeldType } from "@/lib/fasteners/welds/types";
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { resolveMaterial, toWeldMaterial } from "@/lib/materials/materialCatalogService";

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
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("weld-base"));
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
      material: toWeldMaterial(resolveMaterial(material, "weld-base")),
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
          <WeldInputs
            weldType={weldType}
            setWeldType={setWeldType}
            weldSize={weldSize}
            setWeldSize={setWeldSize}
            weldSizeUnit={weldSizeUnit}
            setWeldSizeUnit={setWeldSizeUnit}
            weldLength={weldLength}
            setWeldLength={setWeldLength}
            weldLengthUnit={weldLengthUnit}
            setWeldLengthUnit={setWeldLengthUnit}
            weldCount={weldCount}
            setWeldCount={setWeldCount}
            shearForce={shearForce}
            setShearForce={setShearForce}
            shearForceUnit={shearForceUnit}
            setShearForceUnit={setShearForceUnit}
            axialForce={axialForce}
            setAxialForce={setAxialForce}
            axialForceUnit={axialForceUnit}
            setAxialForceUnit={setAxialForceUnit}
            eccentricity={eccentricity}
            setEccentricity={setEccentricity}
            eccentricityUnit={eccentricityUnit}
            setEccentricityUnit={setEccentricityUnit}
            material={material}
            setMaterial={setMaterial}
            onCalculate={calculate}
          />
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
