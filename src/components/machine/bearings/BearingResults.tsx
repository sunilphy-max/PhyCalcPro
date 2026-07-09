"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { ReportRow } from "@/lib/export/reportPayload";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import type { BearingDiagnosis } from "@/lib/machine/bearings/diagnosis";
import type { RankedBearing } from "@/lib/machine/bearings/catalogSelection";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";
import BearingStatusBanner from "@/components/machine/bearings/BearingStatusBanner";
import BearingRecommendations from "@/components/machine/bearings/BearingRecommendations";
import BearingDiagnosisPanel from "@/components/machine/bearings/BearingDiagnosisPanel";
import BearingReportPreview from "@/components/machine/bearings/BearingReportPreview";
import {
  BEARING_MANUFACTURER_LABELS,
  BEARING_TYPE_LABELS,
  findBearing,
} from "@/data/catalogs/bearingCatalog";

type Props = {
  result: WithCalculationSpec<BearingResult> | null;
  loadUnit: string;
  speedRpm: number;
  arrangement?: "single" | "back_to_back" | "face_to_face" | "tandem";
  workflowMode?: DesignWorkflowMode;
  diagnosis?: BearingDiagnosis | null;
  recommendations?: RankedBearing[];
  inputRows?: ReportRow[];
  onSelectDesignation?: (designation: string) => void;
};

function utilizationStatus(value: number, limit: number, higherIsSafe: boolean): "safe" | "danger" {
  return higherIsSafe ? (value >= limit ? "safe" : "danger") : value <= limit ? "safe" : "danger";
}

