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
              numericValue={result.feedRate} unit="mm/min"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Surface speed"
              numericValue={result.surfaceSpeed} unit="m/min"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Chip load"
              numericValue={result.feedPerTooth} unit="mm/tooth"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Step-over width"
              numericValue={result.stepOverWidth} unit="mm"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Axial depth"
              numericValue={result.axialDepth} unit="mm"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Radial depth"
              numericValue={result.radialDepth} unit="mm"
              tone="orange"
            />
            <CalculatorMetricCard label="Pass count" numericValue={result.passes} unit="—" tone="green" />
            <CalculatorMetricCard
              label="Material removal rate"
              numericValue={result.materialRemovalRate / 1000} unit="cm³/min"
              tone="red"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Time per pass"
              numericValue={result.timePerPass} unit="min"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Total cut time"
              numericValue={result.totalCutTime} unit="min"
              tone="green"
              size="lg"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
