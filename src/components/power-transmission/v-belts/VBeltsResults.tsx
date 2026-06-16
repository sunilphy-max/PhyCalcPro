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

export default function VBeltsResults({ result, lengthUnit, serviceFactor }: Props) {
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
      description="Drive sizing summary with geometry, belt count, tensions, and shaft loads."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter motor power, driver and driven speeds, then size the drive."
      heading="V-belt drive results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "beltSection", value: result.beltSection },
              { metric: "numberOfBelts", value: result.numberOfBelts },
              { metric: "ratio", value: result.ratio },
              { metric: "beltLength_m", value: result.beltLength },
              { metric: "standardBeltLength_mm", value: result.standardBeltLengthMm },
              { metric: "beltSpeed_m_s", value: result.beltSpeed },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "tightSideTension_N", value: result.tightSideTension },
              { metric: "slackSideTension_N", value: result.slackSideTension },
              { metric: "radialLoadDriver_N", value: result.radialLoadDriver },
              { metric: "radialLoadDriven_N", value: result.radialLoadDriven },
              { metric: "driverTorque_Nm", value: result.driverTorque },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Belt type"
              value={`${result.beltSection} × ${result.numberOfBelts}`}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Speed ratio"
              value={formatDisplayNumber(result.ratio)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Center distance"
              value={`${formatDisplayNumber(fromBase(result.centerDistance, "length", lengthUnit))} ${lengthUnit}`}
              tone="blue"
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

          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Belt speed"
              value={formatEngineeringValue(result.beltSpeed, "m/s")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Wrap angle (driver)"
              value={`${formatDisplayNumber(result.wrapAngleDriver)}°`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Service factor"
              value={formatDisplayNumber(serviceFactor)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Design power"
              value={`${formatDisplayNumber(result.designPowerKw)} kW`}
              tone="orange"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricCard
            label="Power utilization"
            value={`${formatDisplayNumber(result.powerUtilization)} · ${result.numberOfBelts} belt(s)`}
            status={result.powerUtilization > 1 ? "danger" : result.powerUtilization > 0.85 ? "warning" : "safe"}
            size="lg"
          />

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
              label="Driver shaft load"
              value={formatEngineeringValue(result.radialLoadDriver, "N")}
              tone="red"
            />
            <CalculatorMetricCard
              label="Driven shaft load"
              value={formatEngineeringValue(result.radialLoadDriven, "N")}
              tone="red"
            />
          </CalculatorMetricGrid>

          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="layout" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
