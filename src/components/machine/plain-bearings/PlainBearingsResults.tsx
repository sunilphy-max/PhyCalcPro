"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import DesignStatusBanner from "@/components/machine/bearings-shared/DesignStatusBanner";
import CalculatorResultsViewTabs, {
  CALCULATOR_VIEW_ICONS,
} from "@/components/machine/bearings-shared/CalculatorResultsViewTabs";
import GenericDiagnosisPanel from "@/components/machine/bearings-shared/GenericDiagnosisPanel";
import ModuleReportPreview from "@/components/machine/bearings-shared/ModuleReportPreview";
import PlainBearingReferenceVisual from "@/components/machine/plain-bearings/PlainBearingReferenceVisual";
import type { PlainBearingResult, PlainBearingConfig } from "@/lib/machine/plain-bearings/types";
import {
  diagnosePlainBearing,
  plainDiagnosisCategoryLabel,
  type PlainBearingAdjustment,
  type PlainBearingDiagnosis,
} from "@/lib/machine/plain-bearings/diagnosis";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import type { ReportRow } from "@/lib/export/reportPayload";
import type { CalculationSpec } from "@/lib/standards/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import type { CalculatorResultsViewTab } from "@/components/machine/bearings-shared/CalculatorResultsViewTabs";

type Props = {
  result: (PlainBearingResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  config?: PlainBearingConfig | null;
  diagnosis?: PlainBearingDiagnosis | null;
  workflowMode?: DesignWorkflowMode;
  inputRows?: ReportRow[];
  onApplyAdjustment?: (fields: PlainBearingAdjustment["fields"]) => void;
};

const REPORT_SECTIONS = [
  "Project metadata and calculation standard",
  "Input summary (type, load, speed, geometry, viscosity)",
  "Sommerfeld / film / eccentricity screening",
  "Specific load and temperature rise",
  "Fit and clearance notes",
  "Pass / marginal / fail summary",
  "Sensitivity charts (when captured)",
];

export default function PlainBearingsResults({
  result,
  lengthUnit,
  config,
  diagnosis: diagnosisProp,
  workflowMode,
  inputRows = [],
  onApplyAdjustment,
}: Props) {
  const diagnosis = useMemo(() => {
    if (diagnosisProp) return diagnosisProp;
    if (workflowMode !== "diagnose" || !result || !config) return null;
    return diagnosePlainBearing(result, config);
  }, [diagnosisProp, result, config, workflowMode]);

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result || !config) return [];
    const multipliers = Array.from({ length: 12 }, (_, i) => 0.4 + i * 0.15);
    const loads = multipliers.map((m) => config.load * m);
    const films = loads.map((load) => {
      try {
        return solvePlainBearingEngine({ ...config, load }).minFilmThickness * 1e6;
      } catch {
        return 0;
      }
    });
    const temps = loads.map((load) => {
      try {
        return solvePlainBearingEngine({ ...config, load }).temperatureRiseC ?? 0;
      } catch {
        return 0;
      }
    });
    const speeds = Array.from({ length: 10 }, (_, i) => Math.max(config.speed * (0.4 + i * 0.15), 50));
    const sommerfeld = speeds.map((speed) => {
      try {
        return solvePlainBearingEngine({ ...config, speed }).sommerfeldNumber;
      } catch {
        return 0;
      }
    });
    const loadDisplay = loads.map((l) => fromBase(l, "force", "kN"));

    return [
      {
        id: "film-vs-load",
        label: "Film vs load",
        content: (
          <EngineeringPlot
            title="Minimum film thickness vs load"
            x={loadDisplay}
            y={films}
            yLabel="Min film thickness"
            xLabel="Load"
            xUnit="kN"
            unitLabel="µm"
            probeX={fromBase(config.load, "force", "kN")}
            showPeak={false}
          />
        ),
      },
      {
        id: "temp-vs-load",
        label: "ΔT vs load",
        content: (
          <EngineeringPlot
            title="Temperature rise vs load"
            x={loadDisplay}
            y={temps}
            yLabel="Temperature rise"
            xLabel="Load"
            xUnit="kN"
            unitLabel="°C"
            probeX={fromBase(config.load, "force", "kN")}
            showPeak={false}
          />
        ),
      },
      {
        id: "s-vs-speed",
        label: "S vs speed",
        content: (
          <EngineeringPlot
            title="Sommerfeld / film factor vs speed"
            x={speeds}
            y={sommerfeld}
            yLabel="Sommerfeld / film factor"
            xLabel="Speed"
            xUnit="rpm"
            unitLabel="—"
            probeX={config.speed}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result, config]);

  const viewTabs = useMemo((): CalculatorResultsViewTab[] => {
    if (!result) return [];

    const tabs: CalculatorResultsViewTab[] = [
      {
        id: "summary",
        label: "Summary",
        icon: CALCULATOR_VIEW_ICONS.summary,
        content: (
          <div className="space-y-4">
            <DesignStatusBanner
              designStatus={result.designStatus}
              subtitle={result.status}
              detail={
                result.bearingType === "journal"
                  ? "Journal (ISO 7902)"
                  : result.bearingType === "thrust_pad"
                    ? "Thrust pad (ISO 12131)"
                    : "Tilting pad (ISO 12130)"
              }
              highlights={[
                {
                  label: "h_min",
                  value: `${formatDisplayNumber(fromBase(result.minFilmThickness, "length", lengthUnit))} ${lengthUnit}`,
                },
                {
                  label: "Sommerfeld",
                  value: formatDisplayNumber(result.sommerfeldNumber),
                },
                {
                  label: "Power loss",
                  value: `${formatDisplayNumber(result.powerLoss)} W`,
                },
                {
                  label: "Outlet T",
                  value:
                    result.outletTempC != null
                      ? `${formatDisplayNumber(result.outletTempC)} °C`
                      : "—",
                },
              ]}
            />

            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Sommerfeld S"
                numericValue={result.sommerfeldNumber}
                unit="—"
                tone="blue"
              />
              {result.bearingType === "journal" ? (
                <CalculatorMetricCard
                  label="Eccentricity ε"
                  numericValue={result.eccentricityRatio}
                  unit="—"
                  tone="purple"
                />
              ) : null}
              {result.specificLoadPa != null ? (
                <CalculatorMetricCard
                  label="Specific load"
                  numericValue={result.specificLoadPa}
                  unit="Pa"
                  tone="orange"
                />
              ) : null}
              {result.unitLoad != null ? (
                <CalculatorMetricCard
                  label="Unit load"
                  numericValue={result.unitLoad}
                  unit="Pa"
                  tone="orange"
                />
              ) : null}
              <CalculatorMetricCard
                label="Minimum film thickness"
                numericValue={fromBase(result.minFilmThickness, "length", lengthUnit)}
                unit={lengthUnit}
                status={result.isSafe ? "safe" : "danger"}
              />
              <CalculatorMetricCard
                label="Power loss"
                numericValue={result.powerLoss}
                unit="W"
                tone="orange"
              />
              {result.temperatureRiseC != null ? (
                <CalculatorMetricCard
                  label="Temperature rise"
                  numericValue={result.temperatureRiseC}
                  unit="°C"
                />
              ) : null}
              {result.outletTempC != null ? (
                <CalculatorMetricCard
                  label="Outlet temperature"
                  numericValue={Number(result.outletTempC.toFixed(1))}
                  unit="°C"
                />
              ) : null}
            </CalculatorMetricGrid>

            {result.shaftFit ? (
              <CalculatorMetricGrid cols={3}>
                <CalculatorMetricCard label="Shaft fit" value={result.shaftFit} tone="blue" />
                <CalculatorMetricCard
                  label="Housing fit"
                  value={result.housingFit ?? "—"}
                  tone="blue"
                />
                <CalculatorMetricCard
                  label="Min clearance"
                  value={
                    result.minRecommendedClearanceUm != null
                      ? `${result.minRecommendedClearanceUm.toFixed(0)} µm`
                      : "—"
                  }
                />
              </CalculatorMetricGrid>
            ) : null}

            <PlainBearingReferenceVisual bearingType={result.bearingType} compact />
          </div>
        ),
      },
      {
        id: "charts",
        label: "Charts",
        icon: CALCULATOR_VIEW_ICONS.charts,
        content:
          plotTabs.length > 0 ? (
            <EngineeringPlotPicker tabs={plotTabs} />
          ) : (
            <p className="text-sm text-slate-500">Charts require a calculated result.</p>
          ),
      },
      {
        id: "report",
        label: "Report",
        icon: CALCULATOR_VIEW_ICONS.report,
        content: (
          <ModuleReportPreview
            title="Professional plain bearing report (PDF)"
            description="Structured export with film, load, thermal screening, and assumptions."
            sections={REPORT_SECTIONS}
            inputRows={inputRows}
            hasResult={Boolean(result)}
          />
        ),
      },
    ];

    if (workflowMode === "diagnose" && diagnosis) {
      tabs.splice(2, 0, {
        id: "diagnose",
        label: "Diagnose",
        icon: CALCULATOR_VIEW_ICONS.diagnose,
        content: (
          <GenericDiagnosisPanel
            overallRisk={diagnosis.overallRisk}
            summary={diagnosis.summary}
            findings={diagnosis.findings.map((f) => ({
              category: f.category,
              categoryLabel: plainDiagnosisCategoryLabel(f.category),
              level: f.level,
              title: f.title,
              detail: f.detail,
            }))}
            recommendations={diagnosis.adjustments.map((a) => ({
              id: a.id,
              label: a.label,
              detail: a.detail,
              onApply: onApplyAdjustment ? () => onApplyAdjustment(a.fields) : undefined,
            }))}
          />
        ),
      });
    }

    return tabs;
  }, [
    result,
    lengthUnit,
    plotTabs,
    inputRows,
    workflowMode,
    diagnosis,
    onApplyAdjustment,
  ]);

  const defaultView =
    workflowMode === "diagnose" && diagnosis ? ("diagnose" as const) : ("summary" as const);

  return (
    <CalculatorResultsShell
      moduleId="plain-bearings"
      fileName="plain-bearing"
      title="Export plain bearing results"
      description="Export film thickness, load and power loss."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter bearing data and calculate."
      heading="Plain bearing results"
      csvRows={
        result
          ? [
              { metric: "bearingType", value: result.bearingType },
              { metric: "sommerfeldNumber", value: result.sommerfeldNumber },
              { metric: "minFilmThickness", value: result.minFilmThickness },
              { metric: "powerLoss", value: result.powerLoss },
              { metric: "specificLoadPa", value: result.specificLoadPa ?? 0 },
              { metric: "outletTempC", value: result.outletTempC ?? 0 },
            ]
          : undefined
      }
    >
      {result ? (
        <CalculatorResultsViewTabs
          key={defaultView}
          ariaLabel="Plain bearing results views"
          defaultTab={defaultView}
          tabs={viewTabs}
        />
      ) : null}
    </CalculatorResultsShell>
  );
}
