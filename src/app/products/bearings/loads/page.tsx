"use client";

import { useState } from "react";
import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { calculatorPanelClass, calculatorSelectClass, calculatorFieldLabelClass } from "@/components/calculator/styles";
import type { BearingType } from "@/lib/machine/bearings/types";
import { explainEquivalentLoad } from "@/lib/machine/bearings/bearingLifeTool";
import { toBase } from "@/lib/units/conversions";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";

const TYPES: { id: BearingType; label: string }[] = [
  { id: "deep_groove", label: "Deep groove ball" },
  { id: "angular_contact", label: "Angular contact" },
  { id: "cylindrical_roller", label: "Cylindrical roller" },
  { id: "cylindrical_nj", label: "Cylindrical NJ" },
  { id: "tapered_roller", label: "Tapered roller" },
  { id: "spherical_roller", label: "Spherical roller" },
  { id: "needle_roller", label: "Needle roller" },
  { id: "thrust_ball", label: "Thrust ball" },
];

export default function BearingLoadsPage() {
  const { wrapResult } = useStandardCalculation("bearing-loads");
  const [bearingType, setBearingType] = useState<BearingType>("deep_groove");
  const [Fr, setFr] = useState(5);
  const [Fa, setFa] = useState(1.5);
  const [forceUnit, setForceUnit] = useState("kN");
  const [explained, setExplained] = useState<ReturnType<typeof explainEquivalentLoad> | null>(null);

  const run = () => {
    const radial = toBase(Fr, "force", forceUnit);
    const axial = toBase(Fa, "force", forceUnit);
    const raw = explainEquivalentLoad(radial, axial, bearingType);
    wrapResult({ equivalentLoadN: raw.P, regime: raw.regime });
    setExplained(raw);
  };

  return (
    <BearingSuiteChrome>
      <CalculatorLayout
        moduleId="bearing-loads"
        title="Equivalent Dynamic Load"
        hasResults={Boolean(explained)}
        inputs={
          <div className={`${calculatorPanelClass} space-y-4`}>
            <p className="text-sm text-slate-500">
              Most engineers struggle with when P equals Fr versus X·Fr + Y·Fa. This tool shows the
              factors and the Fa/Fr vs e decision — not just the number.
            </p>
            <label className={calculatorFieldLabelClass}>
              Bearing type
              <select
                className={`${calculatorSelectClass} mt-1`}
                value={bearingType}
                onChange={(e) => setBearingType(e.target.value as BearingType)}
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <CalculatorUnitField
              label="Radial load Fr"
              value={Fr}
              onChange={setFr}
              min={0}
              step="any"
              unit={
                <ModuleUnitSelect
                  moduleId="bearing-loads"
                  fieldKey="force"
                  value={forceUnit}
                  onChange={setForceUnit}
                />
              }
            />
            <CalculatorUnitField
              label="Axial load Fa"
              value={Fa}
              onChange={setFa}
              min={0}
              step="any"
              unit={<span className="text-xs text-slate-500">{forceUnit}</span>}
            />
            <CalculatorCalculateButton onClick={run} label="Explain equivalent load" showExport={false} />
          </div>
        }
        results={
          explained ? (
            <CalculatorResultsShell moduleId="bearing-loads" fileName="bearing-equivalent-load" heading="Equivalent load P">
              <CalculatorMetricGrid>
                <CalculatorMetricCard label="P" numericValue={explained.P / 1e3} unit="kN" />
                <CalculatorMetricCard label="X" numericValue={explained.X} />
                <CalculatorMetricCard label="Y" numericValue={Number.isFinite(explained.Y) ? explained.Y : 0} />
                <CalculatorMetricCard
                  label="e"
                  value={Number.isFinite(explained.e) ? explained.e.toFixed(3) : "∞"}
                />
                <CalculatorMetricCard
                  label="Fa/Fr"
                  value={Number.isFinite(explained.faOverFr) ? explained.faOverFr.toFixed(3) : "∞"}
                />
                <CalculatorMetricCard label="Regime" value={explained.regime} />
              </CalculatorMetricGrid>
              <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4 dark:border-cyan-900 dark:bg-cyan-950/30">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Reasoning</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {explained.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Continue to{" "}
                <Link href="/products/bearings/life" className="text-cyan-700 underline dark:text-cyan-400">
                  life calculator
                </Link>{" "}
                with this P, or open{" "}
                <Link href="/products/bearings/selection" className="text-cyan-700 underline dark:text-cyan-400">
                  full selection
                </Link>
                .
              </p>
            </CalculatorResultsShell>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
              Enter Fr and Fa to see which load factors apply.
            </div>
          )
        }
      />
    </BearingSuiteChrome>
  );
}
