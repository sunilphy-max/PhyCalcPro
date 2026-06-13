"use client";

import { useMemo, useState } from "react";

import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type {
  BeamApplicationContext,
  BeamResult,
  Load,
  SupportType,
} from "@/lib/structural/beams/types";

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
  applicationContext?: BeamApplicationContext;
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
  applicationContext,
  onLoadDrag,
  units = { length: "m", force: "N", moment: "N·m", stress: "Pa" },
}: Props) {
  const [probeX, setProbeX] = useState<number | null>(null);
  const application = applicationContext ?? result.applicationContext;

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

  const plotTabs = useMemo((): PlotPickerTab[] => {
    const tabs: PlotPickerTab[] = [
      {
        id: "model",
        label: "Beam model & probe",
        content: (
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
        ),
      },
      {
        id: "shear-moment",
        label: "Shear & moment",
        content: (
          <EngineeringPlot
            title="Shear Force V(x)"
            x={result.x}
            y={result.shear}
            yLabel="Shear force"
            xLabel="Position along beam"
            xUnit={units.length}
            unitLabel={units.force}
            probeX={probeX}
            series={[
              {
                y: result.moment,
                label: "Bending moment",
                unitLabel: units.moment,
                secondaryAxis: true,
              },
            ]}
            secondaryYLabel="Bending moment"
            secondaryUnitLabel={units.moment}
          />
        ),
      },
      {
        id: "deflection",
        label: "Deflection",
        content: (
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
        ),
      },
    ];

    if (result.stress) {
      tabs.push({
        id: "stress",
        label: "Bending stress",
        content: (
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
        ),
      });
    }

    tabs.push({
      id: "intensity",
      label: "Intensity maps",
      content: (
        <div className="space-y-3">
          <FEAColorStrip
            title="Deflection intensity"
            x={result.x}
            values={result.deflection}
            unit={units.length}
            xUnit={units.length}
          />
          {result.stress ? (
            <FEAColorStrip
              title="Stress intensity"
              x={result.x}
              values={result.stress}
              unit={units.stress}
              xUnit={units.length}
            />
          ) : null}
        </div>
      ),
    });

    return tabs;
  }, [loads, length, support, onLoadDrag, probeX, result, units]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Key results first */}
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

      {application ? (
        <CalculatorMetricGrid cols={4}>
          <CalculatorMetricCard
            label="Application stress utilization"
            numericValue={application.stressUtilization}
            status={application.stressUtilization <= 1 ? "safe" : "danger"}
            tone="orange"
          />
          <CalculatorMetricCard
            label="Application deflection utilization"
            numericValue={application.deflectionUtilization}
            status={application.deflectionUtilization <= 1 ? "safe" : "danger"}
            tone="blue"
          />
          <CalculatorMetricCard
            label={`Allowable stress (${units.stress})`}
            value={formatEngineeringValue(application.allowableStress, units.stress, {
              useExponential: true,
            })}
            tone="purple"
          />
          <CalculatorMetricCard
            label={`Deflection limit (${units.length})`}
            value={formatEngineeringValue(application.deflectionLimit, units.length, {
              useExponential: true,
            })}
            tone="green"
          />
        </CalculatorMetricGrid>
      ) : null}

      {/* Probe bar */}
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-sm text-white shadow sm:grid-cols-5">
        <div>
          <div className="text-slate-400">Case</div>
          <div className="font-semibold">
            {caseLabel ?? (combinationMode === "envelope" ? "Envelope" : "Active")}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Position ({units.length})</div>
          <div className="font-semibold">
            {probeData
              ? formatEngineeringValue(probeData.x, units.length, { digits: 3 })
              : "Click beam model"}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Shear ({units.force})</div>
          <div className="font-semibold">
            {probeData ? formatEngineeringValue(probeData.shear, units.force) : "—"}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Moment ({units.moment})</div>
          <div className="font-semibold">
            {probeData ? formatEngineeringValue(probeData.moment, units.moment) : "—"}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Deflection ({units.length})</div>
          <div className="font-semibold">
            {probeData
              ? formatEngineeringValue(probeData.deflection, units.length, {
                  useExponential: true,
                })
              : "—"}
          </div>
        </div>
      </div>

      <EngineeringPlotPicker tabs={plotTabs} defaultTabId="model" label="Result chart" />

      {result.solverMeta ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {result.solverMeta.solver} · {result.solverMeta.support} · mesh{" "}
          {result.solverMeta.meshSegments}
          {result.solverMeta.warnings.length
            ? ` · ${result.solverMeta.warnings.join("; ")}`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
