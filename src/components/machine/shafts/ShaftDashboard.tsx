"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import ShaftLayoutPreview from "@/components/shared/geometry/ShaftLayoutPreview";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { BearingSupport, LoadCase, ShaftResult } from "@/lib/machine/shafts/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseShaft } from "@/lib/machine/shafts/diagnosis";

type LayoutPreview = {
  length: number;
  diameter: number;
  loads: LoadCase[];
  supports?: BearingSupport[];
  lengthUnit?: string;
};

type Props = {
  result: ShaftResult;
  layout?: LayoutPreview;
  lengthUnit?: string;
  forceUnit?: string;
  workflowMode?: DesignWorkflowMode;
};

export default function ShaftDashboard({
  result,
  layout,
  lengthUnit = "m",
  forceUnit = "N",
  workflowMode,
}: Props) {
  const status = useMemo<"safe" | "danger">(
    () => (result.isSafe ? "safe" : "danger"),
    [result.isSafe]
  );

  const diagnosis = useMemo(() => {
    if (workflowMode !== "diagnose") return null;
    return diagnoseShaft(result);
  }, [workflowMode, result]);

  const plotTabs = useMemo((): PlotPickerTab[] => {
    const tabs: PlotPickerTab[] = [];
    const xUnit = lengthUnit;

    if (layout) {
      tabs.push({
        id: "layout",
        label: "Shaft layout",
        content: (
          <ShaftLayoutPreview
            length={layout.length}
            diameter={layout.diameter}
            loads={layout.loads}
            lengthUnit={layout.lengthUnit}
          />
        ),
      });
    }

    if (result.fatigueDetail) {
      const fd = result.fatigueDetail;
      tabs.push({
        id: "goodman",
        label: "Goodman diagram",
        content: (
          <div className="space-y-2">
            <EngineeringPlot
              title="Modified Goodman (von Mises equivalent)"
              x={fd.goodmanMean}
              y={fd.goodmanAllowable}
              yLabel="Allowable alternating stress"
              xLabel="Mean stress"
              unitLabel="Pa"
              showPeak={false}
              series={[
                {
                  y: fd.goodmanMean.map(() => fd.vonMisesA),
                  label: `Operating σa = ${formatDisplayNumber(fd.vonMisesA)} Pa`,
                  color: "#ea580c",
                },
              ]}
            />
            <p className="text-xs text-slate-500">
              Operating point: σa = {formatEngineeringValue(fd.vonMisesA, "Pa")}, σm ={" "}
              {formatEngineeringValue(fd.vonMisesM, "Pa")}; Se′ ={" "}
              {formatEngineeringValue(fd.correctedEndurance, "Pa")}. Mean location is shown by the
              horizontal operating amplitude vs Goodman intercept.
            </p>
          </div>
        ),
      });
    }

    tabs.push(
      {
        id: "von-mises",
        label: "Combined stress",
        content: (
          <EngineeringPlot
            title="Combined Stress (static + Kt)"
            x={result.x}
            y={result.vonMisesStress}
            yLabel="Von Mises stress"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="Pa"
            series={[
              { y: result.bendingStress, label: "Bending stress" },
              { y: result.shearStress, label: "Torsional shear" },
            ]}
          />
        ),
      },
      {
        id: "moment",
        label: "Bending moment",
        content: (
          <EngineeringPlot
            title="Bending Moment"
            x={result.x}
            y={result.bendingMomentDistribution}
            yLabel="Bending moment"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="N·m"
          />
        ),
      },
      {
        id: "torque",
        label: "Torque",
        content: (
          <EngineeringPlot
            title="Torque Distribution"
            x={result.x}
            y={result.torqueDistribution}
            yLabel="Torque"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="N·m"
          />
        ),
      },
      {
        id: "shear-force",
        label: "Shear force",
        content: (
          <EngineeringPlot
            title="Shear Force"
            x={result.x}
            y={result.shearForce}
            yLabel="Shear force"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="N"
          />
        ),
      },
      {
        id: "deflection",
        label: "Deflection",
        content: (
          <EngineeringPlot
            title="Lateral Deflection"
            x={result.x}
            y={result.deflection}
            yLabel="Deflection"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel={xUnit}
          />
        ),
      },
      {
        id: "slope",
        label: "Slope",
        content: (
          <EngineeringPlot
            title="Shaft Slope"
            x={result.x}
            y={result.slope}
            yLabel="Slope"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="rad"
          />
        ),
      },
      {
        id: "rotation",
        label: "Torsional rotation",
        content: (
          <EngineeringPlot
            title="Torsional Rotation"
            x={result.x}
            y={result.rotation}
            yLabel="Rotation"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="rad"
          />
        ),
      },
      {
        id: "kt",
        label: "Kt / Kf",
        content: (
          <EngineeringPlot
            title="Stress concentration (Kt) and fatigue factor (Kf)"
            x={result.x}
            y={result.stressConcentrationFactor}
            yLabel="Kt"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="—"
            series={[
              {
                y: result.fatigueConcentrationFactor ?? result.stressConcentrationFactor,
                label: "Kf",
                color: "#7c3aed",
              },
            ]}
          />
        ),
      }
    );

    return tabs;
  }, [layout, result, lengthUnit]);

  const keys = result.keysDesign;
  const rings = result.retainingRingChecks ?? [];
  const bearings = result.bearingLifeScreens ?? [];

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
          label="Status"
          value={result.isSafe ? "Safe" : "Check required"}
          status={status}
        />
        <CalculatorMetricCard label="Static safety factor" numericValue={result.safetyFactor} unit="—" tone="blue" />
        <CalculatorMetricCard
          label="Governing check"
          value={result.governingFailureMode}
          tone="orange"
        />
        <CalculatorMetricCard
          label="Critical section"
          numericValue={result.criticalSection}
          unit={lengthUnit}
          tone="purple"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Max von Mises stress"
          numericValue={result.maxStress} unit="Pa"
          tone="red"
        />
        <CalculatorMetricCard
          label="Fatigue safety factor"
          value={
            result.fatigueSafetyFactor != null
              ? formatDisplayNumber(result.fatigueSafetyFactor)
              : "N/A (set RPM)"
          }
          tone={result.fatigueStatus === "safe" ? "blue" : "amber"}
        />
        <CalculatorMetricCard
          label="1st critical speed"
          numericValue={result.criticalSpeed}
          unit="RPM"
          tone="blue"
        />
        <CalculatorMetricCard
          label="Critical speed margin"
          value={
            result.criticalSpeedMargin != null
              ? `${formatDisplayNumber(result.criticalSpeedMargin)}×`
              : "N/A (set RPM)"
          }
          tone={
            result.criticalSpeedMargin != null && result.criticalSpeedMargin >= 1.25
              ? "blue"
              : "amber"
          }
        />
      </CalculatorMetricGrid>

      {result.fatigueDetail && (
        <CalculatorMetricGrid cols={4}>
          <CalculatorMetricCard
            label="σa (bending)"
            numericValue={result.fatigueDetail.sigmaA}
            unit="Pa"
          />
          <CalculatorMetricCard
            label="τm / τa (torsion)"
            value={`${formatDisplayNumber(result.fatigueDetail.tauM)} / ${formatDisplayNumber(result.fatigueDetail.tauA)}`}
            unit="Pa"
          />
          <CalculatorMetricCard
            label="Bending fatigue SF"
            numericValue={result.fatigueDetail.bendingSf}
            unit="—"
          />
          <CalculatorMetricCard
            label="Torsion fatigue SF"
            numericValue={result.fatigueDetail.torsionSf}
            unit="—"
          />
        </CalculatorMetricGrid>
      )}

      <EngineeringPlotPicker
        tabs={plotTabs}
        defaultTabId={result.fatigueDetail ? "goodman" : layout ? "layout" : "von-mises"}
        label="Result chart"
      />

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Max deflection"
          numericValue={result.maxDeflection} unit={lengthUnit}
        />
        <CalculatorMetricCard
          label="Deflection utilization"
          numericValue={Number(result.deflectionUtilization * 100)} unit="%"
        />
        <CalculatorMetricCard
          label="Max bearing slope"
          numericValue={(result.maxSlope || 0) * 1000}
          unit="mrad"
        />
        <CalculatorMetricCard
          label="Slope utilization"
          numericValue={Number(result.slopeUtilization * 100)} unit="%"
        />
      </CalculatorMetricGrid>

      {result.bearingReactions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Bearing reactions</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {result.bearingReactions.map((r, i) => (
              <li key={i}>
                @ {formatEngineeringValue(r.position, lengthUnit)}: Fy ={" "}
                {formatEngineeringValue(r.forceY, "N")}, Fz = {formatEngineeringValue(r.forceZ, "N")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bearings.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Bearing life screening (ISO 281 basic L10)</h3>
          <p className="text-xs text-slate-500">
            Rough deep-groove C estimate vs bore — refine in the bearings module with catalog handoff.
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            {bearings.map((b, i) => (
              <li key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="font-medium">
                  Support @ {formatEngineeringValue(b.position, lengthUnit)} — {b.status.toUpperCase()}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Fr = {formatEngineeringValue(b.radialForce, forceUnit)} · slope{" "}
                  {formatDisplayNumber(b.slopeRad * 1000)} mrad · required C{" "}
                  {formatEngineeringValue(b.requiredDynamicRating, "N")} · est. L10{" "}
                  {b.estimatedL10Hours != null
                    ? `${formatDisplayNumber(b.estimatedL10Hours)} h`
                    : "N/A (set RPM)"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {keys && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Key sizing ({keys.standard})</h3>
          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Key section"
              value={`${formatDisplayNumber(keys.width * 1000)}×${formatDisplayNumber(keys.height * 1000)}`}
              unit="mm"
            />
            <CalculatorMetricCard
              label="Key length"
              value={formatDisplayNumber(keys.length * 1000)}
              unit="mm"
            />
            <CalculatorMetricCard
              label="Shear SF"
              numericValue={keys.shearSafety}
              unit="—"
              tone={keys.shearSafety >= 1.5 ? "blue" : "amber"}
            />
            <CalculatorMetricCard
              label="Bearing SF"
              numericValue={keys.bearingSafety}
              unit="—"
              tone={keys.bearingSafety >= 1.5 ? "blue" : "amber"}
            />
          </CalculatorMetricGrid>
          <p className="text-xs text-slate-500">
            Applied T = {formatEngineeringValue(keys.appliedTorque, "N·m")}; capacity{" "}
            {formatEngineeringValue(keys.capacityTorque, "N·m")}. Status: {keys.status}.
          </p>
        </div>
      )}

      {rings.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Retaining ring grooves</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {rings.map((ring, i) => (
              <li key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="font-medium">
                  @ {formatEngineeringValue(ring.position, lengthUnit)} — Kt {formatDisplayNumber(ring.kt)},
                  Kf {formatDisplayNumber(ring.kf)} — {ring.status.toUpperCase()}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Groove {formatEngineeringValue(ring.grooveDepth, lengthUnit)} ×{" "}
                  {formatEngineeringValue(ring.grooveWidth, lengthUnit)} · axial capacity{" "}
                  {formatEngineeringValue(ring.axialCapacity, forceUnit)}
                  {ring.axialLoad > 0
                    ? ` · load ${formatEngineeringValue(ring.axialLoad, forceUnit)} · SF ${formatDisplayNumber(ring.safetyFactor)}`
                    : " · no axial load entered"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.din743Worksheet && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-emerald-950">
              DIN 743 EU worksheet ({result.din743Worksheet.parts.join(" · ")})
            </h3>
            <span className="text-xs font-medium uppercase tracking-wide text-emerald-800">
              {result.din743Worksheet.designStatus}
            </span>
          </div>
          <p className="text-xs text-emerald-900/80">
            {result.din743Worksheet.materialDesignation} · {result.din743Worksheet.heatTreatment} · Rz{" "}
            {formatDisplayNumber(result.din743Worksheet.Rz_um)} µm · Case{" "}
            {result.din743Worksheet.meanStressCase}
          </p>
          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="DIN fatigue S"
              numericValue={result.din743Worksheet.governingFatigueSF}
              unit="—"
              tone={result.din743Worksheet.governingFatigueSF >= result.din743Worksheet.SminFatigue ? "blue" : "amber"}
            />
            <CalculatorMetricCard
              label="DIN static S"
              numericValue={result.din743Worksheet.governingStaticSF}
              unit="—"
              tone={result.din743Worksheet.governingStaticSF >= result.din743Worksheet.SminStatic ? "blue" : "amber"}
            />
            <CalculatorMetricCard
              label="Auto K_σ / K_τ"
              value={`${formatDisplayNumber(result.din743Worksheet.autoK_sigma)} / ${formatDisplayNumber(result.din743Worksheet.autoK_tau)}`}
              unit="—"
            />
            <CalculatorMetricCard
              label="γ_F / K1"
              value={`${formatDisplayNumber(result.din743Worksheet.autoGamma_F)} / ${formatDisplayNumber(result.din743Worksheet.K1_strength)}`}
              unit="—"
            />
          </CalculatorMetricGrid>
          <ul className="space-y-2 text-sm text-slate-700">
            {result.din743Worksheet.stations.map((st) => (
              <li key={st.id} className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                <div className="font-medium">
                  {st.label} — fatigue S {formatDisplayNumber(st.fatigueSafetyFactor)}, static S{" "}
                  {formatDisplayNumber(st.staticSafetyFactor)}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {st.notchKind} · α_b={formatDisplayNumber(st.alphaBending)} β_b=
                  {formatDisplayNumber(st.betaBending)} · K_σ={formatDisplayNumber(st.K_sigma)} K_τ=
                  {formatDisplayNumber(st.K_tau)} · {st.notchSource}
                </div>
              </li>
            ))}
          </ul>
          {result.din743Worksheet.notes[0] && (
            <p className="text-xs text-slate-500">{result.din743Worksheet.notes[0]}</p>
          )}
        </div>
      )}

      {result.agma6001Template && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1 text-sm text-slate-700">
          <h3 className="text-sm font-semibold text-slate-900">AGMA 6001 interface loads</h3>
          <p>
            {result.agma6001Template.kind} · {result.agma6001Template.duty} · Ka=
            {formatDisplayNumber(result.agma6001Template.Ka)} · Kol=
            {formatDisplayNumber(result.agma6001Template.Kol)} · Km=
            {formatDisplayNumber(result.agma6001Template.Km)}
          </p>
          <p className="text-xs text-slate-500">{result.agma6001Template.notes}</p>
        </div>
      )}

      {result.criticalSpeedModes.length > 1 && (
        <p className="text-xs text-slate-500">
          Critical speed modes:{" "}
          {result.criticalSpeedModes.map((s, i) => `ω${i + 1} = ${formatDisplayNumber(s)} RPM`).join(" · ")}
        </p>
      )}
    </div>
  );
}
