"use client";

import { useMemo, type ReactNode } from "react";
import { BarChart3, FileText, Stethoscope, Table2 } from "lucide-react";
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
import BearingResultsViewTabs, {
  type BearingResultsViewId,
} from "@/components/machine/bearings/BearingResultsViewTabs";
import { findBearing } from "@/data/catalogs/bearingCatalog";

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

  const summaryContent = result ? (
    <div className="space-y-4">
      {workflowMode !== "diagnose" && crossManufacturerRecommendation?.primary ? (
        <BearingRecommendations
          result={result}
          recommendation={crossManufacturerRecommendation}
          onSelect={onSelectDesignation}
        />
      ) : null}
      {compareRows.length >= 2 ? <BearingCompareTable rows={compareRows} /> : null}
      {mountedBom ? <MountedBomPanel bom={mountedBom} compact /> : null}

      <BearingLifeFactorsCard result={result} />
      <BearingPairedStationsCard result={result} loadUnit={loadUnit} />
      <BearingDuplexStiffnessCard result={result} />
      <BearingThermalEquilibriumCard result={result} />
      <BearingThermalCard result={result} />
      <BearingRelubricationCard result={result} />
      <BearingAuxSpeedEnergyCard result={result} />
      <BearingDefectFrequenciesCard result={result} />
      {result.bearingType ? (
        <BearingReferenceVisual
          bearingType={result.bearingType}
          sealType={catalogEntry?.sealType ?? "open"}
          arrangement={arrangement}
          compact
        />
      ) : null}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Full parameter table is above. SKF rating life Lnm uses a₁ · aSKF · (C/P)^p per ISO 281:2007.
      </p>
    </div>
  ) : null;

  const viewTabs = useMemo(() => {
    if (!result) return [];

    const tabs: {
      id: BearingResultsViewId;
      label: string;
      icon: typeof Table2;
      content: ReactNode;
    }[] = [
      { id: "summary", label: "Summary", icon: Table2, content: summaryContent },
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
      tabs.splice(2, 0, {
        id: "diagnose",
        label: "Diagnose",
        icon: Stethoscope,
        content: (
          <BearingDiagnosisPanel diagnosis={diagnosis} onSelectReplacement={onSelectDesignation} />
        ),
      });
    }

    return tabs;
  }, [diagnosis, inputRows, onSelectDesignation, plotTabs, result, summaryContent, workflowMode]);

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
        <div className="space-y-4">
          <BearingResultsMetrics result={result} loadUnit={loadUnit} catalogEntry={catalogEntry} />
          <BearingStatusBanner result={result} />
          <BearingResultsViewTabs tabs={viewTabs} defaultTab="summary" />
        </div>
      ) : null}
    </CalculatorResultsShell>
  );
}
