"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { ShaftResult } from "@/lib/shaft/types";

type Props = {
  result: ShaftResult;
};

export default function ShaftDashboard({ result }: Props) {
  const safetyStatus = useMemo(() => {
    if (result.isSafe) {
      return {
        label: "Safe",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    }
    return {
      label: "Unsafe",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  }, [result.isSafe]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`rounded-xl p-3 ${safetyStatus.bg} border ${safetyStatus.border}`}>
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <div className={`text-lg font-bold ${safetyStatus.color}`}>
            {safetyStatus.label}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Safety Factor</div>
          <div className="text-lg font-bold text-blue-600">
            {result.safetyFactor.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Diameter</div>
          <div className="text-lg font-bold text-purple-600">
            {(result.diameter * 1000).toFixed(1)} mm
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Critical Section</div>
          <div className="text-sm font-bold text-orange-600">
            @ {result.criticalSection.toFixed(3)} m
          </div>
        </div>
      </div>

      {/* Stress Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Max Combined Stress</div>
          <div className="text-2xl font-bold text-red-600">
            {(result.maxCombinedStress / 1e6).toFixed(2)} MPa
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Max Shear Stress</div>
          <div className="text-2xl font-bold text-orange-600">
            {(result.maxShearStress / 1e6).toFixed(2)} MPa
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Max Bending Stress</div>
          <div className="text-2xl font-bold text-yellow-600">
            {(result.maxBendingStress / 1e6).toFixed(2)} MPa
          </div>
        </div>
      </div>

      {/* Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Shear Stress Distribution</h3>
          <EngineeringPlot
            title="Torsional Shear Stress"
            x={result.x}
            y={result.shearStress}
            yLabel="Shear Stress (Pa)"
          />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Bending Stress Distribution</h3>
          <EngineeringPlot
            title="Bending Stress"
            x={result.x}
            y={result.bendingStress}
            yLabel="Bending Stress (Pa)"
          />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Combined Stress (Von Mises)</h3>
          <EngineeringPlot
            title="Combined Stress"
            x={result.x}
            y={result.combinedStress}
            yLabel="Stress (Pa)"
          />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Deflection</h3>
          <EngineeringPlot
            title="Bending Deflection"
            x={result.x}
            y={result.deflection}
            yLabel="Deflection (m)"
          />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Torsional Rotation</h3>
          <EngineeringPlot
            title="Rotation"
            x={result.x}
            y={result.rotation}
            yLabel="Rotation (rad)"
          />
        </div>
      </div>

      {/* Geometry Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Polar Moment</div>
          <div className="font-semibold text-gray-900">
            {(result.polarMoment * 1e12).toFixed(2)} mm⁴
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Second Moment</div>
          <div className="font-semibold text-gray-900">
            {(result.secondMoment * 1e12).toFixed(2)} mm⁴
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Max Deflection</div>
          <div className="font-semibold text-gray-900">
            {(result.maxDeflection * 1000).toFixed(3)} mm
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Max Rotation</div>
          <div className="font-semibold text-gray-900">
            {(result.maxRotation * 180 / Math.PI).toFixed(3)}°
          </div>
        </div>
      </div>
    </div>
  );
}