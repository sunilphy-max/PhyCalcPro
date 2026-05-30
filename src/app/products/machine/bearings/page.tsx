"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import BearingInputs from "@/components/machine/bearings/BearingInputs";
import BearingResults from "@/components/machine/bearings/BearingResults";
import { toBase } from "@/lib/units/conversions";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import type { BearingResult, BearingMaterial, BearingType } from "@/lib/machine/bearings/types";

const MATERIALS: Record<string, BearingMaterial> = {
  Steel: {
    name: "Steel",
    dynamicRatingFactor: 35000,
    staticRatingFactor: 15000,
    allowableLife: 10000,
  },
  Ceramic: {
    name: "Ceramic",
    dynamicRatingFactor: 42000,
    staticRatingFactor: 18000,
    allowableLife: 12000,
  },
  Bronze: {
    name: "Bronze",
    dynamicRatingFactor: 22000,
    staticRatingFactor: 10000,
    allowableLife: 8000,
  },
};

export default function Page() {
  const { wrapResult } = useStandardCalculation("bearings");
  const [radialLoad, setRadialLoad] = useState(500);
  const [radialUnit, setRadialUnit] = useState("N");
  const [axialLoad, setAxialLoad] = useState(100);
  const [axialUnit, setAxialUnit] = useState("N");
  const [speed, setSpeed] = useState(1800);
  const [lifeHours, setLifeHours] = useState(20000);
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  const [bearingType, setBearingType] = useState<BearingType>("deep_groove");
  const [material, setMaterial] = useState("Steel");
  const [result, setResult] = useState<BearingResult | null>(null);

  const calculate = () => {
    const config = {
      radialLoad: toBase(radialLoad, "force", radialUnit),
      axialLoad: toBase(axialLoad, "force", axialUnit),
      speed,
      lifeHours,
      safetyFactor,
      bearingType,
      material: MATERIALS[material] || MATERIALS.Steel,
    };

    setResult(wrapResult(solveBearingEngine(config)));
  };

  return (
          <CalculatorLayout
        moduleId="bearings"
        title="Bearing Load Rating & Life"
        left={
          <div className="space-y-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Bearing guidance</h3>
              <p className="text-sm text-slate-500 mt-2">
                Use this tool to estimate equivalent bearing load, dynamic rating, and expected operating life.
              </p>
            </div>
          </div>
        }
        center={
          <BearingInputs
            radialLoad={radialLoad}
            setRadialLoad={setRadialLoad}
            radialUnit={radialUnit}
            setRadialUnit={setRadialUnit}
            axialLoad={axialLoad}
            setAxialLoad={setAxialLoad}
            axialUnit={axialUnit}
            setAxialUnit={setAxialUnit}
            speed={speed}
            setSpeed={setSpeed}
            lifeHours={lifeHours}
            setLifeHours={setLifeHours}
            safetyFactor={safetyFactor}
            setSafetyFactor={setSafetyFactor}
            bearingType={bearingType}
            setBearingType={setBearingType}
            material={material}
            setMaterial={setMaterial}
            onCalculate={calculate}
          />
        }
        right={<BearingResults result={result} loadUnit={radialUnit} />}
      />
  );
}