export default function BearingResults({
  result,
  loadUnit,
  speedRpm,
  arrangement = "single",
  workflowMode,
  diagnosis,
  recommendations = [],
  inputRows = [],
  onSelectDesignation,
}: Props) {
  const catalogEntry = result?.designation ? findBearing(result.designation) : undefined;

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];

    const p0 = result.equivalentLoad;
    const p0Display = fromBase(p0, "force", loadUnit);
    const loadMultipliers = Array.from({ length: 15 }, (_, i) => 0.5 + i * 0.1);
    const loads = loadMultipliers.map((m) => p0 * m);
    const loadsDisplay = loads.map((l) => fromBase(l, "force", loadUnit));
    const basicLives = loads.map((p) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p, 1e-9);
      return (result.a1 * Math.pow(ratio, result.lifeExponent) * 1e6) / (Math.max(speedRpm, 1) * 60);
    });
    const modifiedLives = loads.map((p) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p, 1e-9);
      return (
        (result.a1 * result.aIso * Math.pow(ratio, result.lifeExponent) * 1e6) /
        (Math.max(speedRpm, 1) * 60)
      );
    });

    const speedRange = Array.from({ length: 12 }, (_, i) => 0.4 + i * 0.1).map(
      (m) => speedRpm * m
    );
    const speedLives = speedRange.map((n) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p0, 1e-9);
      return (result.a1 * Math.pow(ratio, result.lifeExponent) * 1e6) / (Math.max(n, 1) * 60);
    });

    const utilPoints = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2].map((u) => ({
      u,
      life: (result.a1 * Math.pow(1 / u, result.lifeExponent) * 1e6) / (Math.max(speedRpm, 1) * 60),
    }));

    const staticSafety = loadMultipliers.map((m) => {
      const p0Scaled = p0 * m;
      const p0Static = result.staticEquivalentLoad * (p0Scaled / Math.max(p0, 1e-9));
      return result.staticLoadRatingN / Math.max(p0Static, 1e-9);
    });

    return [
      {
        id: "life-load",
        label: "Life vs load",
        content: (
          <EngineeringPlot
            title="Rating life vs equivalent load (ISO 281)"
            x={loadsDisplay}
            y={basicLives}
            yLabel="Basic rating life L10"
            xLabel="Equivalent load P"
            xUnit={loadUnit}
            unitLabel="h"
            series={[{ y: modifiedLives, label: "Modified life Lnm (a_ISO)" }]}
            probeX={p0Display}
            showPeak={false}
          />
        ),
      },
      {
        id: "life-speed",
        label: "Life vs speed",
        content: (
          <EngineeringPlot
            title="Rating life vs speed at current load"
            x={speedRange}
            y={speedLives}
            yLabel="Basic rating life L10"
            xLabel="Speed"
            xUnit="RPM"
            unitLabel="h"
            probeX={speedRpm}
            showPeak={false}
          />
        ),
      },
      {
        id: "utilization",
        label: "P/C margin",
        content: (
          <EngineeringPlot
            title="Dynamic utilization P/C vs rating life"
            x={utilPoints.map((p) => p.u)}
            y={utilPoints.map((p) => p.life)}
            yLabel="Basic rating life L10"
            xLabel="Dynamic utilization P/C"
            xUnit="—"
            unitLabel="h"
            probeX={result.dynamicUtilization}
            showPeak={false}
          />
        ),
      },
      {
        id: "static-margin",
        label: "Static margin",
        content: (
          <EngineeringPlot
            title="Static safety s₀ = C₀/P₀ vs load level"
            x={loadsDisplay}
            y={staticSafety}
            yLabel="Static safety factor s₀"
            xLabel="Equivalent load P"
            xUnit={loadUnit}
            probeX={p0Display}
            showPeak={false}
          />
        ),
      },
    ];
  }, [loadUnit, result, speedRpm]);

  const resultsContent = result ? (
    <>
      <BearingStatusBanner result={result} />

      {workflowMode !== "diagnose" && recommendations.length > 0 ? (
        <BearingRecommendations recommendations={recommendations} onSelect={onSelectDesignation} />
      ) : null}

      {result.bearingType ? (
        <BearingReferenceVisual
          bearingType={result.bearingType}
          sealType={catalogEntry?.sealType ?? "open"}
          arrangement={arrangement}
          compact
        />
      ) : null}

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Catalog designation"
          value={result.designation ?? "—"}
          tone="blue"
        />
        <CalculatorMetricCard label="Bearing family" value={BEARING_TYPE_LABELS[result.bearingType]} />
        <CalculatorMetricCard
          label="Equivalent load P"
          numericValue={fromBase(result.equivalentLoad, "force", loadUnit)} unit={loadUnit}
          tone="orange"
        />
        <CalculatorMetricCard
          label={`Basic L10 life (a1=${result.a1})`}
          numericValue={result.expectedLife} unit="h"
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Modified life Lnm"
          numericValue={result.modifiedLife} unit="h"
          tone="purple"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Dynamic utilization P/C"
              numericValue={result.dynamicUtilization} unit="—"
              status={utilizationStatus(result.dynamicUtilization, 1, false)}
            />
            <CalculatorMetricCard
              label="Static safety s₀ = C₀/P₀"
              numericValue={result.staticSafetyFactor} unit="—"
              status={utilizationStatus(result.staticSafetyFactor, 1, true)}
            />
            <CalculatorMetricCard
              label="Speed margin n_lim/n"
              value={result.speedMargin != null ? result.speedMargin.toFixed(2) : "N/A"}
              status={
                result.speedMargin == null || result.speedMargin >= 1 ? "safe" : "danger"
              }
            />
            <CalculatorMetricCard
              label="Life utilization L_req/L10"
              numericValue={result.lifeUtilization} unit="—"
              status={utilizationStatus(result.lifeUtilization, 1, false)}
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard label="Viscosity ratio κ" numericValue={result.modifiedLifeFactors.kappa} unit="—" tone="purple" />
            <CalculatorMetricCard label="Contamination eC" numericValue={result.modifiedLifeFactors.eC} />
            <CalculatorMetricCard label="Life factor aISO" numericValue={result.aIso} unit="—" tone="blue" />
            <CalculatorMetricCard
              label="Pu / P"
              numericValue={result.modifiedLifeFactors.puOverP}
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Minimum radial load"
              numericValue={fromBase(result.minimumRadialLoadN, "force", loadUnit)} unit={loadUnit}
              status={result.minLoadSatisfied ? "safe" : "danger"}
            />
            <CalculatorMetricCard
              label="Friction torque"
              numericValue={result.frictionTorqueNm} unit="N·m"
            />
            <CalculatorMetricCard label="Power loss" numericValue={result.powerLossW} unit="W" />
            <CalculatorMetricCard
              label="Temp. derating on C"
              numericValue={Number((result.temperatureDeratingFactor ) * 100)} unit="%"
            />
          </CalculatorMetricGrid>

          {result.fitRecommendation ? (
            <CalculatorMetricGrid cols={3}>
              <CalculatorMetricCard
                label="Recommended shaft fit"
                value={result.fitRecommendation.shaftFit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Recommended housing fit"
                value={result.fitRecommendation.housingFit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Est. operating clearance"
                numericValue={Number(result.fitRecommendation.estimatedOperatingClearanceUm.toFixed(0))} unit="µm"
              />
            </CalculatorMetricGrid>
          ) : null}

          {result.pairedStations && result.pairedStations.length > 1 ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label={`Paired arrangement (${result.arrangement})`}
                value={result.pairedStations
                  .map(
                    (s) =>
                      `#${s.index + 1}: P=${formatDisplayNumber(fromBase(s.equivalentLoad, "force", loadUnit))} ${loadUnit}, Lnm=${formatDisplayNumber(s.modifiedLifeHours)} h`
                  )
                  .join(" · ")}
              />
            </CalculatorMetricGrid>
          ) : null}

          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Required dynamic C"
              numericValue={fromBase(result.requiredDynamicRating, "force", loadUnit)} unit={loadUnit}
              tone="amber"
            />
            <CalculatorMetricCard
              label="Catalog C / C₀"
              value={`${formatDisplayNumber(fromBase(result.dynamicLoadRatingN, "force", loadUnit))} / ${formatDisplayNumber(fromBase(result.staticLoadRatingN, "force", loadUnit))} ${loadUnit}`}
            />
            <CalculatorMetricCard
              label="Manufacturer"
              value={
                catalogEntry
                  ? BEARING_MANUFACTURER_LABELS[catalogEntry.manufacturer]
                  : "—"
              }
            />
          </CalculatorMetricGrid>

          {result.geometry ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Catalog geometry"
                value={`${result.designation} · d = ${result.geometry.boreMm} mm · D = ${result.geometry.outerDiameterMm} mm · B = ${result.geometry.widthMm} mm${
                  result.limitingSpeedRpm != null
                    ? ` · n_lim = ${formatEngineeringValue(result.limitingSpeedRpm, "RPM", { digits: 0 })}`
                    : ""
                }${catalogEntry?.series ? ` · series ${catalogEntry.series}` : ""}`}
              />
            </CalculatorMetricGrid>
          ) : null}

          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="life-load" label="Result charts" />
    </>
  ) : null;

  const viewTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const tabs: PlotPickerTab[] = [
      { id: "results", label: "Results", content: resultsContent },
      {
        id: "reports",
        label: "Reports",
        content: <BearingReportPreview inputRows={inputRows} hasResult />,
      },
    ];
    if (workflowMode === "diagnose" && diagnosis) {
      tabs.splice(1, 0, {
        id: "diagnose",
        label: "Diagnose",
        content: (
          <BearingDiagnosisPanel diagnosis={diagnosis} onSelectReplacement={onSelectDesignation} />
        ),
      });
    }
    return tabs;
  }, [diagnosis, inputRows, onSelectDesignation, result, resultsContent, workflowMode]);

  return (
    <CalculatorResultsShell
      moduleId="bearings"
      fileName="bearing"
      calculationSpec={result?.calculationSpec}
      title="Bearing calculation report"
      description="ISO 281/76 bearing life report with inputs, equations, safety checks, and charts."
      empty={!result}
      emptyMessage="Enter loads, speed, life target, and catalog bearing, then calculate."
      heading="Bearing results"
      qualityOverrides={chartModuleQuality()}
      inputRows={inputRows}
      reportMeta={{ project: result?.designation ?? "Bearing selection" }}
      csvRows={
        result
          ? [
              { metric: "designation", value: result.designation ?? "" },
              { metric: "designStatus", value: result.designStatus },
              { metric: "governingFailureMode", value: result.governingFailureMode },
              { metric: "equivalentLoad", value: result.equivalentLoad },
              { metric: "staticEquivalentLoad", value: result.staticEquivalentLoad },
              { metric: "requiredDynamicRating", value: result.requiredDynamicRating },
              { metric: "expectedLife", value: result.expectedLife },
              { metric: "modifiedLife", value: result.modifiedLife },
              { metric: "dynamicUtilization", value: result.dynamicUtilization },
              { metric: "staticSafetyFactor", value: result.staticSafetyFactor },
              { metric: "speedMargin", value: result.speedMargin ?? 0 },
              { metric: "lifeUtilization", value: result.lifeUtilization },
              { metric: "kappa", value: result.modifiedLifeFactors.kappa },
              { metric: "aIso", value: result.aIso },
            ]
          : undefined
      }
    >
      {result ? (
        <EngineeringPlotPicker tabs={viewTabs} defaultTabId="results" label="Results view" />
      ) : null}
    </CalculatorResultsShell>
  );
}
