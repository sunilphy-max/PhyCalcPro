import { fromBase } from "@/lib/units/conversions";
import type { GearResult } from "@/lib/machine/gears/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import type { CalculationSpec } from "@/lib/standards/types";
import GearMeshPreview from "@/components/shared/geometry/GearMeshPreview";

type Props = {
  result: (GearResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function GearResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="gears"
      fileName="gear"
      title="Export Gear results"
      description="Export the current summary and charts for review."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Run the analysis to review gear geometry and root bending stress."
      heading="Gear results"
      csvRows={
        result
          ? [
              { metric: "actualRatio", value: result.actualRatio },
              { metric: "torque", value: result.torque },
              { metric: "bendingStress", value: result.bendingStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Pinion pitch diameter"
              value={`${formatDisplayNumber(fromBase(result.pitchDiameterPinion, "length", lengthUnit))} ${lengthUnit}`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Gear pitch diameter"
              value={`${formatDisplayNumber(fromBase(result.pitchDiameterGear, "length", lengthUnit))} ${lengthUnit}`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Actual ratio"
              numericValue={result.actualRatio}
              tone="purple"
            />
            <CalculatorMetricCard label="Lewis factor" numericValue={result.lewisY} tone="purple" />
            <CalculatorMetricCard
              label="Torque"
              value={`${formatDisplayNumber(result.torque)} N·m`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Tangential force"
              value={`${formatDisplayNumber(result.tangentialForce)} N`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Root bending stress"
              value={`${formatDisplayNumber(fromBase(result.bendingStress, "stress", stressUnit))} ${stressUnit}`}
              tone="amber"
            />
            <CalculatorMetricCard
              label="Allowable stress"
              value={`${formatDisplayNumber(fromBase(result.allowableStress, "stress", stressUnit))} ${stressUnit}`}
              tone="amber"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Bending safety factor"
            numericValue={result.safetyFactor}
            tone={result.safetyFactor >= 1.5 ? "green" : "red"}
            size="lg"
          />
          <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <GearMeshPreview
              moduleMm={result.module * 1000}
              pinionTeeth={result.pinionTeeth}
              gearTeeth={result.gearTeeth}
              faceWidthMm={result.faceWidth * 1000}
            />
          </div>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
