"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import PlanetaryGearsInputs from "@/components/machine/planetary-gears/PlanetaryGearsInputs";
import PlanetaryGearsResults from "@/components/machine/planetary-gears/PlanetaryGearsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solvePlanetaryGearEngine } from "@/lib/machine/planetary-gears/engine";
import type { PlanetaryGearResult } from "@/lib/machine/planetary-gears/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("planetary-gears", (units) =>
    applyUnitMap(units, {
      module: setLengthUnit,
      power: setPowerUnit,
    })
  );

  const [sunTeeth, setSunTeeth] = useState(20);
  const [planetTeeth, setPlanetTeeth] = useState(18);
  const [targetRatio, setTargetRatio] = useState(5);
  const [module, setModule] = useState(3);
  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speed, setSpeed] = useState(1500);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(PlanetaryGearResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    const normalizedPower =
      powerUnit === "kW" ? power * 1000 : powerUnit === "hp" ? power * 745.7 : power;
    setResult(
      wrapResult(
        solvePlanetaryGearEngine({
          sunTeeth,
          planetTeeth,
          targetRatio,
          module: toBase(module, "length", lengthUnit),
          power: normalizedPower,
          speed,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      power: powerUnit === "kW" ? power * 1000 : power,
      speedDriver: speed,
      ratio: targetRatio,
    }), [power, powerUnit, speed, targetRatio]);

  useSyncDesignInputs("planetary-gears", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("planetary-gears", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="planetary-gears"
      title="Planetary Gear Set"
      left={
        <PlanetaryGearsInputs
          sunTeeth={sunTeeth}
          setSunTeeth={setSunTeeth}
          planetTeeth={planetTeeth}
          setPlanetTeeth={setPlanetTeeth}
          targetRatio={targetRatio}
          setTargetRatio={setTargetRatio}
          module={module}
          setModule={setModule}
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speed={speed}
          setSpeed={setSpeed}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Planetary gear sets">
          <p>
            Ring teeth follow z<sub>r</sub> = z<sub>s</sub> + 2z<sub>p</sub>. Verify equal planet spacing and
            assembly constraints; adjust planet count for packaging.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<PlanetaryGearsResults result={result} lengthUnit={lengthUnit} targetRatio={targetRatio} />}
    />
  );
}
