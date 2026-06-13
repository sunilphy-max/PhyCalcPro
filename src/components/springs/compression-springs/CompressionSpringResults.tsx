import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { CompressionSpringResult } from "@/lib/springs/compression-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import SpringOutlinePreview from "@/components/shared/geometry/SpringOutlinePreview";

type Props = {
  result: (CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
  projectName?: string;
  /** Display-unit geometry for the outline preview */
  geometry?: {
    wireDiameter: number;
    meanDiameter: number;
    activeCoils: number;
    freeLength: number;
  };
};

export default function CompressionSpringResults({ result, lengthUnit, stressUnit, projectName, geometry }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="compression-springs"
      fileName="compression-spring"
      title="Export compression spring results"
      description="Export spring rate, stress and safety summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Compression spring results"
      reportMeta={projectName ? { project: projectName } : undefined}
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "maxLoad", value: result.maxLoad },
              { metric: "shearStress", value: result.shearStress },
              { metric: "allowableShearStress", value: result.allowableShearStress },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "springIndex", value: result.springIndex },
              { metric: "wahlFactor", value: result.wahlFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Spring rate"
              value={formatEngineeringValue(result.springRate, "N/m")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Solid height"
              value={formatEngineeringValue(fromBase(result.solidHeight, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Load at deflection"
              value={formatEngineeringValue(result.maxLoad, "N")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Surge frequency"
              value={`${formatDisplayNumber(result.naturalFrequency)} Hz`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Spring index C"
              numericValue={result.springIndex}
              tone={result.springIndex >= 4 && result.springIndex <= 12 ? "blue" : "orange"}
            />
            <CalculatorMetricCard label="Wahl factor Kw" numericValue={result.wahlFactor} tone="blue" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Corrected shear stress"
            value={formatEngineeringValue(fromBase(result.shearStress, "stress", stressUnit), stressUnit)}
            tone={result.safetyFactor < 1.2 ? "red" : "orange"}
            size="lg"
          />
          <CalculatorMetricCard
            label="Allowable shear stress (0.56·Rm, EN 13906-1)"
            value={formatEngineeringValue(fromBase(result.allowableShearStress, "stress", stressUnit), stressUnit)}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Static safety factor (τ_zul / τ)"
            numericValue={result.safetyFactor}
            tone={result.safetyFactor >= 1.5 ? "green" : result.safetyFactor >= 1.0 ? "orange" : "red"}
            size="lg"
          />
          <CalculatorMetricCard
            label={`Buckling screen (L0/D = ${formatDisplayNumber(result.slenderness)})`}
            value={result.bucklingRisk ? "Check buckling — guide the spring" : "Buckle-proof (EN 13906-1)"}
            tone={result.bucklingRisk ? "orange" : "green"}
          />
          {geometry ? (
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <SpringOutlinePreview
                wireDiameter={geometry.wireDiameter}
                meanDiameter={geometry.meanDiameter}
                activeCoils={geometry.activeCoils}
                freeLength={geometry.freeLength}
                unit={lengthUnit}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
