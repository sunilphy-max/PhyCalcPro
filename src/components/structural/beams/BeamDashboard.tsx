"use client";

import { useMemo, useState } from "react";

import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { BeamResult, Load, SupportType } from "@/lib/structural/beams/types";

type DisplayUnits = {
  length: string;
  force: string;
  moment: string;
  stress: string;
};

type Props = {
  result: BeamResult;
  loads: Load[];
  length: number;
  support: SupportType;
  units?: DisplayUnits;
  caseLabel?: string;
  combinationMode?: "active" | "envelope";
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
  caseLabel,
  combinationMode = "active",
  onLoadDrag,
  units = { length: "m", force: "N", moment: "N·m", stress: "Pa" },
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
      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm shadow">

        <div>
          <div className="text-slate-400">Case</div>
          <div className="font-semibold">
            {caseLabel ?? (combinationMode === "envelope" ? "Envelope" : "Active Case")}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Position ({units.length})</div>
          <div className="font-semibold">
            {probeData
              ? formatEngineeringValue(probeData.x, units.length, { digits: 3 })
              : "—"}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Shear V(x) ({units.force})</div>
          <div className="font-semibold">
            {probeData
              ? formatEngineeringValue(probeData.shear, units.force)
              : "—"}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Moment M(x) ({units.moment})</div>
          <div className="font-semibold">
            {probeData
              ? formatEngineeringValue(probeData.moment, units.moment)
              : "—"}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Deflection y(x) ({units.length})</div>
          <div className="font-semibold">
            {probeData
              ? formatEngineeringValue(probeData.deflection, units.length, {
                  useExponential: true,
                })
              : "—"}
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
        xPositions={result.x}
        deflection={result.deflection}
      />

      {/* ========================================= */}
      {/* SHEAR */}
      {/* ========================================= */}
      <EngineeringPlot
        title="Shear Force V(x)"
        x={result.x}
        y={result.shear}
        yLabel="Shear force"
        xLabel="Position along beam"
        xUnit={units.length}
        unitLabel={units.force}
        probeX={probeX}
      />

      {/* ========================================= */}
      {/* MOMENT */}
      {/* ========================================= */}
      <EngineeringPlot
        title="Bending Moment M(x)"
        x={result.x}
        y={result.moment}
        yLabel="Bending moment"
        xLabel="Position along beam"
        xUnit={units.length}
        unitLabel={units.moment}
        probeX={probeX}
      />

      {/* ========================================= */}
      {/* DEFLECTION */}
      {/* ========================================= */}
      <EngineeringPlot
        title="Deflection y(x)"
        x={result.x}
        y={result.deflection}
        yLabel="Deflection"
        xLabel="Position along beam"
        xUnit={units.length}
        unitLabel={units.length}
        probeX={probeX}
        color="#0891b2"
      />

      {/* ========================================= */}
      {/* Stress Distribution */}
      {/* ========================================= */}
      {result.stress && (
        <EngineeringPlot
          title="Stress Distribution σ(x)"
          x={result.x}
          y={result.stress}
          yLabel="Stress"
          xLabel="Position along beam"
          xUnit={units.length}
          unitLabel={units.stress}
          probeX={probeX}
          color="#7c3aed"
        />
      )}
      <FEAColorStrip
        title="Deflection intensity"
        x={result.x}
        values={result.deflection}
        unit={units.length}
        xUnit={units.length}
      />
      <FEAColorStrip
        title="Stress intensity"
        x={result.x}
        values={result.stress}
        unit={units.stress}
        xUnit={units.length}
      />

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label={`Max moment (${units.moment})`}
          value={formatEngineeringValue(result.maxMoment, units.moment)}
          tone="purple"
        />
        <CalculatorMetricCard
          label={`Max shear (${units.force})`}
          value={formatEngineeringValue(result.maxShear, units.force)}
          tone="blue"
        />
        <CalculatorMetricCard
          label={`Max stress (${units.stress})`}
          value={formatEngineeringValue(result.maxStress, units.stress, {
            useExponential: true,
          })}
          tone="orange"
        />
        <CalculatorMetricCard
          label={`Max deflection (${units.length})`}
          value={formatEngineeringValue(result.maxDeflection, units.length, {
            useExponential: true,
          })}
          tone="green"
        />
      </CalculatorMetricGrid>

      {result.solverMeta ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="font-semibold text-slate-900">Solver Metadata</div>
          <p className="text-slate-600 mt-1">
            {result.solverMeta.solver} | support: {result.solverMeta.support} | mesh:{" "}
            {result.solverMeta.meshSegments}
          </p>
          {result.solverMeta.warnings.length ? (
            <ul className="mt-2 list-disc pl-5 text-amber-700">
              {result.solverMeta.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

 