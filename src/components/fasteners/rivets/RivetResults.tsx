import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { RivetResult } from "@/lib/fasteners/rivets/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<RivetResult> | null;
  lengthUnit: string;
  forceUnit: string;
  stressUnit: string;
};

export default function RivetResults({ result, lengthUnit, forceUnit, stressUnit }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="rivets"
        fileName="rivet"
        title="Export Rivet results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Rivet joint results</h2>
          <p className="text-slate-500 mt-2">Run the evaluation to see stress distribution and the controlling failure mode.</p>
        </div>
      </ExportableReport>
    );
  }

  const diameter = fromBase(result.rivetDiameter, "length", lengthUnit);
  const thickness = fromBase(result.plateThickness, "length", lengthUnit);

  return (
    <ExportableReport
      moduleId="rivets"
      fileName="rivet"
      calculationSpec={result?.calculationSpec}
      title="Export Rivet results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "shearStress", value: result.shearStress },
        { metric: "vonMisesStress", value: result.vonMisesStress },
        { metric: "safetyFactorOverall", value: result.safetyFactorOverall },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rivet evaluation summary</h2>
          <p className="text-sm text-slate-500 mt-1">The lowest safety factor governs the design result.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Geometry</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Diameter</dt>
                <dd>{diameter.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Plate thickness</dt>
                <dd>{thickness.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Quantity</dt>
                <dd>{result.quantity}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Rivet type</dt>
                <dd className="capitalize">{result.rivetType.replace("_", " ")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Stress checks</h3>
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
                <dt>Bearing stress</dt>
                <dd>{fromBase(result.bearingStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Von Mises</dt>
                <dd>{fromBase(result.vonMisesStress, "stress", stressUnit).toFixed(1)} {stressUnit}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Safety factors</h3>
              <p className="text-sm text-slate-500 mt-1">The design is governed by the lowest factor.</p>
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
              <span>Bearing SF</span>
              <span>{result.safetyFactorBearing.toFixed(2)}×</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            Status: {result.designStatus.toUpperCase()} ({result.governingMode})
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
