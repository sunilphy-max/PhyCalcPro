import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { HeatExchangerResult } from "@/lib/pressure/heat-exchangers/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<HeatExchangerResult> | null;
};

export default function HeatExchangerResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="heat-exchangers"
      fileName="heat-exchanger"
      calculationSpec={result?.calculationSpec}
      title="Export Heat Exchanger results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the heat exchanger model to see thermal duty, required area, and effectiveness."
      heading="Heat exchanger results"
      csvRows={
        result
          ? [
              { metric: "heatTransferRate", value: result.heatTransferRate },
              { metric: "LMTD", value: result.LMTD },
              { metric: "effectiveness", value: result.effectiveness },
              { metric: "requiredArea", value: result.requiredArea },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Heat transfer rate"
              numericValue={fromBase(result.heatTransferRate, "power", "W")} unit="W"
              tone="red"
            />
            <CalculatorMetricCard
              label="Log mean TD"
              numericValue={result.LMTD} unit="K"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Effectiveness"
              numericValue={result.effectiveness * 100} unit="%"
              tone="purple"
            />
            <CalculatorMetricCard
              label="NTU"
              numericValue={result.NTU} unit="—"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Design area"
              numericValue={result.area} unit="m²"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Required area"
              numericValue={result.requiredArea} unit="m²"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Cold outlet temp"
              numericValue={result.coldOutletTemp} unit="°C"
              tone="green"
            />
            <CalculatorMetricCard
              label="Q maximum"
              numericValue={fromBase(result.Qmax, "power", "W")} unit="W"
              tone="orange"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
