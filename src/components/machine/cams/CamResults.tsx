import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { CamResult } from "@/lib/machine/cams/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";

type Props = {
  result: WithCalculationSpec<CamResult> | null;
  lengthUnit: string;
};

export default function CamResults({ result, lengthUnit }: Props) {
  if (!result) {
    return (
      <CalculatorResultsShell
      moduleId="cams"
        fileName="cam"
        title="Export Cam results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Cam analysis results</h2>
          <p className="text-slate-500 mt-2">Run the analysis to preview peak velocity, acceleration, and pressure angle.</p>
        </div>
      </CalculatorResultsShell>
    );
  }

  const lift = fromBase(result.lift, "length", lengthUnit);
  const baseCircle = fromBase(result.baseCircle, "length", lengthUnit);
  const radius = fromBase(result.radius, "length", lengthUnit);

  return (
    <CalculatorResultsShell
      moduleId="cams"
      fileName="cam"
      calculationSpec={result?.calculationSpec}
      title="Export Cam results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "peakVelocity", value: result.peakVelocity },
        { metric: "peakAcceleration", value: result.peakAcceleration },
        { metric: "peakPressureAngle", value: result.peakPressureAngle },
        { metric: "riseAngle", value: result.riseAngle },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cam performance</h2>
          <p className="text-sm text-slate-500 mt-1">Summarized results for the selected follower and motion law.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Geometry</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Lift</dt>
                <dd>{lift.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Base circle</dt>
                <dd>{baseCircle.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Follower radius</dt>
                <dd>{radius.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Motion law</dt>
                <dd className="capitalize">{result.motionLaw.replace(/_/g, " ")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Kinematics</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Peak velocity</dt>
                <dd>{result.peakVelocity.toFixed(3)} {lengthUnit}/rad</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Peak acceleration</dt>
                <dd>{result.peakAcceleration.toFixed(3)} {lengthUnit}/rad²</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Peak pressure angle</dt>
                <dd>{(result.peakPressureAngle * (180 / Math.PI)).toFixed(1)}°</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Rise angle</dt>
                <dd>{result.riseAngle.toFixed(0)}°</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </CalculatorResultsShell>
  );
}
