"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import RotationInputs from "@/components/dynamics/rotation/RotationInputs";
import RotationResults from "@/components/dynamics/rotation/RotationResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveRotationEngine } from "@/lib/dynamics/rotation/engine";
import type { RotationResult } from "@/lib/dynamics/rotation/types";

export default function Page() {
  const [mass, setMass] = useState(10);
  const [radius, setRadius] = useState(0.3);
  const [speedRPM, setSpeedRPM] = useState(1500);
  const [power, setPower] = useState(1000);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [powerUnit, setPowerUnit] = useState("W");
  const [result, setResult] = useState<RotationResult | null>(null);

  const calculate = () => {
    const config = {
      mass: mass,
      radius: toBase(radius, "length", lengthUnit),
      speedRPM,
      power: toBase(power, "power", powerUnit),
    };

    const raw = solveRotationEngine(config);
    setResult({
      ...raw,
      inertia: raw.inertia,
      kineticEnergy: raw.kineticEnergy,
      centripetalAcceleration: raw.centripetalAcceleration,
      centripetalForce: raw.centripetalForce,
      torque: raw.torque,
    });
  };

  return (
    <DashboardLayout title="Rotational Systems">
      <CalculatorLayout
        title="Rotational System Calculator"
        left={<RotationInputs
          mass={mass}
          setMass={setMass}
          radius={radius}
          setRadius={setRadius}
          speedRPM={speedRPM}
          setSpeedRPM={setSpeedRPM}
          power={power}
          setPower={setPower}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          powerUnit={powerUnit}
          setPowerUnit={setPowerUnit}
          onCalculate={calculate}
        />}
        center={<div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Calculate kinetic energy and dynamic forces for a rotating mass and its power requirement.</p>
        </div>}
        right={<RotationResults result={result} />}
      />
    </DashboardLayout>
  );
}
