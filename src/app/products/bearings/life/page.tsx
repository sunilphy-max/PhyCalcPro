"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { calculatorPanelClass, calculatorSelectClass, calculatorFieldLabelClass } from "@/components/calculator/styles";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import type { BearingType } from "@/lib/machine/bearings/types";
import {
  CONTAMINATION_EC,
  solveBearingLifeTool,
  type BearingLifeToolResult,
} from "@/lib/machine/bearings/bearingLifeTool";
import type { ContaminationLevel } from "@/lib/machine/bearings/iso281Life";
import { toBase } from "@/lib/units/conversions";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";

const TYPES: { id: BearingType; label: string }[] = [
  { id: "deep_groove", label: "Deep groove ball" },
  { id: "angular_contact", label: "Angular contact" },
  { id: "cylindrical_roller", label: "Cylindrical roller" },
  { id: "tapered_roller", label: "Tapered roller" },
  { id: "spherical_roller", label: "Spherical roller" },
  { id: "needle_roller", label: "Needle roller" },
  { id: "thrust_ball", label: "Thrust ball" },
];

function LifeToolInner() {
  const searchParams = useSearchParams();
  const example = searchParams.get("example");
  const designationParam = searchParams.get("designation");
  const seed = designationParam ? findBearing(designationParam) : example === "motor" ? findBearing("6205") : null;

  const { wrapResult } = useStandardCalculation("bearing-life");
  const [bearingType, setBearingType] = useState<BearingType>(seed?.type ?? "deep_groove");
  const [designation, setDesignation] = useState(seed?.designation ?? "");
  const [C, setC] = useState(seed ? seed.dynamicRatingN / 1e3 : 14);
  const [C0, setC0] = useState(seed ? seed.staticRatingN / 1e3 : 7.8);
  const [forceUnit, setForceUnit] = useState("kN");
  const [Fr, setFr] = useState(example === "motor" ? 1.2 : 3);
  const [Fa, setFa] = useState(example === "motor" ? 0.3 : 0.5);
  const [speed, setSpeed] = useState(example === "motor" ? 1800 : 1500);
  const [reliability, setReliability] = useState(90);
  const [dm, setDm] = useState(seed ? (seed.boreMm + seed.outerDiameterMm) / 2 : 36);
  const [visc, setVisc] = useState(40);
  const [contamination, setContamination] = useState<ContaminationLevel>("normal_clean");
  const [result, setResult] = useState<(BearingLifeToolResult & { calculationSpec?: unknown }) | null>(null);

  const applyDesignation = (d: string) => {
    setDesignation(d);
    const entry = findBearing(d);
    if (!entry) return;
    setBearingType(entry.type);
    setC(entry.dynamicRatingN / 1e3);
    setC0(entry.staticRatingN / 1e3);
    setDm((entry.boreMm + entry.outerDiameterMm) / 2);
    setForceUnit("kN");
  };

  const calculate = () => {
    const dynamicRatingN = toBase(C, "force", forceUnit);
    const staticRatingN = toBase(C0, "force", forceUnit);
    const radialLoadN = toBase(Fr, "force", forceUnit);
    const axialLoadN = toBase(Fa, "force", forceUnit);
    const solved = solveBearingLifeTool({
      bearingType,
      dynamicRatingN,
      staticRatingN,
      fatigueLoadLimitN: seed?.fatigueLoadLimitN,
      radialLoadN,
      axialLoadN,
      speedRpm: speed,
      reliabilityPercent: reliability,
      meanDiameterMm: dm,
      kinematicViscosityCst: visc,
      contamination,
      catalogFactors: seed?.catalogFactors,
    });
    setResult(wrapResult(solved));
  };

  const contaminationOptions = useMemo(() => Object.keys(CONTAMINATION_EC) as ContaminationLevel[], []);

  return (
    <CalculatorLayout
      moduleId="bearing-life"
      title="Bearing Life Calculator (ISO 281)"
      hasResults={Boolean(result)}
      inputs={
        <div className={`${calculatorPanelClass} space-y-4`}>
          <p className="text-sm text-slate-500">
            Primary L<sub>10</sub> / L<sub>nm</sub> tool. Load C from the{" "}
            <Link href="/products/bearings/database" className="text-cyan-700 underline dark:text-cyan-400">
              database
            </Link>{" "}
            or enter ratings manually.
          </p>

          <label className={calculatorFieldLabelClass}>
            Designation (optional)
            <div className="mt-1 flex gap-2">
              <input
                className={`${calculatorSelectClass} flex-1`}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. 6205"
              />
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 text-xs font-semibold dark:border-slate-600"
                onClick={() => applyDesignation(designation)}
              >
                Load
              </button>
            </div>
          </label>

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
            label="Dynamic rating C"
            value={C}
            onChange={setC}
            min={0}
            step="any"
            unit={
              <ModuleUnitSelect
                moduleId="bearing-life"
                fieldKey="force"
                value={forceUnit}
                onChange={setForceUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Static rating C₀"
            value={C0}
            onChange={setC0}
            min={0}
            step="any"
            unit={<span className="text-xs text-slate-500">{forceUnit}</span>}
          />
          <CalculatorUnitField
            label="Radial load Fr"
            value={Fr}
            onChange={setFr}
            min={0}
            step="any"
            unit={<span className="text-xs text-slate-500">{forceUnit}</span>}
          />
          <CalculatorUnitField
            label="Axial load Fa"
            value={Fa}
            onChange={setFa}
            min={0}
            step="any"
            unit={<span className="text-xs text-slate-500">{forceUnit}</span>}
          />
          <CalculatorUnitField label="Speed" value={speed} onChange={setSpeed} min={0} step="any" unit="rpm" />
          <label className={calculatorFieldLabelClass}>
            Reliability
            <select
              className={`${calculatorSelectClass} mt-1`}
              value={reliability}
              onChange={(e) => setReliability(Number(e.target.value))}
            >
              {[90, 95, 96, 97, 98, 99].map((r) => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </select>
          </label>
          <CalculatorUnitField label="Mean diameter dm" value={dm} onChange={setDm} min={1} step="any" unit="mm" />
          <CalculatorUnitField
            label="Operating viscosity ν"
            value={visc}
            onChange={setVisc}
            min={0.1}
            step="any"
            unit="cSt"
          />
          <label className={calculatorFieldLabelClass}>
            Contamination
            <select
              className={`${calculatorSelectClass} mt-1`}
              value={contamination}
              onChange={(e) => setContamination(e.target.value as ContaminationLevel)}
            >
              {contaminationOptions.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <CalculatorCalculateButton onClick={calculate} label="Calculate life" showExport={false} />
        </div>
      }
      results={
        result ? (
          <CalculatorResultsShell moduleId="bearing-life" fileName="bearing-life" heading="Life results">
            <CalculatorMetricGrid>
              <CalculatorMetricCard
                label="L10 life"
                numericValue={result.basicLifeHours}
                unit="h"
              />
              <CalculatorMetricCard
                label="Lnm (modified)"
                numericValue={result.modifiedLifeHours}
                unit="h"
              />
              <CalculatorMetricCard
                label="L10 revolutions"
                numericValue={result.basicLifeMillionRev}
                unit="×10⁶ rev"
              />
              <CalculatorMetricCard label="Equivalent P" numericValue={result.equivalentLoadN / 1e3} unit="kN" />
              <CalculatorMetricCard label="a₁" numericValue={result.a1} />
              <CalculatorMetricCard label="aISO" numericValue={result.aIso} />
              <CalculatorMetricCard label="κ" numericValue={result.kappa} />
              {result.staticSafetyFactor != null ? (
                <CalculatorMetricCard label="Static SF (screen)" numericValue={result.staticSafetyFactor} />
              ) : null}
            </CalculatorMetricGrid>
            <p className="mt-4 text-xs text-slate-500">
              Regime: {result.factorsUsed.regime}.{" "}
              <Link href="/products/bearings/loads" className="text-cyan-700 underline dark:text-cyan-400">
                Explain equivalent load →
              </Link>
            </p>
          </CalculatorResultsShell>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            Enter ratings and duty, then calculate ISO 281 life.
          </div>
        )
      }
    />
  );
}

export default function BearingLifePage() {
  return (
    <BearingSuiteChrome>
      <Suspense fallback={null}>
        <LifeToolInner />
      </Suspense>
    </BearingSuiteChrome>
  );
}
