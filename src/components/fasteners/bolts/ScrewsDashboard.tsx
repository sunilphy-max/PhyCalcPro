"use client";

import type { ScrewResult } from "@/lib/fasteners/bolts/types";

type Props = {
  result: ScrewResult;
};

export default function ScrewsDashboard({ result }: Props) {
  const formatStress = (stress: number) => {
    if (stress < 1e6) return `${(stress / 1000).toFixed(1)} kPa`;
    return `${(stress / 1e6).toFixed(2)} MPa`;
  };

  const formatTorque = (torque: number) => {
    return `${torque.toFixed(2)} N·m`;
  };

  const formatPower = (power: number) => {
    if (power < 1000) return `${power.toFixed(1)} W`;
    return `${(power / 1000).toFixed(2)} kW`;
  };

  const formatForce = (force: number) => {
    if (force < 1000) return `${force.toFixed(0)} N`;
    return `${(force / 1000).toFixed(2)} kN`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Design Status */}
      <div className={`bg-gray-50 rounded-lg p-4 border-2 ${
        result.designStatus === "safe" ? "border-green-200" :
        result.designStatus === "warning" ? "border-yellow-200" : "border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Design Status</div>
            <div className={`text-lg font-bold capitalize ${getStatusColor(result.designStatus)}`}>
              {result.designStatus}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Safety Factor</div>
            <div className="text-lg font-bold text-blue-600">
              {result.safetyFactor.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs text-gray-600 mb-1">Screw Type</div>
          <div className="text-lg font-bold text-blue-600 capitalize">
            {result.screwType.replace("_", " ")}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-xs text-gray-600 mb-1">Major Diameter</div>
          <div className="text-lg font-bold text-green-600">
            {(result.majorDiameter * 1000).toFixed(1)} mm
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-xs text-gray-600 mb-1">Pitch</div>
          <div className="text-lg font-bold text-purple-600">
            {(result.pitch * 1000).toFixed(2)} mm
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-xs text-gray-600 mb-1">Helix Angle</div>
          <div className="text-lg font-bold text-orange-600">
            {result.helixAngle.toFixed(1)}°
          </div>
        </div>
      </div>

      {/* Force Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="font-semibold mb-3">Force Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Axial Force:</span>
              <span className="font-mono">{formatForce(result.axialForce)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Torque:</span>
              <span className="font-mono">{formatTorque(result.torque)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Efficiency:</span>
              <span className="font-mono">{result.efficiency.toFixed(1)}%</span>
            </div>
            {result.power > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Power:</span>
                <span className="font-mono">{formatPower(result.power)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="font-semibold mb-3">Stress Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Shear Stress:</span>
              <span className="font-mono">{formatStress(result.shearStress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compressive Stress:</span>
              <span className="font-mono">{formatStress(result.compressiveStress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Von Mises Stress:</span>
              <span className="font-mono">{formatStress(result.vonMisesStress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fatigue Safety:</span>
              <span className="font-mono">{result.fatigueSafetyFactor.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ball Screw Specific */}
      {result.screwType === "ball_screw" && result.ballCirculation && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="font-semibold mb-3">Ball Screw Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Balls per Circuit:</span>
                <span className="font-mono">{result.ballCirculation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recirculation:</span>
                <span className="font-mono">{result.recirculationPath}</span>
              </div>
              {result.dynamicLoadRating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dynamic Load Rating:</span>
                  <span className="font-mono">{formatForce(result.dynamicLoadRating)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="font-semibold mb-3">Operating Limits</h3>
            <div className="space-y-2 text-sm">
              {result.speed && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Operating Speed:</span>
                  <span className="font-mono">{result.speed.toFixed(0)} rpm</span>
                </div>
              )}
              {result.criticalSpeed && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Critical Speed:</span>
                  <span className="font-mono">{result.criticalSpeed.toFixed(0)} rpm</span>
                </div>
              )}
              {result.bucklingLoad && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Buckling Load:</span>
                  <span className="font-mono">{formatForce(result.bucklingLoad)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Power Screw Specific */}
      {result.screwType === "power_screw" && result.threadType && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="font-semibold mb-3">Power Screw Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Thread Type:</span>
              <span className="capitalize">{result.threadType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lead:</span>
              <span className="font-mono">{(result.lead * 1000).toFixed(2)} mm</span>
            </div>
            {result.criticalSpeed && (
              <div className="flex justify-between">
                <span className="text-gray-600">Critical Speed:</span>
                <span className="font-mono">{result.criticalSpeed.toFixed(0)} rpm</span>
              </div>
            )}
            {result.bucklingLoad && (
              <div className="flex justify-between">
                <span className="text-gray-600">Buckling Load:</span>
                <span className="font-mono">{formatForce(result.bucklingLoad)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3">Recommendations</h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}