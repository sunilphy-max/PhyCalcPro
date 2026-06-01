"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CompressionSpringInputs from "@/components/springs/compression-springs/CompressionSpringInputs";
import CompressionSpringResults from "@/components/springs/compression-springs/CompressionSpringResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveCompressionSpringEngine } from "@/lib/springs/compression-springs/engine";
import type { CompressionSpringResult } from "@/lib/springs/compression-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("compression-springs", (units) =>
    applyUnitMap(units, {
      wireDiameter: setLengthUnit,
      meanDiameter: setLengthUnit,
      freeLength: setLengthUnit,
      deflection: setLengthUnit,
      modulus: setStressUnit,
      stress: setStressUnit,
    })
  );

  const [wireDiameter, setWireDiameter] = useState(2);
  const [meanDiameter, setMeanDiameter] = useState(20);
  const [activeCoils, setActiveCoils] = useState(8);
  const [freeLength, setFreeLength] = useState(50);
  const [deflection, setDeflection] = useState(10);
  const [modulus, setModulus] = useState(81);
  const [ultimateStrength, setUltimateStrength] = useState(1400);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [result, setResult] = useState<(CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const calculate = () => {
    setResult(
      wrapResult(
        solveCompressionSpringEngine({
          wireDiameter: toBase(wireDiameter, "length", lengthUnit),
          meanDiameter: toBase(meanDiameter, "length", lengthUnit),
          activeCoils,
          freeLength: toBase(freeLength, "length", lengthUnit),
          deflection: toBase(deflection, "length", lengthUnit),
          modulus: toBase(modulus, "stress", stressUnit),
          ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
        })
      )
    );
  };

  return (
    <CalculatorLayout
      moduleId="compression-springs"
      title="Compression Spring"
      left={
        <CompressionSpringInputs
          wireDiameter={wireDiameter}
          setWireDiameter={setWireDiameter}
          meanDiameter={meanDiameter}
          setMeanDiameter={setMeanDiameter}
          activeCoils={activeCoils}
          setActiveCoils={setActiveCoils}
          freeLength={freeLength}
          setFreeLength={setFreeLength}
          deflection={deflection}
          setDeflection={setDeflection}
          modulus={modulus}
          setModulus={setModulus}
          ultimateStrength={ultimateStrength}
          setUltimateStrength={setUltimateStrength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Compression springs">
          <p>
            Uses Wahl correction for shear stress. Verify solid height clearance and buckling for slender
            springs (L0/D &gt; 4). Rate k = Gd⁴/(8D³n).
          </p>
        </CalculatorGuidancePanel>
      }
      right={
        <CompressionSpringResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />
      }
    />
  );
}
