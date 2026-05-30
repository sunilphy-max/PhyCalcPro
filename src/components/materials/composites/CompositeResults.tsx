import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { CompositeResult } from "@/lib/materials/composites/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";

type Props = {
  result: WithCalculationSpec<CompositeResult> | null;
  stressUnit: string;
  densityUnit: string;
};

export default function CompositeResults({ result, stressUnit, densityUnit }: Props) {
  if (!result) {
    return (
      <CalculatorResultsShell
      moduleId="composites"
        fileName="composite"
        title="Export Composite results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Enter fiber and matrix properties to estimate composite stiffness, strength, and density.</p>
        </div>
      </CalculatorResultsShell>
    );
  }

  return (
    <CalculatorResultsShell
      moduleId="composites"
      fileName="composite"
      calculationSpec={result?.calculationSpec}
      title="Export Composite results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "E_longitudinal", value: result.E_longitudinal },
        { metric: "E_transverse", value: result.E_transverse },
        { metric: "density", value: result.density },
        { metric: "stiffnessRatio", value: result.stiffnessRatio },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Composite property summary</h2>
          <p className="text-sm text-slate-500 mt-1">Rule-of-mixtures estimates for longitudinal and transverse behavior.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Volume balance</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Fiber volume fraction</dt>
                <dd>{(result.fiberVolumeFraction * 100).toFixed(0)}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Matrix volume fraction</dt>
                <dd>{(result.matrixVolumeFraction * 100).toFixed(0)}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Density</dt>
                <dd>{fromBase(result.density, "density", densityUnit).toFixed(1)} {densityUnit}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Elastic properties</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Longitudinal modulus</dt>
                <dd>{fromBase(result.E_longitudinal, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Transverse modulus</dt>
                <dd>{fromBase(result.E_transverse, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Effective Poisson's ratio</dt>
                <dd>{result.poissonRatio.toFixed(3)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Strength estimates</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Longitudinal strength</dt>
              <dd>{fromBase(result.strength_longitudinal, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Transverse strength</dt>
              <dd>{fromBase(result.strength_transverse, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Stiffness ratio</dt>
              <dd>{result.stiffnessRatio.toFixed(2)}× matrix</dd>
            </div>
          </dl>
        </div>
      </div>
    </CalculatorResultsShell>
  );
}
