"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import VibrationInputs from "@/components/dynamics/vibrations/VibrationInputs";
import VibrationResults from "@/components/dynamics/vibrations/VibrationResults";
import { toBase } from "@/lib/units/conversions";
import { solveVibrationEngine } from "@/lib/dynamics/vibrations/engine";
import type { VibrationResult, SupportType } from "@/lib/dynamics/vibrations/types";

export default function Page() {
  const [length, setLength] = useState(5);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [E, setE] = useState(210e9);
  const [EUnit, setEUnit] = useState("Pa");
  const [A, setA] = useState(0.005);
  const [areaUnit, setAreaUnit] = useState("m2");
  const [I, setI] = useState(8e-6);
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [rho, setRho] = useState(7850);
  const [rhoUnit, setRhoUnit] = useState("kg/m3");
  const [segments, setSegments] = useState(12);
  const [support, setSupport] = useState<SupportType>("simply_supported");
  const [result, setResult] = useState<VibrationResult | null>(null);

  const calculate = () => {
    const config = {
      length: toBase(length, "length", lengthUnit),
      E: toBase(E, "stress", EUnit),
      A: toBase(A, "area", areaUnit),
      I: toBase(I, "inertia", inertiaUnit),
      rho: toBase(rho, "density", rhoUnit),
      segments: Math.max(2, Math.round(segments)),
      support,
    };

    setResult(solveVibrationEngine(config));
  };

  return (
    <DashboardLayout title="Vibration Analysis">
      <CalculatorLayout
        title="Dynamic Vibration FEM"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Analysis control</h3>
              <p className="text-sm text-slate-500 mt-1">
                Adjust mesh density and support conditions to capture the first vibration modes.
              </p>
            </div>
            <MeshControls
              elements={segments}
              onChangeElements={setSegments}
              refine
            />
          </div>
        }
        center={
          <VibrationInputs
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            E={E}
            setE={setE}
            EUnit={EUnit}
            setEUnit={setEUnit}
            I={I}
            setI={setI}
            inertiaUnit={inertiaUnit}
            setInertiaUnit={setInertiaUnit}
            A={A}
            setA={setA}
            areaUnit={areaUnit}
            setAreaUnit={setAreaUnit}
            rho={rho}
            setRho={setRho}
            rhoUnit={rhoUnit}
            setRhoUnit={setRhoUnit}
            segments={segments}
            setSegments={setSegments}
            support={support}
            setSupport={setSupport}
            onCalculate={calculate}
          />
        }
        right={<VibrationResults result={result} />}
      />
    </DashboardLayout>
  );
}
