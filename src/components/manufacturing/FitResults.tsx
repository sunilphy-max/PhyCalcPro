import { useRef } from "react";
import ResultExportControls from "@/components/ResultExportControls";
type Props = {
  result: {
    holeMin: number;
    holeMax: number;
    shaftMin: number;
    shaftMax: number;
    clearanceMin: number;
    clearanceMax: number;
    fitType: "clearance" | "transition" | "interference";
  } | null;
  displayUnit: string;
};

export default function FitResults({ result, displayUnit }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="fit" title="Export Fit results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
        <p>Select values and calculate the fit to view results.</p>
      </div>
    );
  }

  const format = (value: number) => `${value.toFixed(4)} ${displayUnit}`;

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <div className="text-lg font-semibold text-slate-900">Fit Results</div>
        <div className="text-sm text-slate-500 mt-1">Type: {result.fitType}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm uppercase tracking-wide text-slate-500">Hole</div>
          <div className="mt-2 text-slate-900">{format(result.holeMin)} to {format(result.holeMax)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm uppercase tracking-wide text-slate-500">Shaft</div>
          <div className="mt-2 text-slate-900">{format(result.shaftMin)} to {format(result.shaftMax)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm uppercase tracking-wide text-slate-500">Clearance range</div>
        <div className="mt-2 text-slate-900">{format(result.clearanceMin)} to {format(result.clearanceMax)}</div>
      </div>
    </div>
  );
}
