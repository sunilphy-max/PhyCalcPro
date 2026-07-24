"use client";

import { useMemo } from "react";
import type { ScrewResult } from "@/lib/fasteners/bolts/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseBolt } from "@/lib/fasteners/bolts/diagnosis";

type Props = {
  result: ScrewResult;
  workflowMode?: DesignWorkflowMode;
};

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function ScrewsDashboard({ result, workflowMode }: Props) {
  const diagnosis = useMemo(() => {
    if (workflowMode !== "diagnose") return null;
    return diagnoseBolt(result);
  }, [workflowMode, result]);

  const plotTabs = useMemo((): PlotPickerTab[] => {
    const loadMultipliers = Array.from({ length: 13 }, (_, i) => 0.4 + i * 0.1);
    const loads = loadMultipliers.map((m) => result.axialForce * m);
    // Torque and stresses scale ~linearly with axial force for these screening models.
    const torques = loadMultipliers.map((m) => result.torque * m);
    const vonMises = loadMultipliers.map((m) => result.vonMisesStress * m);
    const sf = loadMultipliers.map((m) => result.safetyFactor / Math.max(m, 1e-9));

    return [
      {
        id: "torque-load",
        label: "Torque vs load",
        content: (
          <EngineeringPlot
            title="Required torque vs axial load"
            x={loads}
            y={torques}
            yLabel="Torque"
            xLabel="Axial force"
            xUnit="N"
            unitLabel="N·m"
            probeX={result.axialForce}
            showPeak={false}
          />
        ),
      },
      {
        id: "stress-load",
        label: "Stress vs load",
        content: (
          <EngineeringPlot
            title="Von Mises stress vs axial load"
            x={loads}
            y={vonMises}
            yLabel="Von Mises stress"
            xLabel="Axial force"
            xUnit="N"
            unitLabel="Pa"
            probeX={result.axialForce}
            showPeak={false}
          />
        ),
      },
      {
        id: "safety-load",
        label: "Safety factor",
        content: (
          <EngineeringPlot
            title="Safety factor vs axial load"
            x={loads}
            y={sf}
            yLabel="Safety factor"
            xLabel="Axial force"
            xUnit="N"
            unitLabel="—"
            probeX={result.axialForce}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result]);

  return (
    <div className="space-y-4">
      {diagnosis ? (
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 dark:border-violet-800 dark:bg-violet-950/30">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
            Diagnose
          </h3>
          <GenericDiagnosisPanel diagnosis={diagnosis} />
        </div>
      ) : null}
      <CalculatorMetricGrid cols={2}>
        <CalculatorMetricCard
          label="Design status"
          value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
          tone={statusTone(result.designStatus)}
          size="lg"
        />
        <CalculatorMetricCard
          label="Safety factor"
          numericValue={result.safetyFactor} unit="—"
          tone="blue"
          size="lg"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Screw type"
          value={result.screwType.replace("_", " ")}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Major diameter"
          numericValue={result.majorDiameter} unit="m"
          tone="green"
        />
        <CalculatorMetricCard
          label="Pitch"
          numericValue={result.pitch} unit="m"
          tone="purple"
        />
        <CalculatorMetricCard
          label="Helix angle"
          numericValue={result.helixAngle} unit="°"
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={2}>
        <CalculatorMetricCard
          label="Axial force"
          numericValue={result.axialForce} unit="N"
          tone="blue"
        />
        <CalculatorMetricCard
          label="Torque"
          numericValue={result.torque} unit="N·m"
          tone="blue"
        />
        <CalculatorMetricCard
          label="Efficiency"
          numericValue={result.efficiency} unit="%"
          tone="purple"
        />
        {result.power > 0 ? (
          <CalculatorMetricCard
            label="Power"
            numericValue={result.power} unit="W"
            tone="purple"
          />
        ) : null}
        <CalculatorMetricCard
          label="Shear stress"
          numericValue={result.shearStress} unit="Pa"
          tone="orange"
        />
        <CalculatorMetricCard
          label="Compressive stress"
          numericValue={result.compressiveStress} unit="Pa"
          tone="orange"
        />
        <CalculatorMetricCard
          label="Von Mises stress"
          numericValue={result.vonMisesStress} unit="Pa"
          tone="red"
        />
        <CalculatorMetricCard
          label="Fatigue safety factor"
          numericValue={result.fatigueSafetyFactor} unit="—"
          tone="green"
        />
      </CalculatorMetricGrid>

      {result.screwType === "ball_screw" && result.ballCirculation ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard label="Balls per circuit" numericValue={result.ballCirculation} unit="—" tone="blue" />
          <CalculatorMetricCard label="Recirculation" value={result.recirculationPath} tone="blue" />
          {result.dynamicLoadRating ? (
            <CalculatorMetricCard
              label="Dynamic load rating"
              numericValue={result.dynamicLoadRating} unit="N"
              tone="purple"
            />
          ) : null}
          {result.speed ? (
            <CalculatorMetricCard
              label="Operating speed"
              numericValue={result.speed} unit="rpm"
              tone="green"
            />
          ) : null}
          {result.criticalSpeed ? (
            <CalculatorMetricCard
              label="Critical speed"
              numericValue={result.criticalSpeed} unit="rpm"
              tone="orange"
            />
          ) : null}
          {result.bucklingLoad ? (
            <CalculatorMetricCard
              label="Buckling load"
              numericValue={result.bucklingLoad} unit="N"
              tone="red"
            />
          ) : null}
        </CalculatorMetricGrid>
      ) : null}

      {result.screwType === "power_screw" && result.threadType ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard label="Thread type" value={result.threadType} tone="blue" />
          <CalculatorMetricCard
            label="Lead"
            numericValue={result.lead ?? 0} unit="m"
            tone="purple"
          />
          {result.criticalSpeed ? (
            <CalculatorMetricCard
              label="Critical speed"
              numericValue={result.criticalSpeed} unit="rpm"
              tone="orange"
            />
          ) : null}
          {result.bucklingLoad ? (
            <CalculatorMetricCard
              label="Buckling load"
              numericValue={result.bucklingLoad} unit="N"
              tone="red"
            />
          ) : null}
        </CalculatorMetricGrid>
      ) : null}

      {result.recommendations.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <EngineeringPlotPicker
        tabs={plotTabs}
        defaultTabId="torque-load"
        label="Sensitivity charts"
        variant="segmented"
      />
    </div>
  );
}
