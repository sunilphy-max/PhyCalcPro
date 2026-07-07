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
            numericValue={result.bodySafetyFactor}
            tone={result.designStatus === "safe" ? "green" : result.designStatus === "warning" ? "orange" : "red"}
          />
          <CalculatorMetricCard label="Recommended bolt" value={result.recommendedBoltSize} tone="blue" />
          <CalculatorMetricCard
            label="Bolt tension / bolt"
            value={formatEngineeringValue(result.boltTensionPerBolt, "N")}
            tone="purple"
          />
          <CalculatorMetricCard
            label="Bolt shear / bolt"
            value={formatEngineeringValue(result.boltShearPerBolt, "N")}
            tone="purple"
          />
          <CalculatorMetricCard
            label="Body stress"
            value={formatEngineeringValue(result.bodyStress / 1e6, "MPa")}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Housing deflection"
            value={formatEngineeringValue(result.housingDeflection * 1000, "mm")}
            tone="blue"
          />
        </CalculatorMetricGrid>
      ) : null}
    </CalculatorResultsShell>
  );
}
