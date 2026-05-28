"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ExportableReport from "@/components/shared/ExportableReport";
import ModuleUnitField, { normalizeFieldValue } from "@/components/shared/ModuleUnitField";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { fromBaseUnit, toBaseUnit } from "@/lib/physics/units";
import { solveCorrosionEngine } from "@/lib/materials/corrosion/engine";
import type { CorrosionConfig, CorrosionResult } from "@/lib/materials/corrosion/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles.corrosion;

export default function Page() {
  const { wrapResult } = useStandardCalculation("corrosion");
  const [initialThickness, setInitialThickness] = useState(10);
  const [thicknessUnit, setThicknessUnit] = useState(defaults.initialThickness.defaultUnit);
  const [corrosionRate, setCorrosionRate] = useState(0.2);
  const [rateUnit, setRateUnit] = useState(defaults.corrosionRate.defaultUnit);
  const [designLife, setDesignLife] = useState(10);
  const [lifeUnit, setLifeUnit] = useState(defaults.designLife.defaultUnit);
  const [safetyMargin, setSafetyMargin] = useState(25);
  const [marginUnit, setMarginUnit] = useState(defaults.safetyMargin.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<CorrosionResult> | null>(null);

  const calculate = () => {
    const config: CorrosionConfig = {
      initialThickness: fromBaseUnit(
        normalizeFieldValue("corrosion", "initialThickness", initialThickness, thicknessUnit),
        "length",
        "mm"
      ),
      corrosionRate: fromBaseUnit(
        normalizeFieldValue("corrosion", "corrosionRate", corrosionRate, rateUnit),
        "lengthPerTime",
        "mm/year"
      ),
      designLife: fromBaseUnit(
        normalizeFieldValue("corrosion", "designLife", designLife, lifeUnit),
        "time",
        "year"
      ),
      safetyMargin:
        marginUnit === "%" ? safetyMargin : safetyMargin * 100,
    };
    const raw = solveCorrosionEngine(config);
    const toDisplayLength = (mmValue: number) =>
      fromBaseUnit(toBaseUnit(mmValue, "length", "mm"), "length", thicknessUnit);

    setResult(
      wrapResult({
        ...raw,
        corrosionAllowance: toDisplayLength(raw.corrosionAllowance),
        requiredThickness: toDisplayLength(raw.requiredThickness),
        remainingThickness: toDisplayLength(raw.remainingThickness),
      })
    );
  };

  return (
    <DashboardLayout title="Corrosion Allowance">
      <CalculatorLayout
        moduleId="corrosion"
        title="Corrosion Allowance Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Design inputs</h2>
              <p className="mt-2 text-sm text-slate-600">Estimate required material thickness for corrosion exposure.</p>
            </div>
            <ModuleUnitField
              moduleId="corrosion"
              fieldKey="initialThickness"
              value={initialThickness}
              unit={thicknessUnit}
              onValueChange={setInitialThickness}
              onUnitChange={setThicknessUnit}
            />
            <ModuleUnitField
              moduleId="corrosion"
              fieldKey="corrosionRate"
              value={corrosionRate}
              unit={rateUnit}
              onValueChange={setCorrosionRate}
              onUnitChange={setRateUnit}
              step="0.01"
            />
            <ModuleUnitField
              moduleId="corrosion"
              fieldKey="designLife"
              value={designLife}
              unit={lifeUnit}
              onValueChange={setDesignLife}
              onUnitChange={setLifeUnit}
            />
            <ModuleUnitField
              moduleId="corrosion"
              fieldKey="safetyMargin"
              value={safetyMargin}
              unit={marginUnit}
              onValueChange={setSafetyMargin}
              onUnitChange={setMarginUnit}
            />
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Calculate corrosion allowance
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Corrosion overview</h2>
            <p className="mt-4 leading-7">
              This calculator produces a corrosion allowance based on a uniform loss rate and required design life, then applies a safety margin to the thickness requirement.
            </p>
          </div>
        }
        right={
          <ExportableReport
            fileName="corrosion"
            calculationSpec={result?.calculationSpec}
            title="Export Corrosion results"
            description="Export the current summary for review."
            csvRows={
              result
                ? [
                    { metric: "corrosionAllowance", value: result.corrosionAllowance, unit: thicknessUnit },
                    { metric: "requiredThickness", value: result.requiredThickness, unit: thicknessUnit },
                    { metric: "remainingThickness", value: result.remainingThickness, unit: thicknessUnit },
                  ]
                : undefined
            }
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Results</h2>
              {!result ? (
                <p className="mt-4 text-sm text-slate-500">Run the analysis to see allowance and required thickness results.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Corrosion allowance</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {result.corrosionAllowance.toFixed(2)} {thicknessUnit}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Required thickness</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {result.requiredThickness.toFixed(2)} {thicknessUnit}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Remaining thickness after life</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {result.remainingThickness.toFixed(2)} {thicknessUnit}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-900 p-4 text-white">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Status</div>
                    <div className="mt-2 text-xl font-semibold">{result.designStatus}</div>
                  </div>
                </div>
              )}
            </div>
          </ExportableReport>
        }
      />
    </DashboardLayout>
  );
}
