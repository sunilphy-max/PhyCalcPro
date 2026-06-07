"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import BrakesClutchesInputs from "@/components/machine/brakes-clutches/BrakesClutchesInputs";
import BrakesClutchesResults from "@/components/machine/brakes-clutches/BrakesClutchesResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveBrakesClutchesEngine } from "@/lib/machine/brakes-clutches/engine";
import type { BrakesClutchesResult } from "@/lib/machine/brakes-clutches/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("brakes-clutches", (units) =>
    applyUnitMap(units, {
      outerRadius: setLengthUnit,
      innerRadius: setLengthUnit,
      force: setForceUnit,
    })
  );

  const [frictionCoeff, setFrictionCoeff] = useState(0.3);
  const [outerRadius, setOuterRadius] = useState(100);
  const [innerRadius, setInnerRadius] = useState(60);
  const [actuationForce, setActuationForce] = useState(2000);
  const [speed, setSpeed] = useState(1500);
  const [engagementTime, setEngagementTime] = useState(0.5);
  const [safetyFactorTarget, setSafetyFactorTarget] = useState(2);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [forceUnit, setForceUnit] = useState("N");
  const [result, setResult] = useState<(BrakesClutchesResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveBrakesClutchesEngine({
          frictionCoeff,
          outerRadius: toBase(outerRadius, "length", lengthUnit),
          innerRadius: toBase(innerRadius, "length", lengthUnit),
          actuationForce: toBase(actuationForce, "force", forceUnit),
          speed,
          engagementTime,
          safetyFactorTarget,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      torque: actuationForce * outerRadius / 1000,
      speedDriver: speed,
    }), [actuationForce, outerRadius, speed]);

  useSyncDesignInputs("brakes-clutches", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("brakes-clutches", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="brakes-clutches"
      title="Brakes & Clutches"
      left={
        <BrakesClutchesInputs
          frictionCoeff={frictionCoeff}
          setFrictionCoeff={setFrictionCoeff}
          outerRadius={outerRadius}
          setOuterRadius={setOuterRadius}
          innerRadius={innerRadius}
          setInnerRadius={setInnerRadius}
          actuationForce={actuationForce}
          setActuationForce={setActuationForce}
          speed={speed}
          setSpeed={setSpeed}
          engagementTime={engagementTime}
          setEngagementTime={setEngagementTime}
          safetyFactorTarget={safetyFactorTarget}
          setSafetyFactorTarget={setSafetyFactorTarget}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          forceUnit={forceUnit}
          setForceUnit={setForceUnit}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Brakes and clutches">
          <p>
            Uniform-pressure annular friction model with mean effective radius. Check thermal capacity for repeated
            stops and verify lining manufacturer limits.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<BrakesClutchesResults result={result} safetyFactorTarget={safetyFactorTarget} />}
    />
  );
}
