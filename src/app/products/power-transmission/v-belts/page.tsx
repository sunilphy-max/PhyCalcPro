"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import VBeltsInputs from "@/components/power-transmission/v-belts/VBeltsInputs";
import VBeltsResults from "@/components/power-transmission/v-belts/VBeltsResults";
import { solveVBeltDrive } from "@/lib/powerTransmission/v-belts/engine";
import type { VBeltResult } from "@/lib/powerTransmission/v-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("v-belts", (units) =>
    applyUnitMap(units, {
      power: setPowerUnit,
      diameter: setLengthUnit,
      centerDistance: setLengthUnit,
    })
  );

  const [power, setPower] = useState(15);
  const [powerUnit, setPowerUnit] = useState("kW");
  const [speedDriver, setSpeedDriver] = useState(1450);
  const [diameterDriver, setDiameterDriver] = useState(150);
  const [diameterDriven, setDiameterDriven] = useState(300);
  const [centerDistance, setCenterDistance] = useState(500);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [serviceFactor, setServiceFactor] = useState(1.2);
  const [result, setResult] = useState<(VBeltResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    const normalizedPower = powerUnit === "kW" ? power * 1000 : power;
    setResult(
      wrapResult(
        solveVBeltDrive({
          power: normalizedPower / 1000,
          speedDriver,
          diameterDriver: toBase(diameterDriver, "length", lengthUnit),
          diameterDriven: toBase(diameterDriven, "length", lengthUnit),
          centerDistance: toBase(centerDistance, "length", lengthUnit),
          serviceFactor,
          beltFactor: 0.18,
          frictionCoeff: 0.5,
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="v-belts"
      title="V-Belt Drive"
      left={
        <VBeltsInputs
          power={power}
          setPower={setPower}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          speedDriver={speedDriver}
          setSpeedDriver={setSpeedDriver}
          diameterDriver={diameterDriver}
          setDiameterDriver={setDiameterDriver}
          diameterDriven={diameterDriven}
          setDiameterDriven={setDiameterDriven}
          centerDistance={centerDistance}
          setCenterDistance={setCenterDistance}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          serviceFactor={serviceFactor}
          setServiceFactor={setServiceFactor}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="V-belt drives">
          <p>
            Use standard groove profiles and manufacturer power ratings to confirm selection. Increase center distance
            when wrap angle on the small pulley drops below about 120°.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<VBeltsResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
