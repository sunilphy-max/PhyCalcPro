"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ToleranceInputs from "@/components/manufacturing/ToleranceInputs";
import ToleranceResults from "@/components/manufacturing/ToleranceResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveToleranceEngine } from "@/lib/manufacturing/engine";
import type { ToleranceResult } from "@/lib/manufacturing/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("tolerance");
  const [toleranceUnit, setToleranceUnit] = useState("mm");
  const [tolerances, setTolerances] = useState([0.05, 0.02, 0.01]);
  const [tolerancesY, setTolerancesY] = useState<number[]>([]);
  const [monteCarloSamples, setMonteCarloSamples] = useState(1000);
  const [result, setResult] = useState<WithCalculationSpec<ToleranceResult> | null>(null);

  const runCheck = () => {
    const config = {
      tolerances: tolerances.map((value) => toBase(value, "length", toleranceUnit)),
      ...(tolerancesY.length
        ? { tolerancesY: tolerancesY.map((value) => toBase(value, "length", toleranceUnit)) }
        : {}),
      ...(monteCarloSamples > 0 ? { monteCarloSamples } : {}),
    };

    const raw = solveToleranceEngine(config);
    setResult(
      wrapResult({
        ...raw,
        tolerances: raw.tolerances.map((value) => fromBase(value, "length", toleranceUnit)),
        worstCase: fromBase(raw.worstCase, "length", toleranceUnit),
        rss: fromBase(raw.rss, "length", toleranceUnit),
        totalTolerance: fromBase(raw.totalTolerance, "length", toleranceUnit),
        worstCaseY: raw.worstCaseY !== undefined ? fromBase(raw.worstCaseY, "length", toleranceUnit) : undefined,
        rssY: raw.rssY !== undefined ? fromBase(raw.rssY, "length", toleranceUnit) : undefined,
        monteCarloMean:
          raw.monteCarloMean !== undefined ? fromBase(raw.monteCarloMean, "length", toleranceUnit) : undefined,
        monteCarloStdDev:
          raw.monteCarloStdDev !== undefined ? fromBase(raw.monteCarloStdDev, "length", toleranceUnit) : undefined,
      })
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      minGap: tolerances[0] ?? 0.05,
      nominalGap: tolerances[1] ?? 0.02,
    }), [tolerances]);

  useSyncDesignInputs("tolerance", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    minGap: (v) => {
      const n = typeof v === "number" ? v : Number(v);
      setTolerances((prev) => [n, ...prev.slice(1)]);
    },
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("tolerance", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="tolerance"
      title="Tolerance Stackup Calculator"
      inputs={
        <ToleranceInputs
          tolerances={tolerances}
          setTolerances={setTolerances}
          tolerancesY={tolerancesY}
          setTolerancesY={setTolerancesY}
          toleranceUnit={toleranceUnit}
          setToleranceUnit={setToleranceUnit}
          monteCarloSamples={monteCarloSamples}
          setMonteCarloSamples={setMonteCarloSamples}
          onCalculate={calculate}
        />
      }
      results={<ToleranceResults result={result} displayUnit={toleranceUnit} />}
    />
  );
}
