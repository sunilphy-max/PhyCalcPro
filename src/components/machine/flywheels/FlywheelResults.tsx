import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { FlywheelResult } from "@/lib/machine/flywheels/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<FlywheelResult> | null;
  lengthUnit: string;
  densityUnit: string;
  stressUnit: string;
};

export default function FlywheelResults({ result, lengthUnit, densityUnit, stressUnit }: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="flywheel"
        title="Export Flywheel results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Flywheel results</h2>
          <p className="text-slate-500 mt-2">Run the calculation to review stored energy, inertia, and rim stress.</p>
        </div>
      </ExportableReport>
    );
  }

  const outerDiameter = fromBase(result.outerDiameter, "length", lengthUnit);
  const thickness = fromBase(result.thickness, "length", lengthUnit);

  return (
    <ExportableReport
      fileName="flywheel"
      calculationSpec={result?.calculationSpec}
      title="Export Flywheel results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "storedEnergy", value: result.storedEnergy },
        { metric: "inertia", value: result.inertia },
        { metric: "hoopStress", value: result.hoopStress },
        { metric: "safetyFactor", value: result.safetyFactor },
      ]}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Flywheel performance summary</h2>
          <p className="text-sm text-slate-500 mt-1">Review the kinetic energy and stress capacity of the current design.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Geometry</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Outer diameter</dt>
                <dd>{outerDiameter.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Thickness</dt>
                <dd>{thickness.toFixed(3)} {lengthUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Mass</dt>
                <dd>{result.mass.toFixed(1)} kg</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Inertia</dt>
                <dd>{result.inertia.toFixed(3)} kg·m²</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Performance</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Stored energy</dt>
                <dd>{result.storedEnergy.toFixed(0)} J</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Angular speed</dt>
                <dd>{result.angularSpeed.toFixed(1)} rad/s</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Hoop stress</dt>
                <dd>{fromBase(result.hoopStress, "stress", stressUnit).toFixed(0)} {stressUnit}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Safety factor</dt>
                <dd>{result.safetyFactor.toFixed(2)}×</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
