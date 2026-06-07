"use client";

import type { ScrewResult } from "@/lib/fasteners/bolts/types";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: ScrewResult;
};

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function ScrewsDashboard({ result }: Props) {
  return (
    <div className="space-y-4">
      <CalculatorMetricGrid cols={2}>
        <CalculatorMetricCard
          label="Design status"
          value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
          tone={statusTone(result.designStatus)}
          size="lg"
        />
        <CalculatorMetricCard
          label="Safety factor"
          numericValue={result.safetyFactor}
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
          value={formatEngineeringValue(result.majorDiameter, "m")}
          tone="green"
        />
        <CalculatorMetricCard
          label="Pitch"
          value={formatEngineeringValue(result.pitch, "m")}
          tone="purple"
        />
        <CalculatorMetricCard
          label="Helix angle"
          value={formatEngineeringValue(result.helixAngle, "°")}
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={2}>
        <CalculatorMetricCard
          label="Axial force"
          value={formatEngineeringValue(result.axialForce, "N")}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Torque"
          value={formatEngineeringValue(result.torque, "N·m")}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Efficiency"
          value={formatEngineeringValue(result.efficiency, "%")}
          tone="purple"
        />
        {result.power > 0 ? (
          <CalculatorMetricCard
            label="Power"
            value={formatEngineeringValue(result.power, "W")}
            tone="purple"
          />
        ) : null}
        <CalculatorMetricCard
          label="Shear stress"
          value={formatEngineeringValue(result.shearStress, "Pa")}
          tone="orange"
        />
        <CalculatorMetricCard
          label="Compressive stress"
          value={formatEngineeringValue(result.compressiveStress, "Pa")}
          tone="orange"
        />
        <CalculatorMetricCard
          label="Von Mises stress"
          value={formatEngineeringValue(result.vonMisesStress, "Pa")}
          tone="red"
        />
        <CalculatorMetricCard
          label="Fatigue safety factor"
          numericValue={result.fatigueSafetyFactor}
          tone="green"
        />
      </CalculatorMetricGrid>

      {result.screwType === "ball_screw" && result.ballCirculation ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard label="Balls per circuit" numericValue={result.ballCirculation} tone="blue" />
          <CalculatorMetricCard label="Recirculation" value={result.recirculationPath} tone="blue" />
          {result.dynamicLoadRating ? (
            <CalculatorMetricCard
              label="Dynamic load rating"
              value={formatEngineeringValue(result.dynamicLoadRating, "N")}
              tone="purple"
            />
          ) : null}
          {result.speed ? (
            <CalculatorMetricCard
              label="Operating speed"
              value={formatEngineeringValue(result.speed, "rpm")}
              tone="green"
            />
          ) : null}
          {result.criticalSpeed ? (
            <CalculatorMetricCard
              label="Critical speed"
              value={formatEngineeringValue(result.criticalSpeed, "rpm")}
              tone="orange"
            />
          ) : null}
          {result.bucklingLoad ? (
            <CalculatorMetricCard
              label="Buckling load"
              value={formatEngineeringValue(result.bucklingLoad, "N")}
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
            value={formatEngineeringValue(result.lead ?? 0, "m")}
            tone="purple"
          />
          {result.criticalSpeed ? (
            <CalculatorMetricCard
              label="Critical speed"
              value={formatEngineeringValue(result.criticalSpeed, "rpm")}
              tone="orange"
            />
          ) : null}
          {result.bucklingLoad ? (
            <CalculatorMetricCard
              label="Buckling load"
              value={formatEngineeringValue(result.bucklingLoad, "N")}
              tone="red"
            />
          ) : null}
        </CalculatorMetricGrid>
      ) : null}

      {result.recommendations.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Recommendations</h3>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
