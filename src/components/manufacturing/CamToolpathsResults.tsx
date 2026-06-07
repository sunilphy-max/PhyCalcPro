import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CamToolpathsResult } from "@/lib/manufacturing/camToolpaths/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<CamToolpathsResult> | null;
};

export default function CamToolpathsResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="cam-toolpaths"
      fileName="cam-toolpaths"
      calculationSpec={result?.calculationSpec}
      title="Export Cam Toolpaths results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter tool and stock parameters to estimate feed, material removal, and cut time."
      heading="CAM toolpath results"
      csvRows={
        result
          ? [
              { metric: "feedRate", value: result.feedRate },
              { metric: "materialRemovalRate", value: result.materialRemovalRate },
              { metric: "totalCutTime", value: result.totalCutTime },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Feed rate"
              value={formatEngineeringValue(result.feedRate, "mm/min")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Surface speed"
              value={formatEngineeringValue(result.surfaceSpeed, "m/min")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Chip load"
              value={formatEngineeringValue(result.feedPerTooth, "mm/tooth")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Step-over width"
              value={formatEngineeringValue(result.stepOverWidth, "mm")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Axial depth"
              value={formatEngineeringValue(result.axialDepth, "mm")}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Radial depth"
              value={formatEngineeringValue(result.radialDepth, "mm")}
              tone="orange"
            />
            <CalculatorMetricCard label="Pass count" numericValue={result.passes} tone="green" />
            <CalculatorMetricCard
              label="Material removal rate"
              value={formatEngineeringValue(result.materialRemovalRate / 1000, "cm³/min")}
              tone="red"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Time per pass"
              value={formatEngineeringValue(result.timePerPass, "min")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Total cut time"
              value={formatEngineeringValue(result.totalCutTime, "min")}
              tone="green"
              size="lg"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
