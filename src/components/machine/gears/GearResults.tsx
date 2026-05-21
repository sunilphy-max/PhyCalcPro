import { fromBase } from "@/lib/units/conversions";
import type { GearResult } from "@/lib/machine/gears/types";

type Props = {
  result: GearResult | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function GearResults({ result, lengthUnit, stressUnit }: Props) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Results</h2>
        <p className="text-slate-500 mt-2">Run the analysis to review gear geometry and root bending stress.</p>
      </div>
    );
  }

  const pitchDiameterPinion = fromBase(result.pitchDiameterPinion, "length", lengthUnit);
  const pitchDiameterGear = fromBase(result.pitchDiameterGear, "length", lengthUnit);
  const bendingStress = fromBase(result.bendingStress, "stress", stressUnit);
  const allowableStress = fromBase(result.allowableStress, "stress", stressUnit);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Performance Summary</h2>
        <p className="text-slate-500 mt-1">Review calculated gear pitch diameters, forces, and the bending safety factor.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Geometry</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Pinion diameter</dt>
              <dd>{pitchDiameterPinion.toFixed(3)} {lengthUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Gear diameter</dt>
              <dd>{pitchDiameterGear.toFixed(3)} {lengthUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Actual ratio</dt>
              <dd>{result.actualRatio.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Lewis factor</dt>
              <dd>{result.lewisY.toFixed(3)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Loads</h3>
          <dl className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Torque</dt>
              <dd>{result.torque.toFixed(1)} N·m</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Tangential force</dt>
              <dd>{result.tangentialForce.toFixed(0)} N</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Root bending stress</dt>
              <dd>{bendingStress.toFixed(1)} {stressUnit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Allowable stress</dt>
              <dd>{allowableStress.toFixed(0)} {stressUnit}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Safety factor</h3>
            <p className="text-slate-500 mt-1">Based on bending strength and selected material.</p>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {result.safetyFactor.toFixed(2)}×
          </div>
        </div>
      </div>
    </div>
  );
}
