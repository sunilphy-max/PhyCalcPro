import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { HydraulicsResult } from "@/lib/pressure/hydraulics/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<HydraulicsResult> | null;
  lengthUnit: string;
  pressureUnit: string;
  forceUnit: string;
};

export default function HydraulicsResults({ result, lengthUnit, pressureUnit, forceUnit }: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="hydraulics"
        title="Export Hydraulics results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Run the hydraulic cylinder model to see force, pressure, and rod stress predictions.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      fileName="hydraulics"
      calculationSpec={result?.calculationSpec}
      title="Export Hydraulics results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "extendForce", value: result.extendForce },
        { metric: "retractForce", value: result.retractForce },
        { metric: "requiredPressure", value: result.requiredPressure },
        { metric: "rodStress", value: result.rodStress },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Hydraulic cylinder summary</h2>
          <p className="text-sm text-slate-500 mt-1">Review actuator force, rod behavior, and fluid volume requirements.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Cylinder geometry</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Piston area</dt>
                <dd>{result.pistonArea.toFixed(6)} m²</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Rod area</dt>
                <dd>{result.rodArea.toFixed(6)} m²</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Annulus area</dt>
                <dd>{result.annulusArea.toFixed(6)} m²</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Fluid volume</dt>
                <dd>{result.fluidVolume.toFixed(6)} m³</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Actuator forces</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Extend force</dt>
                <dd>{fromBase(result.extendForce, "force", forceUnit).toFixed(1)} {forceUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Retract force</dt>
                <dd>{fromBase(result.retractForce, "force", forceUnit).toFixed(1)} {forceUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Required pressure</dt>
                <dd>{fromBase(result.requiredPressure, "pressure", pressureUnit).toFixed(1)} {pressureUnit}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Rod loading</h3>
              <p className="text-sm text-slate-500 mt-1">Check the rod stress for extension force transfer.</p>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {fromBase(result.rodStress, "stress", pressureUnit).toFixed(1)} {pressureUnit}
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Pressure utilization</span>
              <span>{(result.pressureUtilization * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Force goal</span>
              <span>{fromBase(result.requiredPressure * result.pistonArea, "force", forceUnit).toFixed(1)} {forceUnit}</span>
            </div>
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
