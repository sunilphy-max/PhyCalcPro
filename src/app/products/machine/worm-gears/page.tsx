"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import WormGearsInputs from "@/components/machine/worm-gears/WormGearsInputs";
import WormGearsResults from "@/components/machine/worm-gears/WormGearsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveWormGearEngine } from "@/lib/machine/worm-gears/engine";
import type { WormGearResult } from "@/lib/machine/worm-gears/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("worm-gears", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      module: setLengthUnit,
      faceWidth: setLengthUnit,
      stress: setStressUnit,
    })
  );

  const [power, setPower] = useState(5);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speed, setSpeed] = useState(1450);
  const [wormStarts, setWormStarts] = useState(2);
  const [gearTeeth, setGearTeeth] = useState(40);
  const [module, setModule] = useState(4);
  const [faceWidth, setFaceWidth] = useState(50);
  const [frictionCoeff, setFrictionCoeff] = useState(0.05);
  const [leadAngleDeg, setLeadAngleDeg] = useState(5);
  const [yieldStress, setYieldStress] = useState(250);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<(WormGearResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    const normalizedPower =
      powerUnit === "kW" ? power * 1000 : powerUnit === "hp" ? power * 745.7 : power;
    setResult(
      wrapResult(
        solveWormGearEngine({
          power: normalizedPower,
          speed,
          wormStarts,
          gearTeeth,
          module: toBase(module, "length", lengthUnit),
          faceWidth: toBase(faceWidth, "length", lengthUnit),
          frictionCoeff,
          leadAngleDeg,
          yieldStress: toBase(yieldStress, "stress", stressUnit),
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="worm-gears"
      title="Worm Gear Drive"
      left={
        <WormGearsInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speed={speed}
          setSpeed={setSpeed}
          wormStarts={wormStarts}
          setWormStarts={setWormStarts}
          gearTeeth={gearTeeth}
          setGearTeeth={setGearTeeth}
          module={module}
          setModule={setModule}
          faceWidth={faceWidth}
          setFaceWidth={setFaceWidth}
          frictionCoeff={frictionCoeff}
          setFrictionCoeff={setFrictionCoeff}
          leadAngleDeg={leadAngleDeg}
          setLeadAngleDeg={setLeadAngleDeg}
          yieldStress={yieldStress}
          setYieldStress={setYieldStress}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Worm gear drives">
          <p>
            Worm sets offer high reduction but lower efficiency at small lead angles. Check heat dissipation and
            manufacturer contact ratings for continuous duty.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<WormGearsResults result={result} stressUnit={stressUnit} />}
    />
  );
}
