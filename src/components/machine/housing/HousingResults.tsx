import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { HousingResult } from "@/lib/machine/housing/types";

type Props = {
  result: WithCalculationSpec<HousingResult> | null;
};

export default function HousingResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="housing"
      fileName="housing"
      calculationSpec={result?.calculationSpec}
      title="Export housing results"
      description="Export body stress and bolt reaction estimates."
      empty={!result}
      emptyMessage="Enter housing loads and run the check."
      heading="Housing results"
      csvRows={
        result
          ? [
              { metric: "bodySafetyFactor", value: result.bodySafetyFactor },
              { metric: "boltTensionPerBolt", value: result.boltTensionPerBolt },
              { metric: "boltShearPerBolt", value: result.boltShearPerBolt },
              { metric: "recommendedBoltSize", value: result.recommendedBoltSize },
            ]
          : undefined
      }
    >
      {result ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard
            label="Body safety factor"
            numericValue={result.bodySafetyFactor} unit="—"
            tone={result.designStatus === "safe" ? "green" : result.designStatus === "warning" ? "orange" : "red"}
          />
          <CalculatorMetricCard label="Recommended bolt" value={result.recommendedBoltSize} tone="blue" />
          <CalculatorMetricCard
            label="Bolt tension / bolt"
            numericValue={result.boltTensionPerBolt} unit="N"
            tone="purple"
          />
          <CalculatorMetricCard
            label="Bolt shear / bolt"
            numericValue={result.boltShearPerBolt} unit="N"
            tone="purple"
          />
          <CalculatorMetricCard
            label="Body stress"
            numericValue={result.bodyStress / 1e6} unit="MPa"
            tone="blue"
          />
          <CalculatorMetricCard
            label="Housing deflection"
            numericValue={result.housingDeflection * 1000} unit="mm"
            tone="blue"
          />
          <CalculatorMetricCard
            label="Shaft fit (ISO 286)"
            value={result.recommendedShaftFit}
            tone="purple"
          />
          <CalculatorMetricCard
            label="Housing fit"
            value={result.recommendedHousingFit}
            tone="purple"
          />
          <CalculatorMetricCard
            label="Est. operating clearance"
            numericValue={Number(result.estimatedOperatingClearanceUm.toFixed(0))} unit="µm"
          />
        </CalculatorMetricGrid>
      ) : null}
    </CalculatorResultsShell>
  );
}
