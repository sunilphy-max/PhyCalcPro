import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { Vdi2230Result } from "@/lib/fasteners/bolts/vdi2230";

type Props = {
  result: Vdi2230Result | null;
};

export default function Vdi2230Results({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="bolts"
      fileName="vdi2230-bolt-joint"
      title="Export VDI 2230 results"
      description="Export preload, torque, slip, fatigue and bearing-pressure summary."
      empty={!result}
      emptyMessage="Define the joint and run the VDI 2230 check."
      heading="VDI 2230 single-bolt results"
      csvRows={
        result
          ? [
              { metric: "assemblyPreloadMax", value: result.assemblyPreloadMax },
              { metric: "assemblyPreloadMin", value: result.assemblyPreloadMin },
              { metric: "tighteningTorque", value: result.tighteningTorque },
              { metric: "loadFactor", value: result.loadFactor },
              { metric: "residualClampForce", value: result.residualClampForce },
              { metric: "slipSafetyFactor", value: result.slipSafetyFactor },
              { metric: "fatigueSafetyFactor", value: result.fatigueSafetyFactor },
              { metric: "surfacePressure", value: result.surfacePressure },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Assembly preload FM,zul"
              value={formatEngineeringValue(result.assemblyPreloadMax / 1000, "kN")}
              tone="blue"
            />
            <CalculatorMetricCard
              label={`Min preload after scatter (αA = ${result.tighteningFactor})`}
              value={formatEngineeringValue(result.assemblyPreloadMin / 1000, "kN")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Tightening torque MA"
              value={formatEngineeringValue(result.tighteningTorque, "N·m")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Load factor Φ"
              numericValue={result.loadFactor}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Embedding loss FZ"
              value={formatEngineeringValue(result.embeddingLoss / 1000, "kN")}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Residual clamp force FKR"
              value={formatEngineeringValue(result.residualClampForce / 1000, "kN")}
              tone={result.residualClampForce > 0 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
          {Number.isFinite(result.slipSafetyFactor) ? (
            <CalculatorMetricCard
              label="Slip safety (FKR · μT / FQ)"
              numericValue={result.slipSafetyFactor}
              tone={result.slipSafetyFactor >= 1.2 ? "green" : result.slipSafetyFactor >= 1 ? "orange" : "red"}
              size="lg"
            />
          ) : null}
          <CalculatorMetricCard
            label="Working stress utilization σred,B / Rp0.2"
            numericValue={result.workingStressUtilization}
            tone={result.workingStressUtilization <= 1 ? "green" : "red"}
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Thread stress amplitude σa"
              value={formatEngineeringValue(result.stressAmplitude / 1e6, "MPa")}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Endurance σASV (rolled thread)"
              value={formatEngineeringValue(result.enduranceLimit / 1e6, "MPa")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Fatigue safety SD"
              numericValue={result.fatigueSafetyFactor}
              tone={result.fatigueSafetyFactor >= 1.2 ? "green" : result.fatigueSafetyFactor >= 1 ? "orange" : "red"}
            />
            <CalculatorMetricCard
              label={`Head bearing pressure (${formatDisplayNumber(result.surfacePressureUtilization * 100)}% of allowable)`}
              value={formatEngineeringValue(result.surfacePressure / 1e6, "MPa")}
              tone={result.surfacePressureUtilization <= 1 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
