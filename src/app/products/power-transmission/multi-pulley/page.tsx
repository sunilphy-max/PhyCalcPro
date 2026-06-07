"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import MultiPulleyInputs from "@/components/power-transmission/multi-pulley/MultiPulleyInputs";
import MultiPulleyResults from "@/components/power-transmission/multi-pulley/MultiPulleyResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveMultiPulley } from "@/lib/powerTransmission/multi-pulley/engine";
import type { MultiPulleyResult } from "@/lib/powerTransmission/multi-pulley/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("multi-pulley", (units) =>
    applyUnitMap(units, { diameter: setLengthUnit, centerDistance: setLengthUnit })
  );

  const [pulleys, setPulleys] = useState([
    { diameter: 150, centerDistance: 500 },
    { diameter: 300, centerDistance: 400 },
    { diameter: 200, centerDistance: 0 },
  ]);
  const [driveType, setDriveType] = useState<"open" | "crossed">("open");
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(MultiPulleyResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    const diameters = pulleys.map((p) => toBase(p.diameter, "length", lengthUnit));
    const centerDistances = pulleys
      .slice(0, -1)
      .map((p) => toBase(p.centerDistance, "length", lengthUnit));
    setResult(
      wrapResult(
        solveMultiPulley({
          diameters,
          centerDistances,
          driveType,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      power: 5000,
      speedDriver: 1200,
      ratio: (pulleys[1]?.diameter ?? 300) / Math.max(pulleys[0]?.diameter ?? 150, 1),
    }), [pulleys]);

  useSyncDesignInputs("multi-pulley", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    driverDiameter: (v) => {
      const d = typeof v === "number" ? v : Number(v);
      setPulleys((prev) => prev.map((p, i) => (i === 0 ? { ...p, diameter: d } : p)));
    },
    drivenDiameter: (v) => {
      const d = typeof v === "number" ? v : Number(v);
      setPulleys((prev) => prev.map((p, i) => (i === 1 ? { ...p, diameter: d } : p)));
    },
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("multi-pulley", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="multi-pulley"
      title="Multi-Pulley Layout"
      inputs={
        <MultiPulleyInputs
          pulleys={pulleys}
          setPulleys={setPulleys}
          driveType={driveType}
          setDriveType={setDriveType}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />
      }
      results={<MultiPulleyResults result={result} lengthUnit={lengthUnit} />}
    />
  );
}
