"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { UnitConverterEquivalent, UnitConverterResult } from "@/lib/tools/unit-converter/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { DIMENSION_LABELS, type UnitConverterDimensionKey } from "@/lib/tools/unit-converter/dimensions";

type Props = {
  result: (UnitConverterResult & { calculationSpec?: CalculationSpec }) | null;
  inputValue: number;
  fromUnit: string;
  equivalents: UnitConverterEquivalent[];
  dimensionKey: UnitConverterDimensionKey;
};

export default function UnitConverterResults({
  result,
  inputValue,
  fromUnit,
  equivalents,
  dimensionKey,
}: Props) {
  return (
    <CalculatorResultsShell
      moduleId="unit-converter"
      fileName="unit-conversion"
      title="Export conversion"
      description="Export converted value and full unit table."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter a value and units to convert."
      heading="Conversion result"
      csvRows={
        result
          ? [
              { metric: "input", value: inputValue, unit: fromUnit },
              { metric: "convertedValue", value: result.convertedValue, unit: result.toUnit },
              ...equivalents.map((row) => ({
                metric: row.unit,
                value: row.value,
                unit: row.unit,
              })),
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Input" numericValue={inputValue} unit={fromUnit} tone="blue" />
            <CalculatorMetricCard
              label="Converted"
              numericValue={result.convertedValue}
              unit={result.toUnit}
              tone="green"
            />
          </CalculatorMetricGrid>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {formatDisplayNumber(inputValue)} {result.fromUnit} ={" "}
            {formatDisplayNumber(result.convertedValue)} {result.toUnit} (
            {DIMENSION_LABELS[dimensionKey]})
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="border-b border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
              All {DIMENSION_LABELS[dimensionKey].toLowerCase()} units
            </div>
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-slate-400 dark:bg-slate-950">
                  <tr>
                    <th className="px-3 py-2 font-medium">Unit</th>
                    <th className="px-3 py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {equivalents.map((row) => {
                    const highlight = row.unit === result.toUnit || row.unit === result.fromUnit;
                    return (
                      <tr
                        key={row.unit}
                        className={
                          highlight
                            ? "bg-cyan-50/80 dark:bg-cyan-950/30"
                            : "odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-950 dark:even:bg-slate-900/40"
                        }
                      >
                        <td className="px-3 py-1.5 font-medium tabular-nums text-slate-700 dark:text-slate-200">
                          {row.unit}
                        </td>
                        <td className="px-3 py-1.5 tabular-nums text-slate-900 dark:text-white">
                          {formatDisplayNumber(row.value)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
