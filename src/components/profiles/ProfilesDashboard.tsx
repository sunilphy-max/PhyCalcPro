"use client";

import { useMemo } from "react";
import type { AreaPropertiesResult } from "@/lib/profiles/types";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import ProfileCrossSectionPreview from "./ProfileCrossSectionPreview";
import type { ShapeProperties } from "@/lib/profiles/types";

type Props = {
  result: AreaPropertiesResult;
};

function DetailRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="space-y-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">{row.label}</span>
          <span className="font-mono text-slate-900 dark:text-slate-100">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProfilesDashboard({ result }: Props) {
  const formatInertia = (num: number) => formatEngineeringValue(num, "m⁴");

  const plotTabs = useMemo((): PlotPickerTab[] => {
    return [
      {
        id: "visualization",
        label: "Cross-section",
        content: result.shapeData?.shape ? (
          <ProfileCrossSectionPreview
            shape={result.shapeData as ShapeProperties}
            area={result.area}
          />
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No shape outline available.</p>
        ),
      },
      {
        id: "second-moments",
        label: "Second moments",
        content: (
          <DetailRows
            rows={[
              { label: "Ixx (about x-axis):", value: formatInertia(result.ixx) },
              { label: "Iyy (about y-axis):", value: formatInertia(result.iyy) },
              { label: "Ixy (product):", value: formatInertia(result.ixy) },
            ]}
          />
        ),
      },
      {
        id: "principal",
        label: "Principal moments",
        content: (
          <DetailRows
            rows={[
              { label: "I₁ (max principal):", value: formatInertia(result.i1) },
              { label: "I₂ (min principal):", value: formatInertia(result.i2) },
              { label: "Principal angle θ:", value: `${result.theta.toFixed(2)}°` },
            ]}
          />
        ),
      },
      {
        id: "moduli",
        label: "Section moduli",
        content: (
          <DetailRows
            rows={[
              { label: "Sx (about x-axis):", value: `${formatInertia(result.sx)}/m` },
              { label: "Sy (about y-axis):", value: `${formatInertia(result.sy)}/m` },
            ]}
          />
        ),
      },
      {
        id: "shape-info",
        label: "Shape details",
        content: (
          <DetailRows
            rows={[
              {
                label: "Shape type:",
                value: result.shapeData?.shape ? result.shapeData.shape : "Unknown",
              },
              {
                label: "Radius of gyration (x):",
                value:
                  result.ixx > 0
                    ? `${Math.sqrt(result.ixx / result.area).toExponential(3)} m`
                    : "N/A",
              },
              {
                label: "Radius of gyration (y):",
                value:
                  result.iyy > 0
                    ? `${Math.sqrt(result.iyy / result.area).toExponential(3)} m`
                    : "N/A",
              },
            ]}
          />
        ),
      },
    ];
  }, [result]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Cross-sectional area"
          numericValue={result.area} unit="m²"
          tone="blue"
        />
        <CalculatorMetricCard
          label="Centroid X"
          numericValue={result.centroid.x} unit="m"
          tone="green"
        />
        <CalculatorMetricCard
          label="Centroid Y"
          numericValue={result.centroid.y} unit="m"
          tone="green"
        />
        <CalculatorMetricCard label="Polar moment" numericValue={result.j} unit="m⁴" tone="purple" />
      </CalculatorMetricGrid>

      <EngineeringPlotPicker tabs={plotTabs} defaultTabId="visualization" label="Section view" />
    </div>
  );
}
