import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { SafetyFactorResult } from "@/lib/fasteners/safetyFactor/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<SafetyFactorResult> | null;
  lengthUnit: string;
  forceUnit: string;
  momentUnit: string;
  torqueUnit: string;
  stressUnit: string;
};

export default function SafetyFactorResults({
  result,
  lengthUnit,
  forceUnit,
  momentUnit,
  torqueUnit,
  stressUnit,
}: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="safety-factor"
        title="Export Safety Factor results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Safety factor results</h2>
          <p className="text-slate-500 mt-2">Enter member geometry and loads to calculate combined stress and factor of safety.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      fileName="safety-factor"
      calculationSpec={result?.calculationSpec}
      title="Export Safety Factor results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "vonMisesStress", value: result.vonMisesStress },
        { metric: "safetyFactorYield", value: result.safetyFactorYield },
        { metric: "governingFactor", value: result.governingFactor },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Combined loading summary</h2>
          <p className="text-sm text-slate-500 mt-1">Review the stress state and determine the governing design safety factor.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Geometry</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Diameter</dt>
                <dd>{fromBase(result.diameter, "length", lengthUnit).toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Gross area</dt>
                <dd>{result.area.toFixed(6)} m²</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Polar moment</dt>
                <dd>{result.polarMoment.toExponential(2)} m⁴</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Stress components</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Axial stress</dt>
                <dd>{fromBase(result.axialStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Bending stress</dt>
                <dd>{fromBase(result.bendingStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Torsional shear</dt>
                <dd>{fromBase(result.torsionalStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Shear stress</dt>
                <dd>{fromBase(result.shearStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Combined state</h3>
              <p className="text-sm text-slate-500 mt-1">The Von Mises equivalent stress represents the controlling failure mode.</p>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {fromBase(result.vonMisesStress, "stress", stressUnit).toFixed(1)} {stressUnit}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Safety factors</h3>
              <p className="text-sm text-slate-500 mt-1">The smallest design factor governs the component rating.</p>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {result.governingFactor.toFixed(2)}×
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Yield factor</span>
              <span>{result.safetyFactorYield.toFixed(2)}×</span>
            </div>
            <div className="flex justify-between">
              <span>Ultimate factor</span>
              <span>{result.safetyFactorUltimate.toFixed(2)}×</span>
            </div>
            <div className="flex justify-between">
              <span>Governing limit</span>
              <span className="capitalize">{result.governingLimit}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-slate-900">
            Status: {result.designStatus.toUpperCase()}
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
