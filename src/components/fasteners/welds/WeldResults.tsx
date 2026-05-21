import { fromBase } from "@/lib/units/conversions";
import type { WeldResult } from "@/lib/fasteners/welds/types";

type Props = {
  result: WeldResult | null;
  lengthUnit: string;
  forceUnit: string;
  stressUnit: string;
};

export default function WeldResults({ result, lengthUnit, forceUnit, stressUnit }: Props) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Weld analysis results</h2>
        <p className="text-slate-500 mt-2">Run the evaluation to see governing weld stress and safety factors.</p>
      </div>
    );
  }

  const weldSize = fromBase(result.weldSize, "length", lengthUnit);
  const throatSize = fromBase(result.throatSize, "length", lengthUnit);
  const weldLength = fromBase(result.weldLength, "length", lengthUnit);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Weld design summary</h2>
        <p className="text-sm text-slate-500 mt-1">Review throat area, stresses, and the controlling failure mode.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Geometry</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Weld type</dt>
              <dd className="capitalize">{result.weldType.replace("_", " ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Weld size</dt>
              <dd>{weldSize.toFixed(3)} {lengthUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Throat size</dt>
              <dd>{throatSize.toFixed(3)} {lengthUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Total throat area</dt>
              <dd>{result.totalThroatArea.toFixed(6)} m²</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Stress state</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Shear stress</dt>
              <dd>{fromBase(result.shearStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Axial stress</dt>
              <dd>{fromBase(result.axialStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Resultant stress</dt>
              <dd>{fromBase(result.resultantStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Safety factors</h3>
            <p className="text-sm text-slate-500 mt-1">The smallest factor controls the weld design.</p>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {result.safetyFactorOverall.toFixed(2)}×
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Shear SF</span>
            <span>{result.safetyFactorShear.toFixed(2)}×</span>
          </div>
          <div className="flex justify-between">
            <span>Axial SF</span>
            <span>{result.safetyFactorAxial.toFixed(2)}×</span>
          </div>
          <div className="flex justify-between">
            <span>Resultant SF</span>
            <span>{result.safetyFactorResultant.toFixed(2)}×</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
          Status: {result.designStatus.toUpperCase()} ({result.governingMode})
        </div>
      </div>
    </div>
  );
}
