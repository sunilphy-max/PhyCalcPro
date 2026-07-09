"use client";

import { useMemo } from "react";
import { fromBase } from "@/lib/units/conversions";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { VBeltResult } from "@/lib/powerTransmission/v-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import VBeltLayoutPreview from "./VBeltLayoutPreview";
import VBeltForceDiagram from "./VBeltForceDiagram";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (VBeltResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  serviceFactor: number;
};

function ResultsSection({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{step}</p>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function VBeltsResults({ result, lengthUnit, serviceFactor }: Props) {
  const insights = result?.applicationInsights;

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const center = fromBase(result.centerDistance, "length", lengthUnit);
    const d1 = fromBase(result.diameterDriver, "length", lengthUnit);
    const d2 = fromBase(result.diameterDriven, "length", lengthUnit);

    return [
      {
        id: "layout",
        label: "Drive layout",
        content: (
          <VBeltLayoutPreview
            centerDistance={center}
            driverDiameter={d1}
            drivenDiameter={d2}
            wrapAngleDriverDeg={result.wrapAngleDriver}
            numberOfBelts={result.numberOfBelts}
            beltSection={result.beltSection}
            lengthUnit={lengthUnit}
          />
        ),
      },
      {
        id: "forces",
        label: "Belt forces",
        content: (
          <VBeltForceDiagram
            tightSideN={result.tightSideTension}
            slackSideN={result.slackSideTension}
            radialLoadN={result.radialLoadDriver}
            wrapAngleDeg={result.wrapAngleDriver}
          />
        ),
      },
    ];
  }, [lengthUnit, result]);

  return (
    <CalculatorResultsShell
      moduleId="v-belts"
      fileName="v-belt-drive"
      title="Export V-belt results"
      description="Application-aware drive sizing with geometry, belt count, tensions, shaft loads, and life screening."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Select an application, enter motor power and shaft speeds, then size the drive."
      heading={insights ? `${insights.applicationLabel} — V-belt results` : "V-belt drive results"}
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "application", value: insights?.applicationLabel ?? "General" },
              { metric: "beltSection", value: result.beltSection },
              { metric: "numberOfBelts", value: result.numberOfBelts },
              { metric: "ratio", value: result.ratio },
              { metric: "beltLength_m", value: result.beltLength },
              { metric: "standardBeltLength_mm", value: result.standardBeltLengthMm },
              { metric: "beltSpeed_m_s", value: result.beltSpeed },
              { metric: "serviceFactor", value: serviceFactor },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "tightSideTension_N", value: result.tightSideTension },
              { metric: "slackSideTension_N", value: result.slackSideTension },
              { metric: "radialLoadDriver_N", value: result.radialLoadDriver },
              { metric: "radialLoadDriven_N", value: result.radialLoadDriven },
              { metric: "estimatedBeltLife_h", value: insights?.estimatedBeltLifeHours ?? 0 },
            ]
          : undefined
      }
    >
      {result ? (
        <div className="space-y-8">
          {insights ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {insights.applicationLabel} · SF {serviceFactor.toFixed(2)}
                {insights.serviceFactorSource === "application" ? " (from application)" : " (manual override)"}
              </p>
              {insights.beltSectionNote ? (
                <p className="mt-1 text-slate-600 dark:text-slate-400">{insights.beltSectionNote}</p>
              ) : null}
              {insights.warnings.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-amber-800 dark:text-amber-200">
                  {insights.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <ResultsSection title="Sizing summary" step="MVP step 1">
            <CalculatorMetricGrid cols={3}>
              <CalculatorMetricCard
                label="Speed ratio"
                numericValue={result.ratio} unit="—"
                tone="blue"
              />
              <CalculatorMetricCard
                label="Belt speed"
                numericValue={result.beltSpeed} unit="m/s"
                tone="blue"
              />
              <CalculatorMetricCard
                label="Number of belts"
                value={String(result.numberOfBelts)}
                tone="purple"
              />
            </CalculatorMetricGrid>
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Driver pulley"
                numericValue={fromBase(result.diameterDriver, "length", lengthUnit)} unit={lengthUnit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Driven pulley"
                numericValue={fromBase(result.diameterDriven, "length", lengthUnit)} unit={lengthUnit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Belt length (calc.)"
                numericValue={fromBase(result.beltLength, "length", lengthUnit)} unit={lengthUnit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Nominal belt length"
                numericValue={result.standardBeltLengthMm} unit="mm"
                tone="blue"
              />
            </CalculatorMetricGrid>
            <CalculatorMetricCard
              label="Driver shaft radial load"
              numericValue={result.radialLoadDriver} unit="N"
              tone="red"
              size="lg"
            />
          </ResultsSection>

          <ResultsSection title="Drive verification" step="MVP step 2">
            <CalculatorMetricGrid cols={3}>
              <CalculatorMetricCard
                label="Belt type"
                value={`${result.beltSection} × ${result.numberOfBelts}`}
                tone="purple"
              />
              <CalculatorMetricCard
                label="Service factor"
                numericValue={serviceFactor} unit="—"
                tone="orange"
              />
              <CalculatorMetricCard
                label="Wrap angle (driver)"
                numericValue={result.wrapAngleDriver}
                unit="°"
                tone="blue"
              />
            </CalculatorMetricGrid>
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Tight side tension (T₁)"
                numericValue={result.tightSideTension} unit="N"
                tone="orange"
              />
              <CalculatorMetricCard
                label="Slack side tension (T₂)"
                numericValue={result.slackSideTension} unit="N"
                tone="orange"
              />
              <CalculatorMetricCard
                label="Center distance"
                numericValue={fromBase(result.centerDistance, "length", lengthUnit)} unit={lengthUnit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Power utilization"
                numericValue={result.powerUtilization} unit="—"
                status={result.powerUtilization > 1 ? "danger" : result.powerUtilization > 0.85 ? "warning" : "safe"}
              />
            </CalculatorMetricGrid>
          </ResultsSection>

          <ResultsSection title="Workflow & life" step="MVP step 3">
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Estimated belt life"
                numericValue={insights?.estimatedBeltLifeHours ?? 0} unit="h"
                tone="blue"
              />
              <CalculatorMetricCard
                label="Maintenance interval"
                numericValue={insights?.maintenanceIntervalHours ?? 0} unit="h"
                tone="blue"
              />
              <CalculatorMetricCard
                label="Efficiency loss (screening)"
                numericValue={insights?.efficiencyLossPercent ?? 0} unit="%"
                tone="orange"
              />
              <CalculatorMetricCard
                label="Driven shaft load"
                numericValue={result.radialLoadDriven} unit="N"
                tone="red"
              />
            </CalculatorMetricGrid>
            <div className="rounded-xl border border-indigo-200 bg-white p-4 text-sm text-indigo-950 shadow-sm dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-100">
              <p className="font-semibold">Shaft & bearing handoff</p>
              <p className="mt-1">
                Driver radial load {formatEngineeringValue(result.radialLoadDriver, "N")} and torque{" "}
                {formatEngineeringValue(result.driverTorque, "N·m")} are published to the Shaft and Bearing modules
                after calculate. Open those calculators to import values.
              </p>
            </div>
            {insights?.recommendations.length ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Application recommendations</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-300">
                  {insights.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ResultsSection>

          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="layout" label="Result view" />
        </div>
      ) : null}
    </CalculatorResultsShell>
  );
}
