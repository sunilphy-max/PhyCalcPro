"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { BucklingResult } from "@/lib/buckling/types";

type Props = {
  result: BucklingResult;
};

export default function BucklingDashboard({ result }: Props) {
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
      label: "At Risk",
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
          <div className="text-xs text-slate-400 mb-1">Slenderness Ratio</div>
          <div className="text-lg font-bold text-purple-400">
            {result.slenderness.toFixed(1)}
          </div>
        </div>

        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-600">
          <div className="text-xs text-slate-400 mb-1">Buckling Mode</div>
          <div className="text-sm font-bold text-orange-400">
            {result.bucklingMode.charAt(0).toUpperCase() +
              result.bucklingMode.slice(1)}
          </div>
        </div>
      </div>

      {/* Load Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Critical Load (Pcr)</div>
          <div className="text-2xl font-bold text-blue-400">
            {(result.Pcr / 1000).toFixed(1)} kN
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Critical Stress</div>
          <div className="text-2xl font-bold text-blue-400">
            {(result.criticalStress / 1e6).toFixed(2)} MPa
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Applied Stress</div>
          <div className="text-2xl font-bold text-orange-400">
            {(result.stress / 1e6).toFixed(2)} MPa
          </div>
        </div>
      </div>

      {/* Buckling Mode Shape */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Buckling Mode Shape
        </h3>
        <EngineeringPlot
          title="Mode Shape"
          x={result.x}
          y={result.deflection}
          yLabel="Deflection"
        />
      </div>

      {/* Column Geometry Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Effective Length</div>
          <div className="font-semibold text-white">
            {result.Le.toFixed(3)} m
          </div>
        </div>

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Radius of Gyration</div>
          <div className="font-semibold text-white">
            {result.radius.toExponential(3)} m
          </div>
        </div>

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Effective Length Factor (k)</div>
          <div className="font-semibold text-white">{result.k.toFixed(2)}</div>
        </div>

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
          <div className="text-slate-400 mb-1">Buckling Formula</div>
          <div className="font-semibold text-white">Euler</div>
        </div>
      </div>
    </div>
  );
}
