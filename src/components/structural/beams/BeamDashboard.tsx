"use client";

import { useMemo, useState } from "react";

import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import BeamStressContour from "@/components/structural/beams/BeamStressContour";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type {
  BeamApplicationContext,
  BeamResult,
  BeamSupport,
  Load,
  SupportType,
} from "@/lib/structural/beams/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseBeam } from "@/lib/structural/beams/diagnosis";
import { beamsEquations } from "@/lib/standards/equations/beams";

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
  support: SupportType | "continuous";
  supports?: BeamSupport[];
  units?: DisplayUnits;
  caseLabel?: string;
  combinationMode?: "active" | "envelope";
  applicationContext?: BeamApplicationContext;
  workflowMode?: DesignWorkflowMode;
  onLoadDrag?: (id: string, updates: Partial<Load>) => void;
  onSupportDrag?: (id: string, x: number) => void;
  sectionDepth?: number;
};

export default function BeamDashboard({
  result,
  loads,
  length,
  support,
  supports,
  caseLabel,
  combinationMode = "active",
  applicationContext,
  workflowMode,
  onLoadDrag,
  onSupportDrag,
  sectionDepth,
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

  const criticalMomentIndex = useMemo(() => {
    let best = 0;
    let peak = -Infinity;
    result.moment.forEach((m, i) => {
      if (Math.abs(m) > peak) {
        peak = Math.abs(m);
        best = i;
      }
    });
    return best;
  }, [result.moment]);

  const safetyFactor = useMemo(() => {
    if (!application) return null;
    const util = Math.max(
      application.stressUtilization,
      application.deflectionUtilization,
      1e-9
    );
    return 1 / util;
  }, [application]);

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
            supports={supports}
            onLoadDrag={onLoadDrag}
            onSupportDrag={onSupportDrag}
            probeX={probeX}
            setProbeX={setProbeX}
            xPositions={result.x}
            deflection={result.deflection}
            supportReactions={result.supportReactions}
            animateDeflection
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
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
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
            <BeamStressContour
              depth={sectionDepth ?? 2 * 0.1}
              maxStress={result.maxStress}
              criticalMoment={result.moment[criticalMomentIndex] ?? 0}
              stressUnit={units.stress}
            />
          </div>
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
  }, [
    loads,
    length,
    support,
    supports,
    onLoadDrag,
    onSupportDrag,
    probeX,
    result,
    units,
    sectionDepth,
    criticalMomentIndex,
  ]);

  const diagnosis = useMemo(() => {
    if (workflowMode !== "diagnose") return null;
    return diagnoseBeam(result);
  }, [workflowMode, result]);

  const governingEq = beamsEquations[0];

  return (
    <div className="grid grid-cols-1 gap-4">
      {diagnosis ? (
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 dark:border-violet-800 dark:bg-violet-950/30">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
            Diagnose Mode
          </h3>
          <GenericDiagnosisPanel diagnosis={diagnosis} />
        </div>
      ) : null}

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label={`Max moment (${units.moment})`}
          numericValue={result.maxMoment}
          unit={units.moment}
          tone="purple"
        />
        <CalculatorMetricCard
          label={`Max shear (${units.force})`}
          numericValue={result.maxShear}
          unit={units.force}
          tone="blue"
        />
        <CalculatorMetricCard
          label={`Max stress (${units.stress})`}
          numericValue={result.maxStress}
          unit={units.stress}
          tone="orange"
        />
        <CalculatorMetricCard
          label={`Max deflection (${units.length})`}
          numericValue={result.maxDeflection}
          unit={units.length}
          tone="green"
        />
      </CalculatorMetricGrid>

      {application ? (
        <CalculatorMetricGrid cols={4}>
          <CalculatorMetricCard
            label="Stress utilization"
            numericValue={application.stressUtilization}
            unit="—"
            status={application.stressUtilization <= 1 ? "safe" : "danger"}
            tone="orange"
          />
          <CalculatorMetricCard
            label="Deflection utilization"
            numericValue={application.deflectionUtilization}
            unit="—"
            status={application.deflectionUtilization <= 1 ? "safe" : "danger"}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Safety factor (governing)"
            numericValue={safetyFactor ?? undefined}
            unit="—"
            status={
              safetyFactor != null && safetyFactor >= 1 ? "safe" : "danger"
            }
            tone="green"
          />
          <CalculatorMetricCard
            label={`Allowable stress (${units.stress})`}
            numericValue={application.allowableStress}
            unit={units.stress}
            tone="purple"
          />
        </CalculatorMetricGrid>
      ) : null}

      {(result.supportReactions?.length ?? 0) > 0 ? (
        <CalculatorMetricGrid
          cols={
            Math.min(4, result.supportReactions!.length) as 2 | 3 | 4
          }
        >
          {result.supportReactions!.map((r) => (
            <CalculatorMetricCard
              key={r.supportId}
              label={`Reaction ${r.supportId} (${r.kind})`}
              numericValue={r.Fy}
              unit={units.force}
              tone="green"
            />
          ))}
        </CalculatorMetricGrid>
      ) : null}

      <CalculatorMetricGrid cols={2}>
        <CalculatorMetricCard
          label="Design screening"
          value={
            application
              ? application.stressUtilization <= 1 && application.deflectionUtilization <= 1
                ? "Pass"
                : "Fail"
              : "—"
          }
          tone={
            application
              ? application.stressUtilization <= 1 && application.deflectionUtilization <= 1
                ? "green"
                : "red"
              : "default"
          }
        />
        <CalculatorMetricCard
          label="Governing limit"
          value={
            application
              ? application.stressUtilization >= application.deflectionUtilization
                ? "Flexure / stress"
                : "Deflection"
              : "Run solve for checks"
          }
          tone="orange"
        />
        {governingEq ? (
          <CalculatorMetricCard
            label={governingEq.label}
            value={governingEq.expression.replace(/\\\\/g, "\\")}
            tone="purple"
          />
        ) : null}
        {application?.standards?.length ? (
          <CalculatorMetricCard
            label="Applicable standards"
            value={application.standards.join(", ")}
            tone="blue"
          />
        ) : null}
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={2} className="sm:grid-cols-5">
        <CalculatorMetricCard
          label="Case"
          value={caseLabel ?? (combinationMode === "envelope" ? "Envelope" : "Active")}
        />
        <CalculatorMetricCard
          label="Position"
          numericValue={probeData ? probeData.x : undefined}
          unit={probeData ? units.length : undefined}
          value={probeData ? undefined : "Click beam model"}
        />
        <CalculatorMetricCard
          label="Shear"
          numericValue={probeData ? probeData.shear : undefined}
          unit={probeData ? units.force : undefined}
          value={probeData ? undefined : "—"}
        />
        <CalculatorMetricCard
          label="Moment"
          numericValue={probeData ? probeData.moment : undefined}
          unit={probeData ? units.moment : undefined}
          value={probeData ? undefined : "—"}
        />
        <CalculatorMetricCard
          label="Deflection"
          numericValue={probeData ? probeData.deflection : undefined}
          unit={probeData ? units.length : undefined}
          value={probeData ? undefined : "—"}
        />
      </CalculatorMetricGrid>

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
