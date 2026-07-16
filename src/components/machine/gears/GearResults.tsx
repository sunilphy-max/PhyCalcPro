"use client";

import { useMemo } from "react";
import { fromBase } from "@/lib/units/conversions";
import type { GearResult } from "@/lib/machine/gears/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { CalculationSpec } from "@/lib/standards/types";
import GearMeshPreview from "@/components/shared/geometry/GearMeshPreview";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (GearResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function GearResults({ result, lengthUnit, stressUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const loadMultipliers = Array.from({ length: 11 }, (_, i) => 0.5 + i * 0.1);
    const bending = loadMultipliers.map((m) =>
      fromBase(result.bendingStress * m, "stress", stressUnit)
    );
    const sf = loadMultipliers.map((m) => result.safetyFactor / Math.max(m, 1e-9));
    const isoSf =
      result.iso6336BendingSafetyFactor != null
        ? loadMultipliers.map((m) => (result.iso6336BendingSafetyFactor ?? 0) / Math.max(m, 1e-9))
        : null;

    return [
      {
        id: "mesh",
        label: "Gear mesh",
        content: (
          <GearMeshPreview
            moduleMm={result.module * 1000}
            pinionTeeth={result.pinionTeeth}
            gearTeeth={result.gearTeeth}
            faceWidthMm={result.faceWidth * 1000}
          />
        ),
      },
      {
        id: "stress-load",
        label: "Bending stress",
        content: (
          <EngineeringPlot
            title="Root bending stress vs load multiplier"
            x={loadMultipliers}
            y={bending}
            yLabel="Root bending stress"
            xLabel="Load multiplier"
            xUnit="—"
            unitLabel={stressUnit}
            probeX={1}
            showPeak={false}
          />
        ),
      },
      {
        id: "safety-load",
        label: "Safety factor",
        content: (
          <EngineeringPlot
            title="Bending safety factor vs load multiplier"
            x={loadMultipliers}
            y={sf}
            yLabel="Safety factor"
            xLabel="Load multiplier"
            xUnit="—"
            unitLabel="—"
            probeX={1}
            showPeak={false}
            series={
              isoSf
                ? [
                    {
                      y: isoSf,
                      label: "ISO 6336 S_F (screening)",
                      unitLabel: "—",
                      color: "#10b981",
                    },
                  ]
                : undefined
            }
          />
        ),
      },
    ];
  }, [result, stressUnit]);

  return (
    <CalculatorResultsShell
      moduleId="gears"
      fileName="gear"
      title="Export Gear results"
      description="Export the current summary and charts for review."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Run the analysis to review gear geometry and root bending stress."
      heading="Gear results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "actualRatio", value: result.actualRatio },
              { metric: "torque", value: result.torque },
              { metric: "bendingStress", value: result.bendingStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Pinion pitch diameter"
              numericValue={fromBase(result.pitchDiameterPinion, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Gear pitch diameter"
              numericValue={fromBase(result.pitchDiameterGear, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard label="Actual ratio" numericValue={result.actualRatio} unit="—" tone="purple" />
            <CalculatorMetricCard label="Lewis factor" numericValue={result.lewisY} unit="—" tone="purple" />
            <CalculatorMetricCard label="Torque" numericValue={result.torque} unit="N·m" tone="orange" />
            <CalculatorMetricCard
              label="Tangential force"
              numericValue={result.tangentialForce}
              unit="N"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Root bending stress"
              numericValue={fromBase(result.bendingStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="amber"
            />
            <CalculatorMetricCard
              label="Allowable stress"
              numericValue={fromBase(result.allowableStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="amber"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Bending safety factor"
            numericValue={result.safetyFactor}
            unit="—"
            status={result.safetyFactor >= 1.5 ? "safe" : "danger"}
            size="lg"
          />
          {result.iso6336BendingSafetyFactor != null ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="ISO 6336 bending S_F"
                numericValue={result.iso6336BendingSafetyFactor}
                unit="—"
                tone="green"
              />
              <CalculatorMetricCard
                label="ISO 6336 pitting S_H"
                numericValue={result.iso6336ContactSafetyFactor ?? 0}
                unit="—"
                tone="green"
              />
              {result.scuffingSafetyFactor != null ? (
                <CalculatorMetricCard
                  label="Scuffing screening"
                  numericValue={result.scuffingSafetyFactor}
                  unit="—"
                  tone="purple"
                />
              ) : null}
              {result.micropittingSafetyFactor != null ? (
                <CalculatorMetricCard
                  label="Micropitting screening"
                  numericValue={result.micropittingSafetyFactor}
                  unit="—"
                  tone="purple"
                />
              ) : null}
            </CalculatorMetricGrid>
          ) : null}
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="mesh" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
