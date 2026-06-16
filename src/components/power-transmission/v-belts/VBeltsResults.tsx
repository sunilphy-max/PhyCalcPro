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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/50">
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
                value={formatDisplayNumber(result.ratio)}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Belt speed"
                value={formatEngineeringValue(result.beltSpeed, "m/s")}
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
                value={`${formatDisplayNumber(fromBase(result.diameterDriver, "length", lengthUnit))} ${lengthUnit}`}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Driven pulley"
                value={`${formatDisplayNumber(fromBase(result.diameterDriven, "length", lengthUnit))} ${lengthUnit}`}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Belt length (calc.)"
                value={`${formatDisplayNumber(fromBase(result.beltLength, "length", lengthUnit))} ${lengthUnit}`}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Nominal belt length"
                value={`${formatDisplayNumber(result.standardBeltLengthMm)} mm`}
                tone="blue"
              />
            </CalculatorMetricGrid>
            <CalculatorMetricCard
              label="Driver shaft radial load"
              value={formatEngineeringValue(result.radialLoadDriver, "N")}
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
                value={formatDisplayNumber(serviceFactor)}
                tone="orange"
              />
              <CalculatorMetricCard
                label="Wrap angle (driver)"
                value={`${formatDisplayNumber(result.wrapAngleDriver)}°`}
                tone="blue"
              />
            </CalculatorMetricGrid>
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Tight side tension (T₁)"
                value={formatEngineeringValue(result.tightSideTension, "N")}
                tone="orange"
              />
              <CalculatorMetricCard
                label="Slack side tension (T₂)"
                value={formatEngineeringValue(result.slackSideTension, "N")}
                tone="orange"
              />
              <CalculatorMetricCard
                label="Center distance"
                value={`${formatDisplayNumber(fromBase(result.centerDistance, "length", lengthUnit))} ${lengthUnit}`}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Power utilization"
                value={formatDisplayNumber(result.powerUtilization)}
                status={result.powerUtilization > 1 ? "danger" : result.powerUtilization > 0.85 ? "warning" : "safe"}
              />
            </CalculatorMetricGrid>
          </ResultsSection>

          <ResultsSection title="Workflow & life" step="MVP step 3">
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Estimated belt life"
                value={`${formatDisplayNumber(insights?.estimatedBeltLifeHours ?? 0)} h`}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Maintenance interval"
                value={`${formatDisplayNumber(insights?.maintenanceIntervalHours ?? 0)} h`}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Efficiency loss (screening)"
                value={`${formatDisplayNumber(insights?.efficiencyLossPercent ?? 0)}%`}
                tone="orange"
              />
              <CalculatorMetricCard
                label="Driven shaft load"
                value={formatEngineeringValue(result.radialLoadDriven, "N")}
                tone="red"
              />
            </CalculatorMetricGrid>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100">
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
