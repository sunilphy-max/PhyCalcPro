"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import RollerChainsInputs from "@/components/power-transmission/roller-chains/RollerChainsInputs";
import RollerChainsResults from "@/components/power-transmission/roller-chains/RollerChainsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveRollerChainDrive } from "@/lib/powerTransmission/roller-chains/engine";
import type { RollerChainResult } from "@/lib/powerTransmission/roller-chains/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("roller-chains", (units) =>
    applyUnitMap(units, { power: setPowerUnit, pitch: setLengthUnit })
  );

  const [power, setPower] = useState(10);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speedDriver, setSpeedDriver] = useState(900);
  const [pitch, setPitch] = useState(15.875);
  const [teethDriver, setTeethDriver] = useState(19);
  const [teethDriven, setTeethDriven] = useState(57);
  const [strands, setStrands] = useState(1);
  const [serviceFactor, setServiceFactor] = useState(1.3);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(RollerChainResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    const normalizedPower = powerUnit === "kW" ? power * 1000 : powerUnit === "hp" ? power * 745.7 : power;
    setResult(
      wrapResult(
        solveRollerChainDrive({
          power: normalizedPower,
          speedDriver,
          teethDriver,
          teethDriven,
          pitch: toBase(pitch, "length", lengthUnit),
          strands,
          serviceFactor,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      power: powerUnit === "kW" ? power * 1000 : power,
      speedDriver,
      ratio: teethDriven / Math.max(teethDriver, 1),
      serviceFactor,
    }), [power, powerUnit, speedDriver, teethDriver, teethDriven, serviceFactor]);

  useSyncDesignInputs("roller-chains", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    chainPitch: (v) => setPitch(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("roller-chains", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="roller-chains"
      title="Roller Chain Drive"
      inputs={
        <RollerChainsInputs
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
          strands={strands}
          setStrands={setStrands}
          serviceFactor={serviceFactor}
          setServiceFactor={setServiceFactor}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
      }
      results={<RollerChainsResults result={result} lengthUnit={lengthUnit} powerUnit={powerUnit} />}
    />
  );
}
