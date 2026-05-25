import { useRef } from "react";
import { fromBase } from "@/lib/units/conversions";
import type { HeatExchangerResult } from "@/lib/pressure/heat-exchangers/types";
import ResultExportControls from "@/components/ResultExportControls";

type Props = {
  result: HeatExchangerResult | null;
};

export default function HeatExchangerResults({ result }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="heat-exchanger" title="Export Heat Exchanger results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
        <p>Run the heat exchanger model to see thermal duty, required area, and effectiveness.</p>
      </div>
    </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Heat exchanger summary</h2>
        <p className="text-sm text-slate-500 mt-1">Review the exchanger performance, temperature change, and capacity balance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Thermal performance</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Heat transfer rate</dt>
              <dd>{fromBase(result.heatTransferRate, "power", "W").toFixed(0)} W</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Log mean TD</dt>
              <dd>{result.LMTD.toFixed(2)} K</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Effectiveness</dt>
              <dd>{(result.effectiveness * 100).toFixed(1)}%</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Geometry and sizing</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Design area</dt>
              <dd>{result.area.toFixed(2)} m²</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Required area</dt>
              <dd>{result.requiredArea.toFixed(2)} m²</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>NTU</dt>
              <dd>{result.NTU.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700">Temperature results</h3>
        <dl className="mt-3 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between gap-4">
            <dt>Cold outlet temp</dt>
            <dd>{result.coldOutletTemp.toFixed(1)} °C</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Q maximum</dt>
            <dd>{fromBase(result.Qmax, "power", "W").toFixed(0)} W</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Actual effectiveness</dt>
            <dd>{(result.actualEffectiveness * 100).toFixed(1)}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
