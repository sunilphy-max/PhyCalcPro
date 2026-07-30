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
import DrawingUploadPanel from "@/components/manufacturing/drawing/DrawingUploadPanel";
import DrawingExtractReview from "@/components/manufacturing/drawing/DrawingExtractReview";
import DrawingApplyBar from "@/components/manufacturing/drawing/DrawingApplyBar";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";
import { calculatorNumberInputClass, calculatorSelectClass } from "@/components/calculator/styles";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveToleranceEngine } from "@/lib/manufacturing/engine";
import {
  drawingExtractToGdtStack,
  solveGdtStackEngine,
} from "@/lib/manufacturing/gdt";
import type { ContributorBreakdown, DrawingExtract, GdtStackConfig } from "@/lib/manufacturing/gdt/types";
import type { ToleranceResult } from "@/lib/manufacturing/types";
import type { WithCalculationSpec } from "@/lib/standards/types";

type InputMode = "simple" | "gdt";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("tolerance");
  const [toleranceUnit, setToleranceUnit] = useState("mm");
  const [tolerances, setTolerances] = useState([0.05, 0.02, 0.01]);
  const [tolerancesY, setTolerancesY] = useState<number[]>([]);
  const [tolerancesZ, setTolerancesZ] = useState<number[]>([]);
  const [monteCarloSamples, setMonteCarloSamples] = useState(1000);
  const [result, setResult] = useState<WithCalculationSpec<ToleranceResult> | null>(null);
  const [gdtBreakdown, setGdtBreakdown] = useState<ContributorBreakdown[] | undefined>();
  const [inputMode, setInputMode] = useState<InputMode>("simple");
  const [extract, setExtract] = useState<DrawingExtract | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);
  const [gdtConfig, setGdtConfig] = useState<GdtStackConfig | null>(null);

  const mapResultFromSimple = useCallback(
    (raw: ToleranceResult) =>
      wrapResult({
        ...raw,
        tolerances: raw.tolerances.map((value) => fromBase(value, "length", toleranceUnit)),
        worstCase: fromBase(raw.worstCase, "length", toleranceUnit),
        rss: fromBase(raw.rss, "length", toleranceUnit),
        totalTolerance: fromBase(raw.totalTolerance, "length", toleranceUnit),
        worstCaseY:
          raw.worstCaseY !== undefined ? fromBase(raw.worstCaseY, "length", toleranceUnit) : undefined,
        rssY: raw.rssY !== undefined ? fromBase(raw.rssY, "length", toleranceUnit) : undefined,
        worstCaseZ:
          raw.worstCaseZ !== undefined ? fromBase(raw.worstCaseZ, "length", toleranceUnit) : undefined,
        rssZ: raw.rssZ !== undefined ? fromBase(raw.rssZ, "length", toleranceUnit) : undefined,
        worstCase3d:
          raw.worstCase3d !== undefined ? fromBase(raw.worstCase3d, "length", toleranceUnit) : undefined,
        rss3d: raw.rss3d !== undefined ? fromBase(raw.rss3d, "length", toleranceUnit) : undefined,
        monteCarloMean:
          raw.monteCarloMean !== undefined
            ? fromBase(raw.monteCarloMean, "length", toleranceUnit)
            : undefined,
        monteCarloStdDev:
          raw.monteCarloStdDev !== undefined
            ? fromBase(raw.monteCarloStdDev, "length", toleranceUnit)
            : undefined,
      }),
    [toleranceUnit, wrapResult]
  );

  const runSimple = () => {
    const config = {
      tolerances: tolerances.map((value) => toBase(value, "length", toleranceUnit)),
      ...(tolerancesY.length
        ? { tolerancesY: tolerancesY.map((value) => toBase(value, "length", toleranceUnit)) }
        : {}),
      ...(tolerancesZ.length
        ? { tolerancesZ: tolerancesZ.map((value) => toBase(value, "length", toleranceUnit)) }
        : {}),
      ...(monteCarloSamples > 0 ? { monteCarloSamples } : {}),
    };
    const raw = solveToleranceEngine(config);
    setGdtBreakdown(undefined);
    setResult(mapResultFromSimple(raw));
  };

  const runGdt = (config: GdtStackConfig) => {
    const raw = solveGdtStackEngine({
      ...config,
      monteCarloSamples: monteCarloSamples > 0 ? monteCarloSamples : 0,
    });
    const mappedBreakdown = raw.contributors.map((row) => ({
      ...row,
      specifiedTolerance: fromBase(row.specifiedTolerance, "length", toleranceUnit),
      bonus: fromBase(row.bonus, "length", toleranceUnit),
      effectiveTolerance: fromBase(row.effectiveTolerance, "length", toleranceUnit),
    }));
    setGdtBreakdown(mappedBreakdown);
    setResult(
      wrapResult({
        tolerances: mappedBreakdown.map((r) => r.effectiveTolerance),
        count: raw.count,
        worstCase: fromBase(raw.worstCase, "length", toleranceUnit),
        rss: fromBase(raw.rss, "length", toleranceUnit),
        totalTolerance: fromBase(raw.totalTolerance, "length", toleranceUnit),
        worstCaseY:
          raw.worstCaseY !== undefined ? fromBase(raw.worstCaseY, "length", toleranceUnit) : undefined,
        rssY: raw.rssY !== undefined ? fromBase(raw.rssY, "length", toleranceUnit) : undefined,
        worstCaseZ:
          raw.worstCaseZ !== undefined ? fromBase(raw.worstCaseZ, "length", toleranceUnit) : undefined,
        rssZ: raw.rssZ !== undefined ? fromBase(raw.rssZ, "length", toleranceUnit) : undefined,
        worstCase3d:
          raw.worstCase3d !== undefined
            ? fromBase(raw.worstCase3d, "length", toleranceUnit)
            : undefined,
        rss3d: raw.rss3d !== undefined ? fromBase(raw.rss3d, "length", toleranceUnit) : undefined,
        monteCarloMean:
          raw.monteCarloMean !== undefined
            ? fromBase(raw.monteCarloMean, "length", toleranceUnit)
            : undefined,
        monteCarloStdDev:
          raw.monteCarloStdDev !== undefined
            ? fromBase(raw.monteCarloStdDev, "length", toleranceUnit)
            : undefined,
      })
    );
  };

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      minGap: tolerances[0] ?? 0.05,
      nominalGap: tolerances[1] ?? 0.02,
    }),
    [tolerances]
  );

  useSyncDesignInputs("tolerance", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    minGap: (v) => {
      const n = typeof v === "number" ? v : Number(v);
      setTolerances((prev) => [n, ...prev.slice(1)]);
    },
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (inputMode === "gdt" && gdtConfig) {
      runGdt(gdtConfig);
      return;
    }
    if (workflowMode === "design") {
      const design = runModuleDesignMode("tolerance", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runSimple();
  };

  const applyExtract = () => {
    if (!extract) return;
    const config = drawingExtractToGdtStack(extract, {
      monteCarloSamples: monteCarloSamples > 0 ? monteCarloSamples : 0,
    });
    setGdtConfig(config);
    setInputMode("gdt");

    // Also seed simple bilateral half-tolerances from dimensions for fallback editing
    const halfTols = extract.dimensions.map((d) =>
      fromBase(Math.max(Math.abs(d.upperDeviation), Math.abs(d.lowerDeviation)), "length", toleranceUnit)
    );
    if (halfTols.length) setTolerances(halfTols);

    runGdt(config);
  };

  return (
    <CalculatorLayout
      moduleId="tolerance"
      title="Tolerance Stackup Calculator"
      inputs={
        <div className="space-y-4">
          <label className="block space-y-1 text-sm text-slate-600">
            Input mode
            <select
              className={calculatorSelectClass}
              value={inputMode}
              onChange={(e) => setInputMode(e.target.value as InputMode)}
            >
              <option value="simple">Simple (bilateral)</option>
              <option value="gdt">GD&T stack (drawing / FCF)</option>
            </select>
          </label>

          <DrawingUploadPanel
            target="tolerance"
            onExtracted={(next, meta) => {
              setExtract(next);
              setExtractWarnings(meta.warnings);
            }}
          />

          {extractWarnings.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-xs text-amber-700 dark:text-amber-400">
              {extractWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}

          {extract ? (
            <div className="space-y-3">
              <DrawingExtractReview
                extract={extract}
                displayUnit={toleranceUnit}
                mode="tolerance"
                onChange={setExtract}
              />
              <DrawingApplyBar
                onApply={applyExtract}
                onClear={() => {
                  setExtract(null);
                  setExtractWarnings([]);
                  setGdtConfig(null);
                }}
                applyLabel="Apply GD&T stack"
              />
            </div>
          ) : null}

          {inputMode === "simple" ? (
            <ToleranceInputs
              tolerances={tolerances}
              setTolerances={setTolerances}
              tolerancesY={tolerancesY}
              setTolerancesY={setTolerancesY}
              tolerancesZ={tolerancesZ}
              setTolerancesZ={setTolerancesZ}
              toleranceUnit={toleranceUnit}
              setToleranceUnit={setToleranceUnit}
              monteCarloSamples={monteCarloSamples}
              setMonteCarloSamples={setMonteCarloSamples}
              onCalculate={calculate}
            />
          ) : (
            <CalculatorInputPanel
              title="GD&T stackup"
              description={
                gdtConfig
                  ? `${gdtConfig.contributors.length} contributors ready. Upload a drawing or apply an extract, then compute.`
                  : "Upload a PDF drawing and apply the extract, or switch to Simple mode for bilateral entry."
              }
              footer={
                <CalculatorCalculateButton
                  onClick={calculate}
                  label="Compute GD&T stackup"
                  designAware
                />
              }
            >
              <label className="block space-y-1 text-sm text-slate-600">
                Monte Carlo samples (0 = skip)
                <input
                  type="number"
                  min={0}
                  max={100000}
                  step={100}
                  value={monteCarloSamples}
                  onChange={(e) => setMonteCarloSamples(Number(e.target.value))}
                  className={calculatorNumberInputClass}
                />
              </label>
              <UnitSelector
                dimension="length"
                value={toleranceUnit}
                onChange={setToleranceUnit}
                label="Display units"
              />
              {gdtConfig ? (
                <p className="text-xs text-slate-500">
                  Features: {gdtConfig.features.length}, FCFs: {gdtConfig.frames.length}, datums:{" "}
                  {gdtConfig.datums.length}
                </p>
              ) : null}
            </CalculatorInputPanel>
          )}
        </div>
      }
      results={
        <ToleranceResults
          result={result}
          displayUnit={toleranceUnit}
          gdtBreakdown={gdtBreakdown}
        />
      }
    />
  );
}
