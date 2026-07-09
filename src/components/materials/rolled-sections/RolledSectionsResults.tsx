import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { RolledSectionsResult } from "@/lib/materials/rolled-sections/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (RolledSectionsResult & { calculationSpec?: CalculationSpec }) | null;
  designation: string;
  lengthUnit: string;
  areaUnit: string;
  inertiaUnit: string;
};

export default function RolledSectionsResults({
  result,
  designation,
  lengthUnit,
  areaUnit,
  inertiaUnit,
}: Props) {
  return (
    <CalculatorResultsShell
      moduleId="rolled-sections"
      fileName="rolled-section"
      title="Export section properties"
      description="Export catalog area, inertia, moduli and weight."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Select a designation and look up properties."
      heading="Rolled section properties"
      csvRows={
        result
          ? [
              { metric: "area", value: result.area },
              { metric: "ix", value: result.ix },
              { metric: "iy", value: result.iy },
              { metric: "sx", value: result.sx },
              { metric: "sy", value: result.sy },
              { metric: "weight", value: result.weight },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricCard label="Designation" value={designation} tone="blue" size="lg" />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Depth"
              numericValue={fromBase(result.depth, "length", lengthUnit)} unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Flange width"
              numericValue={fromBase(result.flangeWidth, "length", lengthUnit)} unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Area"
              numericValue={fromBase(result.area, "area", areaUnit)} unit={areaUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Mass per unit length"
              numericValue={result.weight} unit="kg/m"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Ix (strong axis)"
              numericValue={fromBase(result.ix, "inertia", inertiaUnit)} unit={inertiaUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Iy (weak axis)"
              numericValue={fromBase(result.iy, "inertia", inertiaUnit)} unit={inertiaUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Sx (elastic section modulus)"
              numericValue={result.sx} unit="m³"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Sy (elastic section modulus)"
              numericValue={result.sy} unit="m³"
              tone="purple"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
