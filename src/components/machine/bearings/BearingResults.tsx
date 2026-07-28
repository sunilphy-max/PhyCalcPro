"use client";

import { useMemo, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  Droplets,
  FileText,
  Gauge,
  Layers,
  LayoutDashboard,
  Stethoscope,
} from "lucide-react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { ReportRow } from "@/lib/export/reportPayload";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import type { BearingDiagnosis } from "@/lib/machine/bearings/diagnosis";
import type { CrossManufacturerRecommendation } from "@/lib/machine/bearings/catalogAlternatives";
import BearingLifeFactorsCard from "@/components/machine/bearings/BearingLifeFactorsCard";
import BearingPairedStationsCard from "@/components/machine/bearings/BearingPairedStationsCard";
import BearingThermalCard from "@/components/machine/bearings/BearingThermalCard";
import BearingDuplexStiffnessCard from "@/components/machine/bearings/BearingDuplexStiffnessCard";
import BearingThermalEquilibriumCard from "@/components/machine/bearings/BearingThermalEquilibriumCard";
import BearingRelubricationCard from "@/components/machine/bearings/BearingRelubricationCard";
import BearingDefectFrequenciesCard from "@/components/machine/bearings/BearingDefectFrequenciesCard";
import BearingAuxSpeedEnergyCard from "@/components/machine/bearings/BearingAuxSpeedEnergyCard";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";
import BearingStatusBanner from "@/components/machine/bearings/BearingStatusBanner";
import BearingResultsMetrics from "@/components/machine/bearings/BearingResultsMetrics";
import BearingRecommendations from "@/components/machine/bearings/BearingRecommendations";
import BearingCompareTable, {
  type BearingCompareRow,
} from "@/components/machine/bearings/BearingCompareTable";
import MountedBomPanel from "@/components/machine/housing/MountedBomPanel";
import type { MountedBomResult } from "@/lib/machine/housing/mountedBom";
import BearingDiagnosisPanel from "@/components/machine/bearings/BearingDiagnosisPanel";
import BearingReportPreview from "@/components/machine/bearings/BearingReportPreview";
import CalculatorResultsViewTabs, {
  type CalculatorResultsViewId,
} from "@/components/machine/bearings-shared/CalculatorResultsViewTabs";
import { buildBearingCsvRows, buildBearingReportSections } from "@/lib/machine/bearings/reportSections";
import BearingConstructionCard from "@/components/machine/bearings/BearingConstructionCard";
import BearingDecisionDashboard from "@/components/machine/bearings/BearingDecisionDashboard";
import BearingReactionDiagram from "@/components/machine/bearings/BearingReactionDiagram";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import { resolveRatingsProvenance } from "@/data/bearings/constructionDefaults";
import {
  buildOperatingEnvelope,
  reliabilityLifeCurve,
  reliabilityPercentFromA1,
} from "@/lib/machine/bearings/bearingDecisionDashboard";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<BearingResult> | null;
  loadUnit: string;
  speedRpm: number;
  arrangement?: "single" | "back_to_back" | "face_to_face" | "tandem";
  workflowMode?: DesignWorkflowMode;
  diagnosis?: BearingDiagnosis | null;
  crossManufacturerRecommendation?: CrossManufacturerRecommendation | null;
  compareRows?: BearingCompareRow[];
  mountedBom?: MountedBomResult | null;
  inputRows?: ReportRow[];
  ratingsOverrideEnabled?: boolean;
  onSelectDesignation?: (designation: string) => void;
};

