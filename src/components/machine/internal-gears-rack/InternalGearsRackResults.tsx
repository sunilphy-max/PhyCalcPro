import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { InternalGearsRackResult } from "@/lib/machine/internal-gears-rack/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (InternalGearsRackResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function InternalGearsRackResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="internal-gears-rack"
      fileName="internal-gears-rack"
      title="Export internal gear / rack results"
      description="Export bending and contact screening summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Configure gearing and calculate."
      heading="Internal gear / rack results"
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Gear type" value={result.gearType === "rack" ? "Rack & pinion" : "Internal spur"} tone="blue" />
            <CalculatorMetricCard label="Pinion teeth" numericValue={result.pinionTeeth} unit="—" tone="purple" />
            {result.gearType === "internal" ? (
              <CalculatorMetricCard label="Ring teeth" numericValue={result.gearTeeth} unit="—" tone="purple" />
            ) : null}
            <CalculatorMetricCard label="Bending safety factor" numericValue={result.safetyFactor} unit="—" tone={result.safetyFactor >= 2 ? "green" : "orange"} />
            <CalculatorMetricCard label="Contact safety factor" numericValue={result.contactSafetyFactor} unit="—" tone={result.contactSafetyFactor >= 2 ? "green" : "orange"} />
            <CalculatorMetricCard label="Pitch line velocity" numericValue={result.pitchLineVelocity} unit="m/s" tone="blue" />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Bending stress" numericValue={result.bendingStress} unit={stressUnit} tone="orange" />
            <CalculatorMetricCard label="Contact stress" numericValue={result.contactStress} unit={stressUnit} tone="red" />
          </CalculatorMetricGrid>
          <p className="text-sm text-slate-500">
            Pitch diameters: pinion {formatEngineeringValue(result.pitchDiameterPinion, lengthUnit)}
            {result.gearType === "internal" ? ` · ring ${formatEngineeringValue(result.pitchDiameterGear, lengthUnit)}` : ""}
          </p>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
