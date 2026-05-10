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
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    }
    return {
      label: "At Risk",
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
          <div className="text-xs text-gray-500 mb-1">Slenderness Ratio</div>
          <div className="text-lg font-bold text-purple-600">
            {result.slenderness.toFixed(1)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Buckling Mode</div>
          <div className="text-sm font-bold text-orange-600">
            {result.bucklingMode.charAt(0).toUpperCase() +
              result.bucklingMode.slice(1)}
          </div>
        </div>
      </div>

      {/* Load Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Critical Load (Pcr)</div>
          <div className="text-2xl font-bold text-blue-600">
            {(result.Pcr / 1000).toFixed(1)} kN
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Critical Stress</div>
          <div className="text-2xl font-bold text-blue-600">
            {(result.criticalStress / 1e6).toFixed(2)} MPa
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Applied Stress</div>
          <div className="text-2xl font-bold text-orange-600">
            {(result.stress / 1e6).toFixed(2)} MPa
          </div>
        </div>
      </div>

      {/* Buckling Mode Shape */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Effective Length</div>
          <div className="font-semibold text-gray-900">
            {result.Le.toFixed(3)} m
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Radius of Gyration</div>
          <div className="font-semibold text-gray-900">
            {result.radius.toExponential(3)} m
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Effective Length Factor (k)</div>
          <div className="font-semibold text-gray-900">{result.k.toFixed(2)}</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-gray-500 mb-1">Buckling Formula</div>
          <div className="font-semibold text-gray-900">Euler</div>
        </div>
      </div>
    </div>
  );
}
