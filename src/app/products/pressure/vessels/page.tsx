"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import PressureVesselInputs from "@/components/pressure/vessels/PressureVesselInputs";
import PressureVesselResults from "@/components/pressure/vessels/PressureVesselResults";
import { toBase } from "@/lib/units/conversions";
import { solvePressureVesselEngine } from "@/lib/pressure/vessels/engine";
import type { PressureVesselResult } from "@/lib/pressure/vessels/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("vessels");
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
  const [result, setResult] = useState<PressureVesselResult | null>(null);

  const calculate = () => {
    const config = {
      radius: toBase(radius, "length", radiusUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      length: toBase(length, "length", lengthUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      E: toBase(E, "stress", EUnit),
      A: toBase(thickness, "length", thicknessUnit) * toBase(length, "length", lengthUnit),
      segments: Math.max(8, Math.round(segments)),
    };

    setResult(wrapResult(solvePressureVesselEngine(config)));
  };

  return (
    <CalculatorLayout
      moduleId="vessels"
      title="Pressure Vessel Analysis"
      inputs={
        <PressureVesselInputs
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
      results={<PressureVesselResults result={result} />}
    />
  );
}
