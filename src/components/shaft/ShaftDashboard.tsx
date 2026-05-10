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
        color: "text-green-400",
        bg: "bg-green-900/30",
        border: "border-green-600",
      };
    }
    return {
      label: "Unsafe",
      color: "text-red-400",
      bg: "bg-red-900/30",
      border: "border-red-600",
    };
  }, [result.isSafe]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`rounded-lg p-4 border ${safetyStatus.bg} ${safetyStatus.border}`}>
          <div className="text-xs text-slate-400 mb-1">Status</div>
          <div className={`text-lg font-bold ${safetyStatus.color}`}>
            {safetyStatus.label}
          </div>
        </div>

        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600">
          <div className="text-xs text-slate-400 mb-1">Safety Factor</div>
          <div className="text-lg font-bold text-blue-400">
            {result.safetyFactor.toFixed(2)}
          </div>
        </div>

        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600">
          <div className="text-xs text-slate-400 mb-1">Diameter</div>
          <div className="text-lg font-bold text-purple-400">
            {(result.diameter * 1000).toFixed(1)} mm
          </div>
        </div>

        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-600">
          <div className="text-xs text-slate-400 mb-1">Critical Section</div>
          <div className="text-sm font-bold text-orange-400">
            @ {result.criticalSection.toFixed(3)} m
          </div>
        </div>
      </div>

      {/* Stress Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Max Combined Stress</div>
          <div className="text-2xl font-bold text-red-400">
            {(result.maxCombinedStress / 1e6).toFixed(2)} MPa
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Max Shear Stress</div>
          <div className="text-2xl font-bold text-orange-400">
            {(result.maxShearStress / 1e6).toFixed(2)} MPa
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Max Bending Stress</div>
          <div className="text-2xl font-bold text-yellow-400">
            {(result.maxBendingStress / 1e6).toFixed(2)} MPa
          </div>
        </div>
      </div>

      {/* Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Shear Stress Distribution</h3>
          <EngineeringPlot
            title="Torsional Shear Stress"
            x={result.x}
            y={result.shearStress}
            yLabel="Shear Stress (Pa)"
          />
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Bending Stress Distribution</h3>
          <EngineeringPlot
            title="Bending Stress"
            x={result.x}
            y={result.bendingStress}
            yLabel="Bending Stress (Pa)"
          />
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Combined Stress (Von Mises)</h3>
          <EngineeringPlot
            title="Combined Stress"
            x={result.x}
            y={result.combinedStress}
            yLabel="Stress (Pa)"
          />
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Deflection</h3>
          <EngineeringPlot
            title="Bending Deflection"
            x={result.x}
            y={result.deflection}
            yLabel="Deflection (m)"
          />
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Torsional Rotation</h3>
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
        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Polar Moment</div>
          <div className="font-semibold text-white">
            {(result.polarMoment * 1e12).toFixed(2)} mm⁴
          </div>
        </div>

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Second Moment</div>
          <div className="font-semibold text-white">
            {(result.secondMoment * 1e12).toFixed(2)} mm⁴
          </div>
        </div>

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Max Deflection</div>
          <div className="font-semibold text-white">
            {(result.maxDeflection * 1000).toFixed(4)} mm
          </div>
        </div>

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Max Rotation</div>
          <div className="font-semibold text-white">
            {(result.maxRotation * 1000).toFixed(4)} mrad
          </div>
        </div>
      </div>
    </div>
  );
}
