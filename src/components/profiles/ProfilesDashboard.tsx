"use client";

import { useMemo } from "react";
import type { AreaPropertiesResult } from "@/lib/profiles/types";

type Props = {
  result: AreaPropertiesResult;
};

export default function ProfilesDashboard({ result }: Props) {
  const formatNumber = (num: number, decimals: number = 6) => {
    if (Math.abs(num) < 1e-10) return "0";
    return num.toExponential(decimals);
  };

  const formatArea = (num: number) => {
    if (num < 1e-4) return `${(num * 1e6).toFixed(2)} mm²`;
    if (num < 1e-1) return `${(num * 1e4).toFixed(2)} cm²`;
    return `${num.toFixed(4)} m²`;
  };

  const formatInertia = (num: number) => {
    if (num < 1e-8) return `${(num * 1e12).toFixed(2)} mm⁴`;
    if (num < 1e-4) return `${(num * 1e8).toFixed(2)} cm⁴`;
    return `${num.toExponential(3)} m⁴`;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Basic Properties */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Cross-Sectional Area</div>
          <div className="text-lg font-bold text-blue-600">
            {formatArea(result.area)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Centroid X</div>
          <div className="text-lg font-bold text-green-600">
            {(result.centroid.x * 1000).toFixed(2)} mm
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Centroid Y</div>
          <div className="text-lg font-bold text-green-600">
            {(result.centroid.y * 1000).toFixed(2)} mm
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Polar Moment</div>
          <div className="text-sm font-bold text-purple-600">
            {formatInertia(result.j)}
          </div>
        </div>
      </div>

      {/* Moments of Inertia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Second Moments of Area</h3>
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
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Principal Moments</h3>
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
        </div>
      </div>

      {/* Section Moduli */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Section Moduli</h3>
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
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Shape Information</h3>
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
        </div>
      </div>

      {/* Shape Visualization Placeholder */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Cross-Section Visualization</h3>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded border border-gray-200">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📐</div>
            <div className="text-sm">
              {result.shapeData?.shape ? `${result.shapeData.shape} cross-section` : "Shape visualization"}
            </div>
            <div className="text-xs mt-1">
              Area: {formatArea(result.area)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
