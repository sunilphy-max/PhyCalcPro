"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ExportableReport from "@/components/shared/ExportableReport";
import ModuleUnitField, {
  displayFieldValue,
  normalizeFieldValue,
} from "@/components/shared/ModuleUnitField";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import type { FatigueConfig, FatigueResult } from "@/lib/materials/fatigue/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

const defaults = moduleUnitProfiles.fatigue;

export default function Page() {
  const { wrapResult } = useStandardCalculation("fatigue");
  const [alternatingStress, setAlternatingStress] = useState(120);
  const [alternatingUnit, setAlternatingUnit] = useState(defaults.alternatingStress.defaultUnit);
  const [meanStress, setMeanStress] = useState(30);
  const [meanUnit, setMeanUnit] = useState(defaults.meanStress.defaultUnit);
  const [ultimateStrength, setUltimateStrength] = useState(520);
  const [ultimateUnit, setUltimateUnit] = useState(defaults.ultimateStrength.defaultUnit);
  const [enduranceLimit, setEnduranceLimit] = useState(240);
  const [enduranceUnit, setEnduranceUnit] = useState(defaults.enduranceLimit.defaultUnit);
  const [result, setResult] = useState<WithCalculationSpec<FatigueResult> | null>(null);

  const toStressPa = (value: number, unit: string) =>
    normalizeFieldValue("fatigue", "alternatingStress", value, unit);

  const calculate = () => {
    const config: FatigueConfig = {
      alternatingStress: toStressPa(alternatingStress, alternatingUnit),
      meanStress: toStressPa(meanStress, meanUnit),
      ultimateStrength: toStressPa(ultimateStrength, ultimateUnit),
      enduranceLimit: toStressPa(enduranceLimit, enduranceUnit),
    };
    const raw = solveFatigueEngine(config);
    setResult(
      wrapResult({
        ...raw,
        allowableStress: displayFieldValue(
          "fatigue",
          "alternatingStress",
          raw.allowableStress,
          alternatingUnit
        ),
        correctedEndurance: displayFieldValue(
          "fatigue",
          "enduranceLimit",
          raw.correctedEndurance,
          enduranceUnit
        ),
      })
    );
  };

  return (
    <DashboardLayout title="Fatigue Assessment">
      <CalculatorLayout
        moduleId="fatigue"
        title="Fatigue Life Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Fatigue loading</h2>
              <p className="mt-2 text-sm text-slate-600">Quickly estimate safe alternating stress and life potential.</p>
            </div>
            <ModuleUnitField
              moduleId="fatigue"
              fieldKey="alternatingStress"
              value={alternatingStress}
              unit={alternatingUnit}
              onValueChange={setAlternatingStress}
              onUnitChange={setAlternatingUnit}
            />
            <ModuleUnitField
              moduleId="fatigue"
              fieldKey="meanStress"
              value={meanStress}
              unit={meanUnit}
              onValueChange={setMeanStress}
              onUnitChange={setMeanUnit}
            />
            <ModuleUnitField
              moduleId="fatigue"
              fieldKey="ultimateStrength"
              value={ultimateStrength}
              unit={ultimateUnit}
              onValueChange={setUltimateStrength}
              onUnitChange={setUltimateUnit}
            />
            <ModuleUnitField
              moduleId="fatigue"
              fieldKey="enduranceLimit"
              value={enduranceLimit}
              unit={enduranceUnit}
              onValueChange={setEnduranceLimit}
              onUnitChange={setEnduranceUnit}
            />
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Calculate fatigue
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Fatigue overview</h2>
            <p className="mt-4 leading-7">
              This tool evaluates a simple Goodman-style fatigue criterion and estimates allowable alternating stress for a cyclic loading condition.
            </p>
          </div>
        }
        right={
          <ExportableReport
            fileName="fatigue"
            calculationSpec={result?.calculationSpec}
            title="Export Fatigue results"
            description="Export the current summary for review."
            csvRows={
              result
                ? [
                    { metric: "allowableStress", value: result.allowableStress, unit: alternatingUnit },
                    { metric: "predictedCycles", value: result.predictedCycles },
                    { metric: "safetyFactor", value: result.safetyFactor },
                  ]
                : undefined
            }
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Results</h2>
              {!result ? (
                <p className="mt-4 text-sm text-slate-500">Enter loading and material values, then run the calculation.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Allowable alternating stress</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {result.allowableStress.toFixed(1)} {alternatingUnit}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Predicted life</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {result.predictedCycles.toLocaleString()} cycles
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Safety factor</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.safetyFactor.toFixed(2)}</div>
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
