"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ShaftDashboard from "./ShaftDashboard";
import type { LoadCase, ShaftResult } from "@/lib/machine/shafts/types";
import type { ShaftCatalogBearingPick } from "@/lib/machine/shafts/shaftBearingCatalog";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";

type LayoutPreview = {
  length: number;
  diameter: number;
  loads: LoadCase[];
  supports?: import("@/lib/machine/shafts/types").BearingSupport[];
  lengthUnit?: string;
};

type Props = {
  result: WithCalculationSpec<ShaftResult> | null;
  projectName: string;
  layout?: LayoutPreview;
  lengthUnit?: string;
  forceUnit?: string;
  operatingRpm?: number;
  shaftDiameterM?: number;
  bearingCatalogPicks?: ShaftCatalogBearingPick[];
  onBearingCatalogPick?: (positionM: number, designation: string | null) => void;
  workflowMode?: DesignWorkflowMode;
};

export default function ShaftResults({
  result,
  projectName,
  layout,
  lengthUnit = "m",
  forceUnit = "N",
  operatingRpm = 0,
  shaftDiameterM,
  bearingCatalogPicks = [],
  onBearingCatalogPick,
  workflowMode,
}: Props) {
  return (
    <CalculatorResultsShell
      moduleId="shafts"
      fileName={projectName || "shaft"}
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Shaft results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter shaft geometry, supports, and loads, then calculate."
      heading="Shaft Results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "maxStress", value: result.maxStress },
              { metric: "maxPrincipalStress", value: result.maxPrincipalStress },
              { metric: "maxDeflection", value: result.maxDeflection },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "criticalSpeed", value: result.criticalSpeed },
              { metric: "criticalSpeedMargin", value: result.criticalSpeedMargin ?? 0 },
              { metric: "fatigueSafetyFactor", value: result.fatigueSafetyFactor ?? 0 },
              { metric: "din743FatigueSF", value: result.din743Worksheet?.governingFatigueSF ?? 0 },
              { metric: "din743StaticSF", value: result.din743Worksheet?.governingStaticSF ?? 0 },
              { metric: "keyShearSafety", value: result.keysDesign?.shearSafety ?? 0 },
              {
                metric: "bearingL10_0",
                value: result.bearingLifeScreens[0]?.estimatedL10Hours ?? 0,
              },
            ]
          : undefined
      }
    >
      {result ? (
        <ShaftDashboard
          result={result}
          layout={layout}
          lengthUnit={lengthUnit}
          forceUnit={forceUnit}
          operatingRpm={operatingRpm}
          shaftDiameterM={shaftDiameterM ?? result.diameter ?? 0}
          bearingCatalogPicks={bearingCatalogPicks}
          onBearingCatalogPick={onBearingCatalogPick}
          workflowMode={workflowMode}
        />
      ) : null}
    </CalculatorResultsShell>
  );
}
