"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import TimingBeltsInputs from "@/components/power-transmission/timing-belts/TimingBeltsInputs";
import TimingBeltsResults from "@/components/power-transmission/timing-belts/TimingBeltsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveTimingBeltDrive } from "@/lib/powerTransmission/timing-belts/engine";
import type { TimingBeltResult } from "@/lib/powerTransmission/timing-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode, userInputs: workflowUserInputs } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("timing-belts", (units) =>
    applyUnitMap(units, { power: setPowerUnit, pitch: setLengthUnit })
  );

  const [power, setPower] = useState(5);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speedDriver, setSpeedDriver] = useState(1200);
  const [pitch, setPitch] = useState(5);
  const [teethDriver, setTeethDriver] = useState(24);
  const [teethDriven, setTeethDriven] = useState(48);
  const [beltWidth, setBeltWidth] = useState(20);
  const [serviceFactor, setServiceFactor] = useState(1.2);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(TimingBeltResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    const normalizedPower = powerUnit === "kW" ? power * 1000 : powerUnit === "hp" ? power * 745.7 : power;
    setResult(
      wrapResult(
        solveTimingBeltDrive({
          power: normalizedPower,
          speedDriver,
          pitch: toBase(pitch, "length", lengthUnit),
          teethDriver,
          teethDriven,
          beltWidth: toBase(beltWidth, "length", lengthUnit),
          serviceFactor,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      power: powerUnit === "kW" ? power * 1000 : powerUnit === "hp" ? power * 745.7 : power,
      speedDriver,
      ratio: teethDriven / Math.max(teethDriver, 1),
      serviceFactor,
    }), [power, powerUnit, speedDriver, teethDriver, teethDriven, serviceFactor]);

  useSyncDesignInputs("timing-belts", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    pitch: (v) => setPitch(typeof v === "number" ? v : Number(v)),
    teethDriver: (v) => setTeethDriver(typeof v === "number" ? v : Number(v)),
    teethDriven: (v) => setTeethDriven(typeof v === "number" ? v : Number(v)),
    beltWidth: (v) => setBeltWidth(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("timing-belts", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="timing-belts"
      title="Timing Belt Drive"
      inputs={
        <div className="space-y-4">
          <TimingBeltsInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speedDriver={speedDriver}
          setSpeedDriver={setSpeedDriver}
          pitch={pitch}
          setPitch={setPitch}
          teethDriver={teethDriver}
          setTeethDriver={setTeethDriver}
          teethDriven={teethDriven}
          setTeethDriven={setTeethDriven}
          beltWidth={beltWidth}
          setBeltWidth={setBeltWidth}
          serviceFactor={serviceFactor}
          setServiceFactor={setServiceFactor}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
        </div>
      }
      results={<TimingBeltsResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
