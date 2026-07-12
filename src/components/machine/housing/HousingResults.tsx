"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { fromBase } from "@/lib/units/conversions";
import DesignStatusBanner from "@/components/machine/bearings-shared/DesignStatusBanner";
import CalculatorResultsViewTabs, {
  CALCULATOR_VIEW_ICONS,
} from "@/components/machine/bearings-shared/CalculatorResultsViewTabs";
import GenericDiagnosisPanel from "@/components/machine/bearings-shared/GenericDiagnosisPanel";
import ModuleReportPreview from "@/components/machine/bearings-shared/ModuleReportPreview";
import type { HousingConfig, HousingResult } from "@/lib/machine/housing/types";
import {
  diagnoseHousing,
  housingDiagnosisCategoryLabel,
  type HousingAdjustment,
  type HousingDiagnosis,
} from "@/lib/machine/housing/diagnosis";
import { solveHousingEngine } from "@/lib/machine/housing/engine";
import type { ReportRow } from "@/lib/export/reportPayload";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";

type Props = {
  result: WithCalculationSpec<HousingResult> | null;
  config?: HousingConfig | null;
  diagnosis?: HousingDiagnosis | null;
  workflowMode?: DesignWorkflowMode;
  inputRows?: ReportRow[];
  onApplyAdjustment?: (fields: HousingAdjustment["fields"]) => void;
};

const REPORT_SECTIONS = [
  "Project metadata and calculation standard",
  "Input summary (bore, loads, mount, bolts)",
  "Body bending stress and safety factor",
  "Bolt tension / shear and recommended size",
  "Deflection, stiffness, and fit notes",
  "Pass / marginal / fail summary",
  "Sensitivity charts (when captured)",
];

