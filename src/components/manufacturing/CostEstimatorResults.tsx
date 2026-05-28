import type { CostEstimatorResult } from "@/lib/manufacturing/costEstimator/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: CostEstimatorResult | null;
};

export default function CostEstimatorResults({ result }: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="cost-estimator"
        title="Export Cost Estimator results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Enter material and process assumptions to estimate total production cost.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      fileName="cost-estimator"
      title="Export Cost Estimator results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "materialCost", value: result.materialCost },
        { metric: "machiningCost", value: result.machiningCost },
        { metric: "totalCost", value: result.totalCost },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cost estimation summary</h2>
          <p className="text-sm text-slate-500 mt-1">Review material, process, overhead, and total cost for the part estimate.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Material cost</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Material mass</dt>
                <dd>{result.materialMass.toFixed(2)} kg</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Scrap mass</dt>
                <dd>{result.scrapMass.toFixed(2)} kg</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Material cost</dt>
                <dd>${result.materialCost.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Process cost</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Machine cost</dt>
                <dd>${result.machiningCost.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Labor cost</dt>
                <dd>${result.laborCost.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Finish cost</dt>
                <dd>${result.finishCost.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Overhead cost</dt>
                <dd>${result.overheadCost.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Total cost</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Total manufacturing cost</dt>
              <dd className="font-semibold text-slate-900">${result.totalCost.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Cost per volume</dt>
              <dd>${result.costPerVolume.toFixed(2)} /m³</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Cost per mass</dt>
              <dd>${result.costPerMass.toFixed(2)} /kg</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Effective material cost</dt>
              <dd>${result.effectiveMaterialCost.toFixed(2)}</dd>
            </div>
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
