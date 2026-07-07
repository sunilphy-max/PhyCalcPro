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
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";
import MotorInputs from "@/components/dynamics/motor/MotorInputs";
import MotorResults from "@/components/dynamics/motor/MotorResults";
import { toBase } from "@/lib/units/conversions";
import { solveMotorEngine } from "@/lib/dynamics/motor/engine";
import type { MotorResult, MotorServiceClass } from "@/lib/dynamics/motor/types";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { applyUnitMap } from "@/lib/units/applyUnitMap";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("motor", (units) =>
    applyUnitMap(units, { power: setPowerUnit })
  );

  const [power, setPower] = useState(7.5);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [poles, setPoles] = useState(4);
  const [lineFrequencyHz, setLineFrequencyHz] = useState<50 | 60>(60);
  const [serviceClass, setServiceClass] = useState<MotorServiceClass>("continuous");
  const [startingTorqueFactor, setStartingTorqueFactor] = useState(2);
  const [efficiency, setEfficiency] = useState(0.9);
  const [powerFactor, setPowerFactor] = useState(0.85);
  const [result, setResult] = useState<WithCalculationSpec<MotorResult> | null>(null);
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const buildConfig = useCallback(
    () => ({
      power: toBase(power, "power", powerUnit),
      poles,
      lineFrequencyHz,
      serviceClass,
      startingTorqueFactor,
      efficiency,
      powerFactor,
    }),
    [power, powerUnit, poles, lineFrequencyHz, serviceClass, startingTorqueFactor, efficiency, powerFactor]
  );

  const runCheck = useCallback(() => {
    const raw = solveMotorEngine(buildConfig());
    setResult(wrapResult(raw));

    const powerKw = toBase(power, "power", powerUnit) / 1000;
    publishHandoff("v-belts", {
      fromModuleId: "motor",
      fromTitle: "Motor Sizing",
      summary: `${powerKw.toFixed(2)} kW at ${raw.ratedSpeedRpm.toFixed(0)} rpm (${raw.frameClass}); service factor ${raw.serviceFactor.toFixed(2)} for belt drive.`,
      params: {
        power: powerKw,
        speed: raw.ratedSpeedRpm,
        serviceFactor: raw.serviceFactor,
      },
    });
    completePowerTrainStep("motor", raw.frameClass, {
      power: powerKw,
      speed: raw.ratedSpeedRpm,
      serviceFactor: raw.serviceFactor,
    });
  }, [buildConfig, power, powerUnit, wrapResult, completePowerTrainStep]);

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      power: toBase(power, "power", powerUnit),
      speedDriver: poles,
      lineFrequencyHz,
      serviceClass,
      serviceFactor: startingTorqueFactor,
      efficiency,
      powerFactor,
    }),
    [power, powerUnit, poles, lineFrequencyHz, serviceClass, startingTorqueFactor, efficiency, powerFactor]
  );

  useSyncDesignInputs("motor", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    poles: (v) => setPoles(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("motor", designUserInputs);
      if (design?.best?.fields?.poles != null) {
        applyDesignFields(design.best.fields);
      }
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="motor"
      title="Motor Sizing"
      inputs={
        <MotorInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          poles={poles}
          setPoles={setPoles}
          lineFrequencyHz={lineFrequencyHz}
          setLineFrequencyHz={setLineFrequencyHz}
          serviceClass={serviceClass}
          setServiceClass={setServiceClass}
          startingTorqueFactor={startingTorqueFactor}
          setStartingTorqueFactor={setStartingTorqueFactor}
          efficiency={efficiency}
          setEfficiency={setEfficiency}
          powerFactor={powerFactor}
          setPowerFactor={setPowerFactor}
          onCalculate={calculate}
        />
      }
      results={<MotorResults result={result} />}
    />
  );
}
