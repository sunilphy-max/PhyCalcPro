"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import SuspensionInputs from "@/components/dynamics/suspension/SuspensionInputs";
import SuspensionResults from "@/components/dynamics/suspension/SuspensionResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { solveSuspensionEngine } from "@/lib/dynamics/suspension/engine";
import type { SuspensionConfig, SuspensionResult } from "@/lib/dynamics/suspension/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles.suspension;

export default function Page() {
  const { wrapResult } = useStandardCalculation("suspension", (units) =>
    applyUnitMap(units, {
      sprungMass: setMassUnit,
      trackWidth: setTrackUnit,
      rollStiffness: setStiffnessUnit,
      wheelbase: setWheelbaseUnit,
      cgHeight: setHeightUnit,
    })
  );

  const [sprungMass, setSprungMass] = useState(1200);
  const [massUnit, setMassUnit] = useState(defaults.sprungMass.defaultUnit);
  const [trackWidth, setTrackWidth] = useState(1.6);
  const [trackUnit, setTrackUnit] = useState(defaults.trackWidth.defaultUnit);
  const [rollStiffness, setRollStiffness] = useState(55000);
  const [stiffnessUnit, setStiffnessUnit] = useState(defaults.rollStiffness.defaultUnit);
  const [wheelbase, setWheelbase] = useState(2.8);
  const [wheelbaseUnit, setWheelbaseUnit] = useState(defaults.wheelbase.defaultUnit);
  const [lateralAcceleration, setLateralAcceleration] = useState(0.9);
  const [cgHeight, setCgHeight] = useState(0.45);
  const [heightUnit, setHeightUnit] = useState(defaults.cgHeight.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<SuspensionResult> | null>(null);

  const calculate = () => {
    const config: SuspensionConfig = {
      sprungMass,
      trackWidth,
      rollStiffness,
      wheelbase,
      lateralAcceleration,
      cgHeight,
    };
    setResult(wrapResult(solveSuspensionEngine(config)));
  };

  return (
          <CalculatorLayout
        moduleId="suspension"
        title="Suspension Stability Calculator"
        left={
          <SuspensionInputs
            sprungMass={sprungMass}
            setSprungMass={setSprungMass}
            massUnit={massUnit}
            setMassUnit={setMassUnit}
            trackWidth={trackWidth}
            setTrackWidth={setTrackWidth}
            trackUnit={trackUnit}
            setTrackUnit={setTrackUnit}
            rollStiffness={rollStiffness}
            setRollStiffness={setRollStiffness}
            stiffnessUnit={stiffnessUnit}
            setStiffnessUnit={setStiffnessUnit}
            wheelbase={wheelbase}
            setWheelbase={setWheelbase}
            wheelbaseUnit={wheelbaseUnit}
            setWheelbaseUnit={setWheelbaseUnit}
            lateralAcceleration={lateralAcceleration}
            setLateralAcceleration={setLateralAcceleration}
            cgHeight={cgHeight}
            setCgHeight={setCgHeight}
            heightUnit={heightUnit}
            setHeightUnit={setHeightUnit}
            onCalculate={calculate}
          />
        }
        center={
          <CalculatorGuidancePanel title="Suspension overview">
            <p>
              Simple roll response model for lateral force, roll moment, and body roll from cornering acceleration.
            </p>
          </CalculatorGuidancePanel>
        }
        right={<SuspensionResults result={result} />}
      />
  );
}
