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
import { getDefaultMaterialNameForProfile } from "@/lib/materials/materialProfiles";
import { STEEL_DENSITY, STEEL_YIELD } from "@/lib/materials/materialDefaults";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("flywheels");
  const [outerDiameter, setOuterDiameter] = useState(1);
  const [outerDiameterUnit, setOuterDiameterUnit] = useState("m");
  const [thickness, setThickness] = useState(0.1);
  const [thicknessUnit, setThicknessUnit] = useState("m");
  const [faceWidth, setFaceWidth] = useState(0.2);
  const [faceWidthUnit, setFaceWidthUnit] = useState("m");
  const [density, setDensity] = useState(STEEL_DENSITY);
  const [densityUnit, setDensityUnit] = useState("kg/m3");
  const [rpm, setRpm] = useState(1800);
  const [yieldStress, setYieldStress] = useState(STEEL_YIELD);
  const [yieldStressUnit, setYieldStressUnit] = useState("Pa");
  const [material, setMaterial] = useState(() => getDefaultMaterialNameForProfile("machine-shaft"));
  const handleMaterialChange = useCallback((name: string) => {
    setMaterial(name);
    if (name === CUSTOM_MATERIAL) return;
    const u = getMaterialFieldUpdates(name, "machine-shaft");
    setDensity(u.density);
    setYieldStress(u.yieldStress);
  }, []);
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
          <FlywheelInputs
            outerDiameter={outerDiameter}
            setOuterDiameter={setOuterDiameter}
            outerDiameterUnit={outerDiameterUnit}
            setOuterDiameterUnit={setOuterDiameterUnit}
            thickness={thickness}
            setThickness={setThickness}
            thicknessUnit={thicknessUnit}
            setThicknessUnit={setThicknessUnit}
            faceWidth={faceWidth}
            setFaceWidth={setFaceWidth}
            faceWidthUnit={faceWidthUnit}
            setFaceWidthUnit={setFaceWidthUnit}
            density={density}
            setDensity={setDensity}
            densityUnit={densityUnit}
            setDensityUnit={setDensityUnit}
            rpm={rpm}
            setRpm={setRpm}
            yieldStress={yieldStress}
            setYieldStress={setYieldStress}
            yieldStressUnit={yieldStressUnit}
            setYieldStressUnit={setYieldStressUnit}
            material={material}
            onMaterialChange={handleMaterialChange}
            onCalculate={calculate}
          />
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