export default function HousingResults({
  result,
  config,
  diagnosis: diagnosisProp,
  workflowMode,
  inputRows = [],
  onApplyAdjustment,
}: Props) {
  const diagnosis = useMemo(() => {
    if (diagnosisProp) return diagnosisProp;
    if (!result || !config) return null;
    return diagnoseHousing(result, config);
  }, [diagnosisProp, result, config]);

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result || !config) return [];
    const multipliers = Array.from({ length: 12 }, (_, i) => 0.4 + i * 0.15);
    const loads = multipliers.map((m) => config.radialLoad * m);
    const bodySf = loads.map((radialLoad) => {
      try {
        return solveHousingEngine({ ...config, radialLoad }).bodySafetyFactor;
      } catch {
        return 0;
      }
    });
    const boltTension = loads.map((radialLoad) => {
      try {
        return solveHousingEngine({ ...config, radialLoad }).boltTensionPerBolt / 1000;
      } catch {
        return 0;
      }
    });
    const deflection = loads.map((radialLoad) => {
      try {
        return solveHousingEngine({ ...config, radialLoad }).housingDeflection * 1000;
      } catch {
        return 0;
      }
    });
    const loadDisplay = loads.map((l) => fromBase(l, "force", "kN"));

    return [
      {
        id: "sf-vs-load",
        label: "Body SF vs load",
        content: (
          <EngineeringPlot
            title="Housing body safety factor vs radial load"
            x={loadDisplay}
            y={bodySf}
            yLabel="Body safety factor"
            xLabel="Radial load"
            xUnit="kN"
            unitLabel="—"
            probeX={fromBase(config.radialLoad, "force", "kN")}
            showPeak={false}
          />
        ),
      },
      {
        id: "bolt-vs-load",
        label: "Bolt tension vs load",
        content: (
          <EngineeringPlot
            title="Bolt tension per fastener vs radial load"
            x={loadDisplay}
            y={boltTension}
            yLabel="Bolt tension"
            xLabel="Radial load"
            xUnit="kN"
            unitLabel="kN"
            probeX={fromBase(config.radialLoad, "force", "kN")}
            showPeak={false}
          />
        ),
      },
      {
        id: "defl-vs-load",
        label: "Deflection vs load",
        content: (
          <EngineeringPlot
            title="Housing deflection vs radial load"
            x={loadDisplay}
            y={deflection}
            yLabel="Deflection"
            xLabel="Radial load"
            xUnit="kN"
            unitLabel="mm"
            probeX={fromBase(config.radialLoad, "force", "kN")}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result, config]);

  const defaultView =
    workflowMode === "diagnose" ? ("diagnose" as const) : ("summary" as const);

  return (
    <CalculatorResultsShell
      moduleId="housing"
      fileName="housing"
      calculationSpec={result?.calculationSpec}
      title="Export housing results"
      description="Export body stress and bolt reaction estimates."
      empty={!result}
      emptyMessage="Enter housing loads and run the check."
      heading="Housing results"
      csvRows={
        result
          ? [
              { metric: "bodySafetyFactor", value: result.bodySafetyFactor },
              { metric: "boltTensionPerBolt", value: result.boltTensionPerBolt },
              { metric: "boltShearPerBolt", value: result.boltShearPerBolt },
              { metric: "recommendedBoltSize", value: result.recommendedBoltSize },
            ]
          : undefined
      }
    >
      {result ? (
        <CalculatorResultsViewTabs
          ariaLabel="Housing results views"
          defaultTab={defaultView}
          tabs={[
            {
              id: "summary",
              label: "Summary",
              icon: CALCULATOR_VIEW_ICONS.summary,
              content: (
                <div className="space-y-4">
                  <DesignStatusBanner
                    designStatus={result.designStatus}
                    subtitle={result.governingFailureMode}
                    detail={`Recommended bolt ${result.recommendedBoltSize}`}
                    highlights={[
                      {
                        label: "Body SF",
                        value: formatDisplayNumber(result.bodySafetyFactor),
                      },
                      {
                        label: "Bolt T",
                        value: `${formatDisplayNumber(result.boltTensionPerBolt)} N`,
                      },
                      {
                        label: "Bolt V",
                        value: `${formatDisplayNumber(result.boltShearPerBolt)} N`,
                      },
                      {
                        label: "Deflection",
                        value: `${formatDisplayNumber(result.housingDeflection * 1000)} mm`,
                      },
                    ]}
                  />

                  <CalculatorMetricGrid cols={2}>
                    <CalculatorMetricCard
                      label="Body safety factor"
                      numericValue={result.bodySafetyFactor}
                      unit="—"
                      tone={
                        result.designStatus === "safe"
                          ? "green"
                          : result.designStatus === "warning"
                            ? "orange"
                            : "red"
                      }
                    />
                    <CalculatorMetricCard
                      label="Recommended bolt"
                      value={result.recommendedBoltSize}
                      tone="blue"
                    />
                    <CalculatorMetricCard
                      label="Bolt tension / bolt"
                      numericValue={result.boltTensionPerBolt}
                      unit="N"
                      tone="purple"
                    />
                    <CalculatorMetricCard
                      label="Bolt shear / bolt"
                      numericValue={result.boltShearPerBolt}
                      unit="N"
                      tone="purple"
                    />
                    <CalculatorMetricCard
                      label="Body stress"
                      numericValue={result.bodyStress / 1e6}
                      unit="MPa"
                      tone="blue"
                    />
                    <CalculatorMetricCard
                      label="Housing deflection"
                      numericValue={result.housingDeflection * 1000}
                      unit="mm"
                      tone="blue"
                    />
                    <CalculatorMetricCard
                      label="Shaft fit (ISO 286)"
                      value={result.recommendedShaftFit}
                      tone="purple"
                    />
                    <CalculatorMetricCard
                      label="Housing fit"
                      value={result.recommendedHousingFit}
                      tone="purple"
                    />
                    <CalculatorMetricCard
                      label="Est. operating clearance"
                      numericValue={Number(result.estimatedOperatingClearanceUm.toFixed(0))}
                      unit="µm"
                    />
                    <CalculatorMetricCard
                      label="Stiffness estimate"
                      numericValue={result.stiffnessEstimate / 1e6}
                      unit="MN/m"
                      tone="blue"
                    />
                  </CalculatorMetricGrid>
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
              id: "diagnose",
              label: "Diagnose",
              icon: CALCULATOR_VIEW_ICONS.diagnose,
              content: diagnosis ? (
                <GenericDiagnosisPanel
                  overallRisk={diagnosis.overallRisk}
                  summary={diagnosis.summary}
                  findings={diagnosis.findings.map((f) => ({
                    category: f.category,
                    categoryLabel: housingDiagnosisCategoryLabel(f.category),
                    level: f.level,
                    title: f.title,
                    detail: f.detail,
                  }))}
                  recommendations={diagnosis.adjustments.map((a) => ({
                    id: a.id,
                    label: a.label,
                    detail: a.detail,
                    onApply: onApplyAdjustment
                      ? () => onApplyAdjustment(a.fields)
                      : undefined,
                  }))}
                />
              ) : (
                <p className="text-sm text-slate-500">Run calculate to generate diagnosis findings.</p>
              ),
            },
            {
              id: "report",
              label: "Report",
              icon: CALCULATOR_VIEW_ICONS.report,
              content: (
                <ModuleReportPreview
                  title="Professional housing report (PDF)"
                  description="Structured export with body SF, bolt reactions, fits, and assumptions."
                  sections={REPORT_SECTIONS}
                  inputRows={inputRows}
                  hasResult={Boolean(result)}
                />
              ),
            },
          ]}
        />
      ) : null}
    </CalculatorResultsShell>
  );
}
