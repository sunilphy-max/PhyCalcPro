import { useRef } from "react";
import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import ResultExportControls from "@/components/ResultExportControls";

type Props = {
  result: BearingResult | null;
  loadUnit: string;
};

export default function BearingResults({ result, loadUnit }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="bearing" title="Export Bearing results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bearing life results</h2>
        <p className="text-slate-500 mt-2">
          Run the calculation to see equivalent loads and dynamic rating requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Bearing design output</h2>
        <p className="text-sm text-slate-500 mt-1">Review the calculated equivalent load and expected bearing life.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Loads</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Radial load</dt>
              <dd>{fromBase(result.radialLoad, "force", loadUnit).toFixed(1)} {loadUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Axial load</dt>
              <dd>{fromBase(result.axialLoad, "force", loadUnit).toFixed(1)} {loadUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Equivalent load</dt>
              <dd>{fromBase(result.equivalentLoad, "force", loadUnit).toFixed(1)} {loadUnit}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Rating</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Required dynamic rating</dt>
              <dd>{result.requiredDynamicRating.toFixed(0)} N</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Expected life</dt>
              <dd>{result.expectedLife.toFixed(1)} hours</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Safety factor</dt>
              <dd>{result.safetyFactor.toFixed(2)}×</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
