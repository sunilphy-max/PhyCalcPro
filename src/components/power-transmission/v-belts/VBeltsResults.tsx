"use client";

import { useMemo } from "react";
import { fromBase } from "@/lib/units/conversions";
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
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (VBeltResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  centerDistance: number;
  diameterDriver: number;
  diameterDriven: number;
};

export default function VBeltsResults({
  result,
  lengthUnit,
  centerDistance,
  diameterDriver,
  diameterDriven,
}: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    return [
      {
        id: "layout",
        label: "Drive layout",
        content: (
          <VBeltLayoutPreview
            centerDistance={fromBase(centerDistance, "length", lengthUnit)}
            driverDiameter={fromBase(diameterDriver, "length", lengthUnit)}
            drivenDiameter={fromBase(diameterDriven, "length", lengthUnit)}
            wrapAngleDriverDeg={result.wrapAngleDriver}
            lengthUnit={lengthUnit}
          />
        ),
      },
    ];
  }, [centerDistance, diameterDriven, diameterDriver, lengthUnit, result]);

  return (
    <CalculatorResultsShell
      moduleId="v-belts"
      fileName="v-belt-drive"
      title="Export V-belt results"
      description="Export drive sizing summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pulley data and calculate the drive."
      heading="V-belt drive results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "beltLength", value: result.beltLength },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "pretensionEstimate", value: result.pretensionEstimate },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Belt length"
              value={`${formatDisplayNumber(fromBase(result.beltLength, "length", lengthUnit))} ${lengthUnit}`}
              tone="blue"
            />
            <CalculatorMetricCard label="Speed ratio" value={formatDisplayNumber(result.ratio)} tone="purple" />
            <CalculatorMetricCard
              label="Wrap angle (driver)"
              value={`${formatDisplayNumber(result.wrapAngleDriver)}°`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Belt speed"
              value={`${formatDisplayNumber(result.beltSpeed)} m/s`}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Power utilization"
            numericValue={result.powerUtilization}
            status={result.powerUtilization > 1 ? "danger" : "safe"}
            size="lg"
          />
          <CalculatorMetricCard
            label="Pretension estimate"
            value={`${formatDisplayNumber(result.pretensionEstimate)} N`}
            tone="orange"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="layout" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
