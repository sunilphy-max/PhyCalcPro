"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CircularPlatesInputs from "@/components/structural/circular-plates/CircularPlatesInputs";
import CircularPlatesResults from "@/components/structural/circular-plates/CircularPlatesResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveCircularPlateEngine } from "@/lib/structural/circular-plates/engine";
import type { CircularPlateConfig, CircularPlateResult } from "@/lib/structural/circular-plates/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("circular-plates", (units) =>
    applyUnitMap(units, {
      radius: setLengthUnit,
      thickness: setLengthUnit,
      pressure: setPressureUnit,
      modulus: setModulusUnit,
    })
  );

  const [radius, setRadius] = useState(0.5);
  const [thickness, setThickness] = useState(10);
  const [pressure, setPressure] = useState(100);
  const [modulus, setModulus] = useState(210);
  const [poisson, setPoisson] = useState(0.3);
  const [boundary, setBoundary] = useState<CircularPlateConfig["boundary"]>("simply_supported");
  const [meshSegments, setMeshSegments] = useState(12);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [pressureUnit, setPressureUnit] = useState("kPa");
  const [modulusUnit, setModulusUnit] = useState("GPa");
  const [result, setResult] = useState<(CircularPlateResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    setResult(
      wrapResult(
        solveCircularPlateEngine({
          radius: toBase(radius, "length", lengthUnit),
          thickness: toBase(thickness, "length", lengthUnit),
          pressure: toBase(pressure, "pressure", pressureUnit),
          modulus: toBase(modulus, "stress", modulusUnit),
          poisson,
          boundary,
          meshSegments,
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="circular-plates"
      title="Circular Plate"
      left={
        <CircularPlatesInputs
          radius={radius}
          setRadius={setRadius}
          thickness={thickness}
          setThickness={setThickness}
          pressure={pressure}
          setPressure={setPressure}
          modulus={modulus}
          setModulus={setModulus}
          poisson={poisson}
          setPoisson={setPoisson}
          boundary={boundary}
          setBoundary={setBoundary}
          meshSegments={meshSegments}
          setMeshSegments={setMeshSegments}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          pressureUnit={pressureUnit}
          setPressureUnit={setPressureUnit}
          modulusUnit={modulusUnit}
          setModulusUnit={setModulusUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Circular plates">
          <p>
            Classical plate theory for a solid disk under uniform lateral pressure. Clamped edges reduce
            deflection versus simply supported. Verify with FEA for annular plates, variable thickness, or
            combined loading.
          </p>
        </CalculatorGuidancePanel>
      }
      right={
        <CircularPlatesResults result={result} lengthUnit={lengthUnit} stressUnit={modulusUnit} />
      }
    />
  );
}
