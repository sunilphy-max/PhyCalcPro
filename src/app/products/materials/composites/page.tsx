"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import CompositeInputs from "@/components/materials/composites/CompositeInputs";
import CompositeResults from "@/components/materials/composites/CompositeResults";
import { toBase } from "@/lib/units/conversions";
import { solveCompositeEngine } from "@/lib/materials/composites/engine";
import type { CompositeResult } from "@/lib/materials/composites/types";

export default function Page() {
  const [fiberVolumeFraction, setFiberVolumeFraction] = useState(0.6);
  const [fiberModulus, setFiberModulus] = useState(230e9);
  const [matrixModulus, setMatrixModulus] = useState(3.5e9);
  const [fiberStrength, setFiberStrength] = useState(3500e6);
  const [matrixStrength, setMatrixStrength] = useState(80e6);
  const [fiberDensity, setFiberDensity] = useState(1800);
  const [matrixDensity, setMatrixDensity] = useState(1200);
  const [fiberPoisson, setFiberPoisson] = useState(0.2);
  const [matrixPoisson, setMatrixPoisson] = useState(0.35);
  const [stressUnit, setStressUnit] = useState("Pa");
  const [densityUnit, setDensityUnit] = useState("kg/m3");
  const [result, setResult] = useState<CompositeResult | null>(null);

  const calculate = () => {
    const config = {
      fiberVolumeFraction,
      fiberModulus: toBase(fiberModulus, "stress", stressUnit),
      matrixModulus: toBase(matrixModulus, "stress", stressUnit),
      fiberStrength: toBase(fiberStrength, "stress", stressUnit),
      matrixStrength: toBase(matrixStrength, "stress", stressUnit),
      fiberDensity: toBase(fiberDensity, "density", densityUnit),
      matrixDensity: toBase(matrixDensity, "density", densityUnit),
      fiberPoisson,
      matrixPoisson,
    };

    setResult(solveCompositeEngine(config));
  };

  return (
    <DashboardLayout title="Composite Materials Module">
      <CalculatorLayout
        title="Composite Property Calculator"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Composite design overview</h3>
              <p className="text-sm text-slate-500 mt-1">
                Use fiber and matrix properties to estimate longitudinal and transverse composite performance.
              </p>
            </div>
          </div>
        }
        center={
          <CompositeInputs
            fiberVolumeFraction={fiberVolumeFraction}
            setFiberVolumeFraction={setFiberVolumeFraction}
            fiberModulus={fiberModulus}
            setFiberModulus={setFiberModulus}
            matrixModulus={matrixModulus}
            setMatrixModulus={setMatrixModulus}
            fiberStrength={fiberStrength}
            setFiberStrength={setFiberStrength}
            matrixStrength={matrixStrength}
            setMatrixStrength={setMatrixStrength}
            fiberDensity={fiberDensity}
            setFiberDensity={setFiberDensity}
            matrixDensity={matrixDensity}
            setMatrixDensity={setMatrixDensity}
            fiberPoisson={fiberPoisson}
            setFiberPoisson={setFiberPoisson}
            matrixPoisson={matrixPoisson}
            setMatrixPoisson={setMatrixPoisson}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            densityUnit={densityUnit}
            setDensityUnit={setDensityUnit}
            onCalculate={calculate}
          />
        }
        right={
          <CompositeResults
            result={result}
            stressUnit={stressUnit}
            densityUnit={densityUnit}
          />
        }
      />
    </DashboardLayout>
  );
}
