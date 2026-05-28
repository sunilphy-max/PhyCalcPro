import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CamToolpathsResult } from "@/lib/manufacturing/camToolpaths/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<CamToolpathsResult> | null;
};

export default function CamToolpathsResults({ result }: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="cam-toolpaths"
        title="Export Cam Toolpaths results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Enter tool and stock parameters to estimate feed, material removal, and cut time.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      fileName="cam-toolpaths"
      calculationSpec={result?.calculationSpec}
      title="Export Cam Toolpaths results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "feedRate", value: result.feedRate },
        { metric: "materialRemovalRate", value: result.materialRemovalRate },
        { metric: "totalCutTime", value: result.totalCutTime },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">CAM toolpath summary</h2>
          <p className="text-sm text-slate-500 mt-1">Review feed conditions and expected machining time for the defined roughing toolpath.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Cutting parameters</h3>
            <div className="grid gap-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Feed rate</span><span>{result.feedRate.toFixed(0)} mm/min</span></div>
              <div className="flex justify-between"><span>Surface speed</span><span>{result.surfaceSpeed.toFixed(1)} m/min</span></div>
              <div className="flex justify-between"><span>Chip load</span><span>{result.feedPerTooth.toFixed(3)} mm/tooth</span></div>
              <div className="flex justify-between"><span>Step-over width</span><span>{result.stepOverWidth.toFixed(1)} mm</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Material removal</h3>
            <div className="grid gap-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Axial depth</span><span>{result.axialDepth.toFixed(1)} mm</span></div>
              <div className="flex justify-between"><span>Radial depth</span><span>{result.radialDepth.toFixed(1)} mm</span></div>
              <div className="flex justify-between"><span>Pass count</span><span>{result.passes}</span></div>
              <div className="flex justify-between"><span>MRR</span><span>{(result.materialRemovalRate / 1000).toFixed(1)} cm³/min</span></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between"><span>Time per pass</span><span>{result.timePerPass.toFixed(2)} min</span></div>
          <div className="flex justify-between"><span>Total cut time</span><span>{result.totalCutTime.toFixed(2)} min</span></div>
        </div>
      </div>
    </ExportableReport>
  );
}
