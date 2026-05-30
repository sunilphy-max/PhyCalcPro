import type { WithCalculationSpec } from "@/lib/standards/types";
import ExportableReport from "@/components/shared/ExportableReport";

type RotationResult = {
        inertia: number;
        omega: number;
        kineticEnergy: number;
        centripetalAcceleration: number;
        centripetalForce: number;
        torque: number;
      };

type Props = {
  result: WithCalculationSpec<RotationResult> | null;
};

export default function RotationResults({ result }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="rotation"
        fileName="rotation"
        title="Export Rotation results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Enter rotation data and calculate the dynamic response.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      moduleId="rotation"
      fileName="rotation"
      calculationSpec={result.calculationSpec}
      title="Export Rotation results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "inertia", value: result.inertia },
        { metric: "omega", value: result.omega },
        { metric: "kineticEnergy", value: result.kineticEnergy },
        { metric: "torque", value: result.torque },
        { metric: "centripetalAcceleration", value: result.centripetalAcceleration },
        { metric: "centripetalForce", value: result.centripetalForce },
      ]}
    >
      <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Rotation Results</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Inertia</div>
            <div className="mt-2 text-slate-900">{result.inertia.toFixed(4)} kg·m²</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Angular speed</div>
            <div className="mt-2 text-slate-900">{result.omega.toFixed(4)} rad/s</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Kinetic energy</div>
            <div className="mt-2 text-slate-900">{result.kineticEnergy.toFixed(2)} J</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Torque</div>
            <div className="mt-2 text-slate-900">{result.torque.toFixed(2)} N·m</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Centripetal acceleration</div>
            <div className="mt-2 text-slate-900">{result.centripetalAcceleration.toFixed(2)} m/s²</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Centripetal force</div>
            <div className="mt-2 text-slate-900">{result.centripetalForce.toFixed(2)} N</div>
          </div>
        </div>
      </div>
    </ExportableReport>
  );
}
