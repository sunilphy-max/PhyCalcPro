"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SafetyFactorInputs from "@/components/fasteners/safety-factor/SafetyFactorInputs";
import SafetyFactorResults from "@/components/fasteners/safety-factor/SafetyFactorResults";
import { toBase } from "@/lib/units/conversions";
import { solveSafetyFactorEngine } from "@/lib/fasteners/safetyFactor/engine";
import type { SafetyFactorResult } from "@/lib/fasteners/safetyFactor/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("safety-factor");
  const [diameter, setDiameter] = useState(0.02);
  const [diameterUnit, setDiameterUnit] = useState("m");
  const [axialForce, setAxialForce] = useState(15000);
  const [axialForceUnit, setAxialForceUnit] = useState("N");
  const [shearForce, setShearForce] = useState(5000);
  const [shearForceUnit, setShearForceUnit] = useState("N");
  const [bendingMoment, setBendingMoment] = useState(120.0);
  const [bendingMomentUnit, setBendingMomentUnit] = useState("N·m");
  const [torque, setTorque] = useState(80.0);
  const [torqueUnit, setTorqueUnit] = useState("N·m");
  const [yieldStrength, setYieldStrength] = useState(250e6);
  const [ultimateStrength, setUltimateStrength] = useState(400e6);
  const [stressUnit, setStressUnit] = useState("Pa");
  const [result, setResult] = useState<SafetyFactorResult | null>(null);

  const runCheck = () => {
    const config = {
      diameter: toBase(diameter, "length", diameterUnit),
      axialForce: toBase(axialForce, "force", axialForceUnit),
      shearForce: toBase(shearForce, "force", shearForceUnit),
      bendingMoment: toBase(bendingMoment, "moment", bendingMomentUnit),
      torque: toBase(torque, "torque", torqueUnit),
      yieldStrength: toBase(yieldStrength, "stress", stressUnit),
      ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
    };

    setResult(wrapResult(solveSafetyFactorEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      appliedStress: yieldStrength / 2,
      yieldStress: yieldStrength,
      loadFactor: 1.5,
    }), [yieldStrength]);

  useSyncDesignInputs("safety-factor", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("safety-factor", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="safety-factor"
        title="Combined Safety Factor Analysis"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Module guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Estimate the governing safety factor for a circular member under combined axial, shear, bending, and torsional loading.
              </p>
            </div>
          </div>
        }
        center={
          <SafetyFactorInputs
            diameter={diameter}
            setDiameter={setDiameter}
            diameterUnit={diameterUnit}
            setDiameterUnit={setDiameterUnit}
            axialForce={axialForce}
            setAxialForce={setAxialForce}
            axialForceUnit={axialForceUnit}
            setAxialForceUnit={setAxialForceUnit}
            shearForce={shearForce}
            setShearForce={setShearForce}
            shearForceUnit={shearForceUnit}
            setShearForceUnit={setShearForceUnit}
            bendingMoment={bendingMoment}
            setBendingMoment={setBendingMoment}
            bendingMomentUnit={bendingMomentUnit}
            setBendingMomentUnit={setBendingMomentUnit}
            torque={torque}
            setTorque={setTorque}
            torqueUnit={torqueUnit}
            setTorqueUnit={setTorqueUnit}
            yieldStrength={yieldStrength}
            setYieldStrength={setYieldStrength}
            ultimateStrength={ultimateStrength}
            setUltimateStrength={setUltimateStrength}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            onCalculate={calculate}
          />
        }
        right={
          <SafetyFactorResults
            result={result}
            lengthUnit={diameterUnit}
            forceUnit={axialForceUnit}
            momentUnit={bendingMomentUnit}
            torqueUnit={torqueUnit}
            stressUnit={stressUnit}
          />
        }
      />
  );
}
