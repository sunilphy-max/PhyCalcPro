"use client";

import { useCallback, useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  CalculatorResultsPanel,
} from "@/components/calculator/results";
import { calculatorPanelClass, calculatorPrimaryButtonClass } from "@/components/calculator/styles";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import {
  getAdvancedSystemCalculator,
  type AdvancedCalculatorId,
  type AdvancedMetric,
  type AdvancedResult,
} from "@/lib/advanced-systems/calculators";
import type { CalculationSpec } from "@/lib/standards/types";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import {
  applyAdvancedDesignFields,
  buildAdvancedUserInputs,
} from "@/lib/design-workflows/advancedDesignBridge";

type ResultWithSpec = AdvancedResult & { calculationSpec?: CalculationSpec };

type Props = {
  calculatorId: AdvancedCalculatorId;
};

function buildInitialValues(fields: ReturnType<typeof getAdvancedSystemCalculator>["fields"]) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue]));
}

function MetricCard({ metric }: { metric: AdvancedMetric }) {
  return (
    <CalculatorMetricCard
      label={`${metric.label} (${metric.unit})`}
      value={formatEngineeringValue(metric.value, metric.unit, { useExponential: true })}
      tone={metric.tone ?? "blue"}
    />
  );
}

export default function AdvancedSystemCalculator({ calculatorId }: Props) {
  const calculator = getAdvancedSystemCalculator(calculatorId);
  const { wrapResult } = useStandardCalculation(calculator.id);
  const [values, setValues] = useState<Record<string, number>>(() =>
    buildInitialValues(calculator.fields)
  );
  const [result, setResult] = useState<ResultWithSpec | null>(null);

  const csvRows = useMemo(
    () =>
      result?.metrics.map((metric) => ({
        metric: metric.key,
        label: metric.label,
        value: metric.value,
        unit: metric.unit,
      })),
    [result]
  );

  const updateValue = (key: string, value: number) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const designUserInputs = useMemo(
    () => buildAdvancedUserInputs(calculatorId, values),
    [calculatorId, values]
  );

  const { mode: workflowMode } = useDesignWorkflow();

  const applyDesign = useCallback((fields: Record<string, unknown>) => {
    applyAdvancedDesignFields(fields, setValues);
  }, []);

  useSyncDesignInputs(calculator.id, designUserInputs);
  useRegisterApplyDesignCandidate(applyDesign);

  const calculate = useCallback(() => {
    let solveValues = values;
    if (workflowMode === "design") {
      const design = runModuleDesignMode(calculator.id, designUserInputs);
      if (design?.best?.fields) {
        solveValues = { ...values };
        for (const [key, value] of Object.entries(design.best.fields)) {
          if (typeof value === "number" && Number.isFinite(value)) {
            solveValues[key] = value;
          }
        }
        setValues(solveValues);
      }
    }
    setResult(wrapResult(calculator.solve(solveValues)));
  }, [workflowMode, calculator, designUserInputs, values, wrapResult]);

  const resetDefaults = () => {
    setValues(buildInitialValues(calculator.fields));
    setResult(null);
  };

  return (
    <CalculatorLayout
      moduleId={calculator.id}
      title={calculator.title}
      inputs={
        <div className={calculatorPanelClass}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
              {calculator.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{calculator.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{calculator.description}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Applicable references
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {calculator.standards.map((standard) => (
                <span
                  key={standard}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
                >
                  {standard}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {calculator.fields.map((field) => (
              <CalculatorUnitField
                key={field.key}
                label={field.label}
                value={values[field.key] ?? field.defaultValue}
                onChange={(value) => updateValue(field.key, value)}
                min={field.min}
                step="any"
                unit={<span className="text-sm text-slate-500">{field.unit}</span>}
              />
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={calculate} className={calculatorPrimaryButtonClass}>
              Solve
            </button>
            <button
              type="button"
              onClick={resetDefaults}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset defaults
            </button>
          </div>
        </div>
      }
      results={
        <CalculatorResultsShell
          moduleId={calculator.id}
          fileName={calculator.id}
          title={`Export ${calculator.title} results`}
          description="Export the current advanced-system screening summary."
          empty={!result}
          heading={`${calculator.title} Results`}
          calculationSpec={result?.calculationSpec}
          result={result ?? undefined}
          csvRows={csvRows}
          qualityOverrides={{
            unitIntegrity: true,
            physicsValidation: true,
            chartConformance: true,
            pictorialCoverage: true,
            exportConsistency: true,
          }}
        >
          {result ? (
            <div className="space-y-4">
              <CalculatorMetricGrid cols={3}>
                {result.metrics.map((item) => (
                  <MetricCard key={item.key} metric={item} />
                ))}
              </CalculatorMetricGrid>

              <CalculatorResultsPanel title="Assumptions">
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                  {result.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </CalculatorResultsPanel>

              {result.warnings.length ? (
                <CalculatorResultsPanel title="Warnings">
                  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-amber-700">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </CalculatorResultsPanel>
              ) : null}
            </div>
          ) : null}
        </CalculatorResultsShell>
      }
    />
  );
}
