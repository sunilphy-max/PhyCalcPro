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
              value={formatEngineeringValue(fromBase(result.depth, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Flange width"
              value={formatEngineeringValue(fromBase(result.flangeWidth, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Area"
              value={formatEngineeringValue(fromBase(result.area, "area", areaUnit), areaUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Mass per unit length"
              value={`${formatDisplayNumber(result.weight)} kg/m`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Ix (strong axis)"
              value={formatEngineeringValue(fromBase(result.ix, "inertia", inertiaUnit), inertiaUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Iy (weak axis)"
              value={formatEngineeringValue(fromBase(result.iy, "inertia", inertiaUnit), inertiaUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Sx (elastic section modulus)"
              value={formatEngineeringValue(result.sx, "m³")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Sy (elastic section modulus)"
              value={formatEngineeringValue(result.sy, "m³")}
              tone="purple"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
