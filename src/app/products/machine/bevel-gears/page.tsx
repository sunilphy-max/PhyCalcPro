"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import BevelGearsInputs from "@/components/machine/bevel-gears/BevelGearsInputs";
import BevelGearsResults from "@/components/machine/bevel-gears/BevelGearsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveBevelGearEngine } from "@/lib/machine/bevel-gears/engine";
import type { BevelGearResult } from "@/lib/machine/bevel-gears/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("bevel-gears", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      module: setLengthUnit,
      faceWidth: setLengthUnit,
      stress: setStressUnit,
    })
  );

  const [power, setPower] = useState(10);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speed, setSpeed] = useState(1200);
  const [pinionTeeth, setPinionTeeth] = useState(20);
  const [gearRatio, setGearRatio] = useState(3);
  const [module, setModule] = useState(4);
  const [faceWidth, setFaceWidth] = useState(30);
  const [yieldStress, setYieldStress] = useState(250);
  const [pressureAngleDeg, setPressureAngleDeg] = useState(20);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<(BevelGearResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    const normalizedPower =
      powerUnit === "kW" ? power * 1000 : powerUnit === "hp" ? power * 745.7 : power;
    setResult(
      wrapResult(
        solveBevelGearEngine({
          power: normalizedPower,
          speed,
          pinionTeeth,
          gearRatio,
          module: toBase(module, "length", lengthUnit),
          faceWidth: toBase(faceWidth, "length", lengthUnit),
          yieldStress: toBase(yieldStress, "stress", stressUnit),
          pressureAngleDeg,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      power: powerUnit === "kW" ? power * 1000 : power,
      speedDriver: speed,
      ratio: gearRatio,
      pinionTeeth,
    }), [power, powerUnit, speed, gearRatio, pinionTeeth]);

  useSyncDesignInputs("bevel-gears", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("bevel-gears", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="bevel-gears"
      title="Bevel Gear Screening"
      left={
        <BevelGearsInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speed={speed}
          setSpeed={setSpeed}
          pinionTeeth={pinionTeeth}
          setPinionTeeth={setPinionTeeth}
          gearRatio={gearRatio}
          setGearRatio={setGearRatio}
          module={module}
          setModule={setModule}
          faceWidth={faceWidth}
          setFaceWidth={setFaceWidth}
          yieldStress={yieldStress}
          setYieldStress={setYieldStress}
          pressureAngleDeg={pressureAngleDeg}
          setPressureAngleDeg={setPressureAngleDeg}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Bevel gear screening">
          <p>
            Indicative Lewis bending and Hertz contact screening for straight bevel pinions. Confirm cone geometry,
            mounting, and manufacturer ratings before final design.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<BevelGearsResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />}
    />
  );
}