export default function BearingResults({
  result,
  loadUnit,
  speedRpm,
  arrangement = "single",
  workflowMode,
  diagnosis,
  crossManufacturerRecommendation = null,
  compareRows = [],
  mountedBom = null,
  inputRows = [],
  ratingsOverrideEnabled = false,
  onSelectDesignation,
}: Props) {
  const reportSections = useMemo(() => {
    if (!result) return undefined;
    return buildBearingReportSections(result, crossManufacturerRecommendation?.advisor ?? null);
  }, [result, crossManufacturerRecommendation?.advisor]);

  const reportCsvRows = useMemo(() => {
    if (!result) return undefined;
    return buildBearingCsvRows(result, crossManufacturerRecommendation?.advisor ?? null);
  }, [result, crossManufacturerRecommendation?.advisor]);

  const catalogEntry = result?.designation ? findBearing(result.designation) : undefined;
  const ratingsProvenance = resolveRatingsProvenance({
    ratingsOverrideEnabled,
    entry: catalogEntry,
  });

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

    const relCurve = reliabilityLifeCurve(result);
    const envelope = buildOperatingEnvelope(result, catalogEntry?.catalogFactors);
    const frDisp = envelope.frN.map((v) => fromBase(v, "force", loadUnit));
    const faDisp = envelope.faN.map((v) => fromBase(v, "force", loadUnit));
    const frDuty = fromBase(Math.abs(result.radialLoad), "force", loadUnit);
    const faDuty = fromBase(Math.abs(result.axialLoad), "force", loadUnit);

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
            series={[{ y: modifiedLives, label: "Modified life Lnm (aSKF)" }]}
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
        id: "reliability-life",
        label: "Reliability vs life",
        content: (
          <div className="space-y-2">
            <EngineeringPlot
              title="Modified life vs reliability (a₁)"
              x={relCurve.reliabilityPercent}
              y={relCurve.lifeHours}
              yLabel="Modified rating life Lnm"
              xLabel="Reliability"
              xUnit="%"
              unitLabel="h"
              probeX={reliabilityPercentFromA1(result.a1)}
              showPeak={false}
            />
            <p className="text-xs text-slate-500">
              Current a₁ = {formatDisplayNumber(result.a1)} scales Lnm from the ISO 281 Table 3
              reliability factors.
            </p>
          </div>
        ),
      },
      {
        id: "load-envelope",
        label: "Fr / Fa envelope",
        content: (
          <div className="space-y-2">
            <EngineeringPlot
              title="Radial / axial operating envelope (P ≤ P_allow at target life)"
              x={frDisp}
              y={faDisp}
              yLabel="Axial load Fa"
              xLabel="Radial load Fr"
              xUnit={loadUnit}
              unitLabel={loadUnit}
              probeX={frDuty}
              showPeak={false}
            />
            <p className="text-xs text-slate-500">
              Duty point: Fr = {formatDisplayNumber(frDuty)} {loadUnit}, Fa ={" "}
              {formatDisplayNumber(faDuty)} {loadUnit}. Curve is the ISO 281 equivalent-load
              capacity boundary at the required life (screening).
            </p>
          </div>
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
  }, [catalogEntry?.catalogFactors, loadUnit, result, speedRpm]);

  const viewTabs = useMemo(() => {
    if (!result) return [];

    const tabs: {
      id: CalculatorResultsViewId;
      label: string;
      icon: typeof LayoutDashboard;
      content: ReactNode;
    }[] = [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        content: (
          <div className="space-y-4">
            {workflowMode !== "diagnose" && crossManufacturerRecommendation?.primary ? (
              <BearingRecommendations
                result={result}
                recommendation={crossManufacturerRecommendation}
                compareRows={compareRows}
                onSelect={onSelectDesignation}
              />
            ) : null}
            {compareRows.length >= 2 ? <BearingCompareTable rows={compareRows} /> : null}
            {mountedBom ? <MountedBomPanel bom={mountedBom} compact /> : null}
            <BearingReactionDiagram result={result} loadUnit={loadUnit} />
            {result.bearingType ? (
              <BearingConstructionCard
                entry={catalogEntry}
                bearingType={result.bearingType}
                ratingsProvenance={ratingsProvenance}
              />
            ) : null}
            {result.geometry ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                <p>
                  Geometry preview: d={result.geometry.boreMm} · D={result.geometry.outerDiameterMm} · B=
                  {result.geometry.widthMm} mm
                </p>
                {result.bearingType ? (
                  <div className="mt-2">
                    <BearingReferenceVisual
                      bearingType={result.bearingType}
                      sealType={catalogEntry?.sealType ?? "open"}
                      arrangement={arrangement}
                      compact
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            <BearingAuxSpeedEnergyCard result={result} />
          </div>
        ),
      },
      {
        id: "life",
        label: "Life",
        icon: Gauge,
        content: (
          <div className="space-y-4">
            <BearingLifeFactorsCard result={result} />
            <EngineeringPlotPicker
              tabs={plotTabs.filter(
                (t) =>
                  t.id === "life-load" ||
                  t.id === "life-speed" ||
                  t.id === "reliability-life"
              )}
              defaultTabId="life-load"
              label="Life sensitivity"
              variant="segmented"
            />
          </div>
        ),
      },
      {
        id: "loads",
        label: "Loads",
        icon: Layers,
        content: (
          <div className="space-y-4">
            <BearingReactionDiagram result={result} loadUnit={loadUnit} />
            <BearingPairedStationsCard result={result} loadUnit={loadUnit} />
            <EngineeringPlotPicker
              tabs={plotTabs.filter(
                (t) =>
                  t.id === "load-envelope" ||
                  t.id === "static-margin" ||
                  t.id === "utilization"
              )}
              defaultTabId="load-envelope"
              label="Load margin charts"
              variant="segmented"
            />
          </div>
        ),
      },
      {
        id: "lubrication",
        label: "Lubrication",
        icon: Droplets,
        content: (
          <div className="space-y-4">
            <BearingRelubricationCard result={result} />
            <BearingThermalCard result={result} />
            <BearingThermalEquilibriumCard result={result} />
          </div>
        ),
      },
      {
        id: "arrangement",
        label: "Arrangement",
        icon: BookOpen,
        content: (
          <div className="space-y-4">
            <BearingReactionDiagram result={result} loadUnit={loadUnit} />
            <BearingDuplexStiffnessCard result={result} />
            {result.bearingType ? (
              <BearingReferenceVisual
                bearingType={result.bearingType}
                sealType={catalogEntry?.sealType ?? "open"}
                arrangement={arrangement}
                compact
              />
            ) : null}
          </div>
        ),
      },
      {
        id: "catalog",
        label: "Catalog",
        icon: BookOpen,
        content: (
          <div className="space-y-4">
            {result.bearingType ? (
              <BearingConstructionCard
                entry={catalogEntry}
                bearingType={result.bearingType}
                ratingsProvenance={ratingsProvenance}
              />
            ) : null}
            <BearingDefectFrequenciesCard result={result} />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ratings provenance: {ratingsProvenance.replace("_", " ")}. Confirm critical duty with OEM
              Product Select / datasheets — this catalog is representative screening.
            </p>
          </div>
        ),
      },
      {
        id: "charts",
        label: "Charts",
        icon: BarChart3,
        content: (
          <EngineeringPlotPicker
            tabs={plotTabs}
            defaultTabId="life-load"
            label="Sensitivity charts"
            variant="segmented"
          />
        ),
      },
      {
        id: "report",
        label: "Report",
        icon: FileText,
        content: <BearingReportPreview inputRows={inputRows} hasResult />,
      },
    ];

    if (workflowMode === "diagnose" && diagnosis) {
      tabs.splice(1, 0, {
        id: "diagnose",
        label: "Diagnose",
        icon: Stethoscope,
        content: (
          <BearingDiagnosisPanel diagnosis={diagnosis} onSelectReplacement={onSelectDesignation} />
        ),
      });
    }

    return tabs;
  }, [
    arrangement,
    catalogEntry,
    compareRows,
    crossManufacturerRecommendation,
    diagnosis,
    inputRows,
    loadUnit,
    mountedBom,
    onSelectDesignation,
    plotTabs,
    ratingsProvenance,
    result,
    workflowMode,
  ]);

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
      tableVariant="compact"
      qualityOverrides={chartModuleQuality()}
      inputRows={inputRows}
      reportSections={reportSections}
      reportMeta={{
        project: result?.designation ?? "Bearing selection",
        notes: crossManufacturerRecommendation?.advisor?.narrative,
      }}
      csvRows={reportCsvRows}
    >
      {result ? (
        <div className="space-y-4">
          <BearingDecisionDashboard result={result} />
          <BearingResultsMetrics
            result={result}
            loadUnit={loadUnit}
            catalogEntry={catalogEntry}
            ratingsProvenance={ratingsProvenance}
          />
          <BearingStatusBanner result={result} />
          <CalculatorResultsViewTabs
            tabs={viewTabs}
            defaultTab="overview"
            ariaLabel="Bearing results views"
          />
        </div>
      ) : null}
    </CalculatorResultsShell>
  );
}
