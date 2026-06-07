"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import RotationInputs from "@/components/dynamics/rotation/RotationInputs";
import RotationResults from "@/components/dynamics/rotation/RotationResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveRotationEngine } from "@/lib/dynamics/rotation/engine";
import type { RotationResult } from "@/lib/dynamics/rotation/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("rotation");
  const [mass, setMass] = useState(10);
  const [radius, setRadius] = useState(0.3);
  const [speedRPM, setSpeedRPM] = useState(1500);
  const [power, setPower] = useState(1000);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [powerUnit, setPowerUnit] = useState("W");
  const [result, setResult] = useState<RotationResult | null>(null);

  const runCheck = () => {
    const config = {
      mass: mass,
      radius: toBase(radius, "length", lengthUnit),
      speedRPM,
      power: toBase(power, "power", powerUnit),
    };

    const raw = solveRotationEngine(config);
    setResult(wrapResult({
      ...raw,
      inertia: raw.inertia,
      kineticEnergy: raw.kineticEnergy,
      centripetalAcceleration: raw.centripetalAcceleration,
      centripetalForce: raw.centripetalForce,
      torque: raw.torque,
    }));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      torque: power,
      inertia: mass * radius * radius,
    }), [power, mass, radius]);

  useSyncDesignInputs("rotation", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("rotation", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="rotation"
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
  );
}
