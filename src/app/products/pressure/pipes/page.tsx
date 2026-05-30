"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import PressurePipeInputs from "@/components/pressure/pipes/PressurePipeInputs";
import PressurePipeResults from "@/components/pressure/pipes/PressurePipeResults";
import { toBase } from "@/lib/units/conversions";
import { solvePressurePipeEngine } from "@/lib/pressure/pipes/engine";
import type { PressurePipeResult } from "@/lib/pressure/pipes/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("pipes", (units) =>
    applyUnitMap(units, {
      radius: setRadiusUnit,
      thickness: setThicknessUnit,
      length: setLengthUnit,
      pressure: setPressureUnit,
      modulus: setEUnit,
    })
  );
  const [radius, setRadius] = useState(0.5);
  const [radiusUnit, setRadiusUnit] = useState("m");
  const [thickness, setThickness] = useState(0.02);
  const [thicknessUnit, setThicknessUnit] = useState("m");
  const [length, setLength] = useState(3);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [pressure, setPressure] = useState(1e6);
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [E, setE] = useState(210e9);
  const [EUnit, setEUnit] = useState("Pa");
  const [segments, setSegments] = useState(40);
  const [result, setResult] = useState<PressurePipeResult | null>(null);

  const calculate = () => {
    const config = {
      radius: toBase(radius, "length", radiusUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      length: toBase(length, "length", lengthUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      E: toBase(E, "stress", EUnit),
      segments: Math.max(8, Math.round(segments)),
    };

    setResult(wrapResult(solvePressurePipeEngine(config)));
  };

  return (
    <CalculatorLayout
      moduleId="pipes"
      title="Pressure Pipe Analysis"
      inputs={
        <PressurePipeInputs
            radius={radius}
            setRadius={setRadius}
            radiusUnit={radiusUnit}
            setRadiusUnit={setRadiusUnit}
            thickness={thickness}
            setThickness={setThickness}
            thicknessUnit={thicknessUnit}
            setThicknessUnit={setThicknessUnit}
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            pressure={pressure}
            setPressure={setPressure}
            pressureUnit={pressureUnit}
            setPressureUnit={setPressureUnit}
            E={E}
            setE={setE}
            EUnit={EUnit}
            setEUnit={setEUnit}
            segments={segments}
            setSegments={setSegments}
          onCalculate={calculate}
        />
      }
      results={<PressurePipeResults result={result} />}
    />
  );
}
