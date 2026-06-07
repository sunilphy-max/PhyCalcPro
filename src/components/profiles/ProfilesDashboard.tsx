"use client";

import type { AreaPropertiesResult } from "@/lib/profiles/types";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  CalculatorPlotSection,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: AreaPropertiesResult;
};

export default function ProfilesDashboard({ result }: Props) {
  const formatInertia = (num: number) => formatEngineeringValue(num, "m⁴");

  return (
    <div className="grid grid-cols-1 gap-4">
      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Cross-Sectional Area"
          value={formatEngineeringValue(result.area, "m²")}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Centroid X"
          value={formatEngineeringValue(result.centroid.x, "m")}
          tone="green"
        />
        <CalculatorMetricCard
          label="Centroid Y"
          value={formatEngineeringValue(result.centroid.y, "m")}
          tone="green"
        />
        <CalculatorMetricCard
          label="Polar Moment"
          value={formatInertia(result.j)}
          tone="purple"
        />
      </CalculatorMetricGrid>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CalculatorPlotSection title="Second Moments of Area">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ixx (about x-axis):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.ixx)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Iyy (about y-axis):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.iyy)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ixy (product):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.ixy)}</span>
            </div>
          </div>
        </CalculatorPlotSection>

        <CalculatorPlotSection title="Principal Moments">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">I₁ (max principal):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.i1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">I₂ (min principal):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.i2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Principal angle θ:</span>
              <span className="text-gray-900 font-mono">{result.theta.toFixed(2)}°</span>
            </div>
          </div>
        </CalculatorPlotSection>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CalculatorPlotSection title="Section Moduli">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sx (about x-axis):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.sx)}/m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sy (about y-axis):</span>
              <span className="text-gray-900 font-mono">{formatInertia(result.sy)}/m</span>
            </div>
          </div>
        </CalculatorPlotSection>

        <CalculatorPlotSection title="Shape Information">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Shape type:</span>
              <span className="text-gray-900 capitalize">{result.shapeData?.shape || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Radius of gyration (x):</span>
              <span className="text-gray-900 font-mono">
                {result.ixx > 0 ? Math.sqrt(result.ixx / result.area).toExponential(3) : "N/A"} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Radius of gyration (y):</span>
              <span className="text-gray-900 font-mono">
                {result.iyy > 0 ? Math.sqrt(result.iyy / result.area).toExponential(3) : "N/A"} m
              </span>
            </div>
          </div>
        </CalculatorPlotSection>
      </div>

      <CalculatorPlotSection title="Cross-Section Visualization">
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded border border-gray-200">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📐</div>
            <div className="text-sm">
              {result.shapeData?.shape ? `${result.shapeData.shape} cross-section` : "Shape visualization"}
            </div>
            <div className="text-xs mt-1">
              Area: {formatEngineeringValue(result.area, "m²")}
            </div>
          </div>
        </div>
      </CalculatorPlotSection>
    </div>
  );
}
