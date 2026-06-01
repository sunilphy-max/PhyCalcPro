"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import TimingBeltsInputs from "@/components/power-transmission/timing-belts/TimingBeltsInputs";
import TimingBeltsResults from "@/components/power-transmission/timing-belts/TimingBeltsResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveTimingBeltDrive } from "@/lib/powerTransmission/timing-belts/engine";
import type { TimingBeltResult } from "@/lib/powerTransmission/timing-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
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

  const calculate = () => {
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

  return (
    <CalculatorLayout
      moduleId="timing-belts"
      title="Timing Belt Drive"
      left={
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
      }
      center={
        <CalculatorGuidancePanel title="Timing belt drives">
          <p>
            Synchronous belts eliminate slip. Confirm manufacturer tooth rating and minimum pulley teeth for
            the selected pitch profile.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<TimingBeltsResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
