"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import WeldInputs from "@/components/fasteners/welds/WeldInputs";
import WeldResults from "@/components/fasteners/welds/WeldResults";
import { toBase } from "@/lib/units/conversions";
import { solveWeldEngine } from "@/lib/fasteners/welds/engine";
import type { WeldResult, WeldType, WeldMaterial } from "@/lib/fasteners/welds/types";

const MATERIALS: Record<string, WeldMaterial> = {
  Steel: {
    name: "Steel",
    strength: 250e6,
    yieldStress: 250e6,
  },
  Stainless: {
    name: "Stainless",
    strength: 210e6,
    yieldStress: 210e6,
  },
  Aluminum: {
    name: "Aluminum",
    strength: 150e6,
    yieldStress: 150e6,
  },
};

export default function Page() {
  const { wrapResult } = useStandardCalculation("welds", (units) =>
    applyUnitMap(units, { length: setWeldLengthUnit, force: setShearForceUnit })
  );
  const [weldType, setWeldType] = useState<WeldType>("fillet");
  const [weldSize, setWeldSize] = useState(0.01);
  const [weldSizeUnit, setWeldSizeUnit] = useState("m");
  const [weldLength, setWeldLength] = useState(0.2);
  const [weldLengthUnit, setWeldLengthUnit] = useState("m");
  const [weldCount, setWeldCount] = useState(4);
  const [shearForce, setShearForce] = useState(15000);
  const [shearForceUnit, setShearForceUnit] = useState("N");
  const [axialForce, setAxialForce] = useState(5000);
  const [axialForceUnit, setAxialForceUnit] = useState("N");
  const [eccentricity, setEccentricity] = useState(0.05);
  const [eccentricityUnit, setEccentricityUnit] = useState("m");
  const [material, setMaterial] = useState("Steel");
  const [result, setResult] = useState<WeldResult | null>(null);

  const calculate = () => {
    const config = {
      weldType,
      weldSize: toBase(weldSize, "length", weldSizeUnit),
      weldLength: toBase(weldLength, "length", weldLengthUnit),
      weldCount: Math.max(1, Math.round(weldCount)),
      shearForce: toBase(shearForce, "force", shearForceUnit),
      axialForce: toBase(axialForce, "force", axialForceUnit),
      eccentricity: toBase(eccentricity, "length", eccentricityUnit),
      material: MATERIALS[material] || MATERIALS.Steel,
    };

    setResult(wrapResult(solveWeldEngine(config)));
  };

  return (
          <CalculatorLayout
        moduleId="welds"
        title="Weld Strength Evaluation"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Weld design guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Use throat area and weld count to evaluate shear, axial, and resultant stresses on the weld group.
              </p>
            </div>
          </div>
        }
        center={
          <WeldInputs
            weldType={weldType}
            setWeldType={setWeldType}
            weldSize={weldSize}
            setWeldSize={setWeldSize}
            weldSizeUnit={weldSizeUnit}
            setWeldSizeUnit={setWeldSizeUnit}
            weldLength={weldLength}
            setWeldLength={setWeldLength}
            weldLengthUnit={weldLengthUnit}
            setWeldLengthUnit={setWeldLengthUnit}
            weldCount={weldCount}
            setWeldCount={setWeldCount}
            shearForce={shearForce}
            setShearForce={setShearForce}
            shearForceUnit={shearForceUnit}
            setShearForceUnit={setShearForceUnit}
            axialForce={axialForce}
            setAxialForce={setAxialForce}
            axialForceUnit={axialForceUnit}
            setAxialForceUnit={setAxialForceUnit}
            eccentricity={eccentricity}
            setEccentricity={setEccentricity}
            eccentricityUnit={eccentricityUnit}
            setEccentricityUnit={setEccentricityUnit}
            material={material}
            setMaterial={setMaterial}
            onCalculate={calculate}
          />
        }
        right={
          <WeldResults
            result={result}
            lengthUnit={weldSizeUnit}
            forceUnit={shearForceUnit}
            stressUnit="Pa"
          />
        }
      />
  );
}
