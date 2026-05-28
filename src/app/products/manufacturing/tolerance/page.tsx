"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ToleranceInputs from "@/components/manufacturing/ToleranceInputs";
import ToleranceResults from "@/components/manufacturing/ToleranceResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveToleranceEngine } from "@/lib/manufacturing/engine";
import type { ToleranceResult } from "@/lib/manufacturing/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("tolerance");
  const [toleranceUnit, setToleranceUnit] = useState("mm");
  const [tolerances, setTolerances] = useState([0.05, 0.02, 0.01]);
  const [result, setResult] = useState<ToleranceResult | null>(null);

  const calculate = () => {
    const config = {
      tolerances: tolerances.map((value) => toBase(value, "length", toleranceUnit)),
    };

    const raw = solveToleranceEngine(config);
    setResult(wrapResult({
      ...raw,
      tolerances: raw.tolerances.map((value) => fromBase(value, "length", toleranceUnit)),
      worstCase: fromBase(raw.worstCase, "length", toleranceUnit),
      rss: fromBase(raw.rss, "length", toleranceUnit),
      totalTolerance: fromBase(raw.totalTolerance, "length", toleranceUnit),
    }));
  };

  return (
    <DashboardLayout title="Tolerance Stackup">
      <CalculatorLayout
        moduleId="tolerance"
        title="Tolerance Stackup Calculator"
        left={<ToleranceInputs
          tolerances={tolerances}
          setTolerances={setTolerances}
          toleranceUnit={toleranceUnit}
          setToleranceUnit={setToleranceUnit}
          onCalculate={calculate}
        />}
        center={<div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Compute worst-case and RSS tolerance stackups for assemblies and dimensional chains.</p>
        </div>}
        right={<ToleranceResults result={result} displayUnit={toleranceUnit} />}
      />
    </DashboardLayout>
  );
}
