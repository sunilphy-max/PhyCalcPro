import type { WithCalculationSpec } from "@/lib/standards/types";
import ExportableReport from "@/components/shared/ExportableReport";

type SectionResult = {
  shape: string;
  area: number;
  centroidY: number;
  Ixx: number;
  Iyy: number;
};

type Props = {
  result: WithCalculationSpec<SectionResult> | null;
  linearUnit: string;
  areaUnit: string;
  inertiaUnit: string;
};

export default function SectionResults({ result, linearUnit, areaUnit, inertiaUnit }: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="section"
        title="Export Section results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Choose a section and calculate its area and inertia properties.</p>
        </div>
      </ExportableReport>
    );
  }

  const formatLinear = (value: number) => `${value.toFixed(4)} ${linearUnit}`;
  const formatArea = (value: number) => `${value.toFixed(6)} ${areaUnit}`;
  const formatInertia = (value: number) => `${value.toFixed(8)} ${inertiaUnit}`;

  return (
    <ExportableReport
      fileName="section"
      calculationSpec={result.calculationSpec}
      title="Export Section results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "area", value: result.area },
        { metric: "centroidY", value: result.centroidY },
        { metric: "Ixx", value: result.Ixx },
        { metric: "Iyy", value: result.Iyy },
      ]}
    >
      <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Section Properties</h3>
          <div className="text-sm text-slate-500 mt-1">Shape: {result.shape}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Area</div>
            <div className="mt-2 text-slate-900">{formatArea(result.area)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Centroid Y</div>
            <div className="mt-2 text-slate-900">{formatLinear(result.centroidY)}</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Ixx</div>
            <div className="mt-2 text-slate-900">{formatInertia(result.Ixx)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Iyy</div>
            <div className="mt-2 text-slate-900">{formatInertia(result.Iyy)}</div>
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
