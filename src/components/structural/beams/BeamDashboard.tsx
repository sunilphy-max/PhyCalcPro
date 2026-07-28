"use client";

import { useMemo, useState } from "react";

import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import BeamStressContour from "@/components/structural/beams/BeamStressContour";
import BeamFailureBanner from "@/components/structural/beams/BeamFailureBanner";
import type { BeamLoadLibraryType } from "@/components/structural/beams/BeamLoadLibrary";
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
import { utilizationToMetricStatus } from "@/lib/structural/beams/utilizationStatus";
import { beamsEquations } from "@/lib/standards/equations/beams";

type DisplayUnits = {
  length: string;
  force: string;
  moment: string;
  stress: string;
};

type LinkedPeak = "moment" | "stress" | "deflection";

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
  onDropLoad?: (type: BeamLoadLibraryType, x: number) => void;
  sectionDepth?: number;
};

function peakIndexOf(values: number[]): number {
  let best = 0;
  let peak = -Infinity;
  values.forEach((v, i) => {
    const a = Math.abs(v);
    if (a > peak) {
      peak = a;
      best = i;
    }
  });
  return best;
}

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
  onDropLoad,
  sectionDepth,
  units = { length: "m", force: "N", moment: "N·m", stress: "Pa" },
}: Props) {
  const [probeX, setProbeX] = useState<number | null>(null);
  const [activeTabId, setActiveTabId] = useState("model");
  const [linkedPeak, setLinkedPeak] = useState<LinkedPeak | null>(null);
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
          stress: result.stress?.[probeIndex],
        }
      : null;

  const criticalMomentIndex = useMemo(
    () => peakIndexOf(result.moment),
    [result.moment]
  );
  const criticalStressIndex = useMemo(
    () => peakIndexOf(result.stress?.length ? result.stress : result.moment),
    [result.stress, result.moment]
  );
  const criticalDeflectionIndex = useMemo(
    () => peakIndexOf(result.deflection),
    [result.deflection]
  );

  const jumpToLinkedPeak = (kind: LinkedPeak) => {
    const criticalX = result.x[criticalMomentIndex] ?? length / 2;
    if (kind === "deflection") {
      // Corresponding δ at the critical (max |M|) section.
      setProbeX(criticalX);
      setLinkedPeak("deflection");
      setActiveTabId("deflection");
      return;
    }
    const index = kind === "moment" ? criticalMomentIndex : criticalStressIndex;
    setProbeX(result.x[index] ?? length / 2);
    setLinkedPeak(kind);
    setActiveTabId(kind === "moment" ? "shear-moment" : "stress");
  };

  const jumpToGlobalPeak = (kind: LinkedPeak) => {
    const index =
      kind === "moment"
        ? criticalMomentIndex
        : kind === "stress"
          ? criticalStressIndex
          : criticalDeflectionIndex;
    setProbeX(result.x[index] ?? length / 2);
    setLinkedPeak(kind === "deflection" ? null : kind);
    setActiveTabId(
      kind === "moment" ? "shear-moment" : kind === "stress" ? "stress" : "deflection"
    );
  };

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
            onDropLoad={onDropLoad}
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
            onProbeChange={(x) => {
              setProbeX(x);
              setLinkedPeak("moment");
            }}
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
            onProbeChange={(x) => {
              setProbeX(x);
              setLinkedPeak("deflection");
            }}
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
              onProbeChange={(x) => {
                setProbeX(x);
                setLinkedPeak("stress");
              }}
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
    onDropLoad,
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
  const chainButtonClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-xs font-semibold transition ${
      active
        ? "bg-violet-600 text-white shadow-sm"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    }`;

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

      {application ? (
        <BeamFailureBanner
          application={application}
          maxStress={result.maxStress}
          maxDeflection={result.maxDeflection}
          stressUnit={units.stress}
          lengthUnit={units.length}
        />
      ) : null}

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label={`Max moment (${units.moment})`}
          numericValue={result.maxMoment}
          unit={units.moment}
          tone="purple"
          onClick={() => jumpToGlobalPeak("moment")}
          title="Show max moment on shear & moment diagram"
        />
        <CalculatorMetricCard
          label={`Max shear (${units.force})`}
          numericValue={result.maxShear}
          unit={units.force}
          tone="blue"
          onClick={() => {
            const i = peakIndexOf(result.shear);
            setProbeX(result.x[i] ?? null);
            setActiveTabId("shear-moment");
            setLinkedPeak(null);
          }}
          title="Show max shear on diagram"
        />
        <CalculatorMetricCard
          label={`Max stress (${units.stress})`}
          numericValue={result.maxStress}
          unit={units.stress}
          tone="orange"
          onClick={() => jumpToGlobalPeak("stress")}
          title="Show max stress diagram"
        />
        <CalculatorMetricCard
          label={`Max deflection (${units.length})`}
          numericValue={result.maxDeflection}
          unit={units.length}
          tone="green"
          onClick={() => jumpToGlobalPeak("deflection")}
          title="Show max deflection diagram"
        />
      </CalculatorMetricGrid>

      <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-3 dark:border-violet-800/60 dark:bg-violet-950/30">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-200">
          Linked peaks
        </p>
        <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">
          Follow how maximum moment drives stress and deflection at the critical section.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={chainButtonClass(linkedPeak === "moment")}
            onClick={() => jumpToLinkedPeak("moment")}
          >
            Maximum moment
          </button>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <button
            type="button"
            className={chainButtonClass(linkedPeak === "stress")}
            onClick={() => jumpToLinkedPeak("stress")}
            disabled={!result.stress}
          >
            Maximum stress
          </button>
          <span className="text-slate-400" aria-hidden>
            →
          </span>
          <button
            type="button"
            className={chainButtonClass(linkedPeak === "deflection")}
            onClick={() => jumpToLinkedPeak("deflection")}
          >
            Corresponding deflection
          </button>
        </div>
        {linkedPeak && probeData ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Probe at {probeData.x.toFixed(3)} {units.length}
            {probeData.stress != null
              ? ` · σ = ${probeData.stress.toExponential(3)} ${units.stress}`
              : ""}
            {` · δ = ${probeData.deflection.toExponential(3)} ${units.length}`}
          </p>
        ) : null}
      </div>

      {application ? (
        <CalculatorMetricGrid cols={4}>
          <CalculatorMetricCard
            label="Stress utilization"
            numericValue={application.stressUtilization}
            unit="—"
            status={utilizationToMetricStatus(application.stressUtilization)}
            tone="orange"
          />
          <CalculatorMetricCard
            label="Deflection utilization"
            numericValue={application.deflectionUtilization}
            unit="—"
            status={utilizationToMetricStatus(application.deflectionUtilization)}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Safety factor (governing)"
            numericValue={safetyFactor ?? undefined}
            unit="—"
            status={
              safetyFactor == null
                ? undefined
                : safetyFactor < 1
                  ? "danger"
                  : safetyFactor < 1 / 0.85
                    ? "warning"
                    : "safe"
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
              ? utilizationToMetricStatus(
                  Math.max(
                    application.stressUtilization,
                    application.deflectionUtilization
                  )
                ) === "safe"
                ? "Safe"
                : utilizationToMetricStatus(
                      Math.max(
                        application.stressUtilization,
                        application.deflectionUtilization
                      )
                    ) === "warning"
                  ? "Near limit"
                  : "Failure"
              : "—"
          }
          status={
            application
              ? utilizationToMetricStatus(
                  Math.max(
                    application.stressUtilization,
                    application.deflectionUtilization
                  )
                )
              : undefined
          }
          tone={
            application
              ? application.stressUtilization <= 1 &&
                application.deflectionUtilization <= 1
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
          value={probeData ? undefined : "Click beam or chart"}
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

      <EngineeringPlotPicker
        tabs={plotTabs}
        defaultTabId="model"
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        label="Result chart"
        variant="segmented"
      />

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
