"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";
import HousingInputs from "@/components/machine/housing/HousingInputs";
import HousingResults from "@/components/machine/housing/HousingResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveHousingEngine } from "@/lib/machine/housing/engine";
import type { HousingMountStyle, HousingResult } from "@/lib/machine/housing/types";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { applyUnitMap } from "@/lib/units/applyUnitMap";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("housing", (units) =>
    applyUnitMap(units, {
      boreDiameter: setLengthUnit,
      radialLoad: setForceUnit,
      axialLoad: setForceUnit,
      boltCircleDiameter: setLengthUnit,
      yieldStress: setStressUnit,
    })
  );

  const [boreDiameter, setBoreDiameter] = useState(40);
  const [radialLoad, setRadialLoad] = useState(5000);
  const [axialLoad, setAxialLoad] = useState(500);
  const [speed, setSpeed] = useState(1500);
  const [mountStyle, setMountStyle] = useState<HousingMountStyle>("pillow_block");
  const [boltCount, setBoltCount] = useState(4);
  const [boltCircleDiameter, setBoltCircleDiameter] = useState(120);
  const [yieldStress, setYieldStress] = useState(250);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [forceUnit, setForceUnit] = useState("N");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<WithCalculationSpec<HousingResult> | null>(null);
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const buildConfig = useCallback(
    () => ({
      boreDiameter: toBase(boreDiameter, "length", lengthUnit),
      radialLoad: toBase(radialLoad, "force", forceUnit),
      axialLoad: toBase(axialLoad, "force", forceUnit),
      speed,
      mountStyle,
      boltCount: Math.max(2, Math.round(boltCount)),
      boltCircleDiameter: toBase(boltCircleDiameter, "length", lengthUnit),
      yieldStress: toBase(yieldStress, "stress", stressUnit),
    }),
    [
      boreDiameter,
      radialLoad,
      axialLoad,
      speed,
      mountStyle,
      boltCount,
      boltCircleDiameter,
      yieldStress,
      lengthUnit,
      forceUnit,
      stressUnit,
    ]
  );

  const runCheck = useCallback(() => {
    const raw = solveHousingEngine(buildConfig());
    setResult(wrapResult(raw));

    publishHandoff("bolts", {
      fromModuleId: "housing",
      fromTitle: "Bearing Housing",
      summary: `Mounting bolts: tension ≈ ${(raw.boltTensionPerBolt / 1000).toFixed(2)} kN, shear ≈ ${(raw.boltShearPerBolt / 1000).toFixed(2)} kN per bolt (${boltCount} bolts, ${raw.recommendedBoltSize}).`,
      params: {
        tension: raw.boltTensionPerBolt,
        shear: raw.boltShearPerBolt,
        boltCount,
        patternDiameter: toBase(boltCircleDiameter, "length", lengthUnit),
      },
    });
    completePowerTrainStep("housing", raw.recommendedBoltSize, {
      tension: raw.boltTensionPerBolt,
      shear: raw.boltShearPerBolt,
      boltCount,
    });
  }, [buildConfig, boltCount, boltCircleDiameter, lengthUnit, wrapResult, completePowerTrainStep]);

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      diameter: toBase(boreDiameter, "length", lengthUnit),
      maxForce: toBase(radialLoad, "force", forceUnit),
      axialLoad: toBase(axialLoad, "force", forceUnit),
      rpm: speed,
    }),
    [boreDiameter, lengthUnit, radialLoad, forceUnit, axialLoad, speed]
  );

  useSyncDesignInputs("housing", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    boltCount: (v) => setBoltCount(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("housing", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="housing"
      title="Bearing Housing"
      inputs={
        <div className="space-y-4">
          <CrossCalcHandoffBanner
            moduleId="housing"
            onApply={(params) => {
              if (params.boreMm != null) {
                setBoreDiameter(fromBase(params.boreMm, "length", lengthUnit));
              }
              if (params.shaftDiameter != null) {
                setBoreDiameter(fromBase(params.shaftDiameter, "length", lengthUnit));
              }
              if (params.radialLoad != null) {
                setRadialLoad(fromBase(params.radialLoad, "force", forceUnit));
              }
              if (params.axialLoad != null) {
                setAxialLoad(fromBase(params.axialLoad, "force", forceUnit));
              }
              if (params.speed != null) setSpeed(params.speed);
            }}
          />
          <HousingInputs
            boreDiameter={boreDiameter}
            setBoreDiameter={setBoreDiameter}
            radialLoad={radialLoad}
            setRadialLoad={setRadialLoad}
            axialLoad={axialLoad}
            setAxialLoad={setAxialLoad}
            speed={speed}
            setSpeed={setSpeed}
            mountStyle={mountStyle}
            setMountStyle={setMountStyle}
            boltCount={boltCount}
            setBoltCount={setBoltCount}
            boltCircleDiameter={boltCircleDiameter}
            setBoltCircleDiameter={setBoltCircleDiameter}
            yieldStress={yieldStress}
            setYieldStress={setYieldStress}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            forceUnit={forceUnit}
            setForceUnit={setForceUnit}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            onCalculate={calculate}
          />
        </div>
      }
      results={<HousingResults result={result} />}
    />
  );
}
