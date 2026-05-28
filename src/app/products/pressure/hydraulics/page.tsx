"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import HydraulicsInputs from "@/components/pressure/hydraulics/HydraulicsInputs";
import HydraulicsResults from "@/components/pressure/hydraulics/HydraulicsResults";
import { toBase } from "@/lib/units/conversions";
import { solveHydraulicsEngine } from "@/lib/pressure/hydraulics/engine";
import type { HydraulicsResult } from "@/lib/pressure/hydraulics/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("hydraulics");
  const [boreDiameter, setBoreDiameter] = useState(0.1);
  const [rodDiameter, setRodDiameter] = useState(0.04);
  const [strokeLength, setStrokeLength] = useState(0.5);
  const [boreUnit, setBoreUnit] = useState("m");
  const [strokeUnit, setStrokeUnit] = useState("m");
  const [pressure, setPressure] = useState(10e6);
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [forceGoal, setForceGoal] = useState(50000);
  const [forceUnit, setForceUnit] = useState("N");
  const [result, setResult] = useState<HydraulicsResult | null>(null);

  const calculate = () => {
    const config = {
      boreDiameter: toBase(boreDiameter, "length", boreUnit),
      rodDiameter: toBase(rodDiameter, "length", boreUnit),
      strokeLength: toBase(strokeLength, "length", strokeUnit),
      pressure: toBase(pressure, "pressure", pressureUnit),
      forceGoal: toBase(forceGoal, "force", forceUnit),
    };

    setResult(wrapResult(solveHydraulicsEngine(config)));
  };

  return (
    <DashboardLayout title="Hydraulic Cylinders">
      <CalculatorLayout
        moduleId="hydraulics"
        title="Hydraulic Actuator Sizing"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Hydraulics module</h3>
              <p className="text-sm text-slate-500 mt-1">
                Estimate piston and rod loads, annulus retract force, and cylinder volume requirement.
              </p>
            </div>
          </div>
        }
        center={
          <HydraulicsInputs
            boreDiameter={boreDiameter}
            setBoreDiameter={setBoreDiameter}
            rodDiameter={rodDiameter}
            setRodDiameter={setRodDiameter}
            strokeLength={strokeLength}
            setStrokeLength={setStrokeLength}
            boreUnit={boreUnit}
            setBoreUnit={setBoreUnit}
            strokeUnit={strokeUnit}
            setStrokeUnit={setStrokeUnit}
            pressure={pressure}
            setPressure={setPressure}
            pressureUnit={pressureUnit}
            setPressureUnit={setPressureUnit}
            forceGoal={forceGoal}
            setForceGoal={setForceGoal}
            forceUnit={forceUnit}
            setForceUnit={setForceUnit}
            onCalculate={calculate}
          />
        }
        right={
          <HydraulicsResults
            result={result}
            lengthUnit={boreUnit}
            pressureUnit={pressureUnit}
            forceUnit={forceUnit}
          />
        }
      />
    </DashboardLayout>
  );
}
