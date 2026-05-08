"use client";

import { useMemo, useState } from "react";

import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { BeamResult, Load, SupportType } from "@/lib/beam/types";

type Props = {
  result: BeamResult;
  loads: Load[];
  length: number;
  support: SupportType;
  onLoadDrag?: (
    id: string,
    updates: Partial<Extract<Load, { type: "point" }>>
  ) => void;
};

export default function BeamDashboard({
  result,
  loads,
  length,
  support,
  onLoadDrag,
}: Props) {
  const [probeX, setProbeX] = useState<number | null>(null);

  // -----------------------------------
  // nearest result index
  // -----------------------------------
  const probeIndex = useMemo(() => {
    if (probeX === null) return null;

    let bestIndex = 0;
    let bestDistance = Infinity;

    result.x.forEach((x: number, i: number) => {
      const d = Math.abs(x - probeX);

      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = i;
      }
    });

    return bestIndex;
  }, [probeX, result.x]);

  const probeData =
    probeIndex !== null
      ? {
          x: result.x[probeIndex],
          shear: result.shear[probeIndex],
          moment: result.moment[probeIndex],
          deflection: result.deflection[probeIndex],
        }
      : null;

  return (
    <div className="grid grid-cols-1 gap-4">

      {/* ========================================= */}
      {/* TOP INSPECTOR BAR */}
      {/* ========================================= */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 grid grid-cols-4 gap-4 text-sm shadow">

        <div>
          <div className="text-slate-400">Position</div>
          <div className="font-semibold">
            {probeData ? probeData.x.toFixed(2) : "--"}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Shear V(x)</div>
          <div className="font-semibold">
            {probeData ? probeData.shear.toFixed(2) : "--"}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Moment M(x)</div>
          <div className="font-semibold">
            {probeData ? probeData.moment.toFixed(2) : "--"}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Deflection y(x)</div>
          <div className="font-semibold">
            {probeData ? probeData.deflection.toExponential(3) : "--"}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* BEAM */}
      {/* ========================================= */}
      <BeamDiagram
        loads={loads}
        length={length}
        support={support}
        onLoadDrag={onLoadDrag}
        probeX={probeX}
        setProbeX={setProbeX}
      />

      {/* ========================================= */}
      {/* SHEAR */}
      {/* ========================================= */}
      <EngineeringPlot
        title="Shear Force V(x)"
        x={result.x}
        y={result.shear}
        yLabel="V"
        probeX={probeX}
      />

      {/* ========================================= */}
      {/* MOMENT */}
      {/* ========================================= */}
      <EngineeringPlot
        title="Bending Moment M(x)"
        x={result.x}
        y={result.moment}
        yLabel="M"
        probeX={probeX}
      />

      {/* ========================================= */}
      {/* DEFLECTION */}
      {/* ========================================= */}
      <EngineeringPlot
        title="Deflection y(x)"
        x={result.x}
        y={result.deflection}
        yLabel="y"
        probeX={probeX}
      />

      {/* ========================================= */}
      {/* Stress Distribution */}
      {/* ========================================= */}
      {result.stress && (
        <EngineeringPlot
          title="Stress Distribution σ(x)"
          x={result.x}
          y={result.stress}
          yLabel="σ"
          probeX={probeX}
        />
      )}

      {/* ========================================= */}
      {/* SUMMARY */}
      {/* ========================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Max Moment</div>
          <div className="text-lg font-semibold">
            {result.maxMoment?.toFixed(2) ?? "--"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Max Shear</div>
          <div className="text-lg font-semibold">
            {result.maxShear?.toFixed(2) ?? "--"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Max Stress</div>
          <div className="text-lg font-semibold">
            {result.maxStress?.toFixed(2) ?? "--"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Max Deflection</div>
          <div className="text-lg font-semibold">
            {result.maxDeflection?.toExponential(2) ?? "--"}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* REACTIONS */}
      {/* ========================================= */}
      {result.reactions && (
        <div className="bg-white border rounded-xl p-4 mt-4">
          <div className="font-semibold mb-3">Support Reactions</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {result.reactions.map((r: number, i: number) => (
              <div key={i} className="bg-gray-50 rounded p-2">
                DOF {i}: {r.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

 