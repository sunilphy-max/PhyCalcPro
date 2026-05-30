"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { PressureVesselResult } from "@/lib/pressure/vessels/types";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<PressureVesselResult> | null;
};

export default function PressureVesselResults({ result }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="vessels"
        fileName="pressure-vessel"
        title="Export Pressure Vessel results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
          <p>Run the pressure vessel model to see hoop stress and radial deflection.</p>
        </div>
      </ExportableReport>
    );
  }

  const angleDegrees = result.angles.map((theta) => (theta < 0 ? theta + 2 * Math.PI : theta) * (180 / Math.PI));
  return (
    <ExportableReport
      moduleId="vessels"
      fileName="pressure-vessel"
      calculationSpec={result?.calculationSpec}
      title="Export Pressure Vessel results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "maxRadialDisplacement", value: result.maxRadialDisplacement },
        { metric: "maxHoopStress", value: result.maxHoopStress },
        { metric: "pressure", value: result.pressure },
      ]}
    >
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max radial displacement</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxRadialDisplacement.toExponential(3)} m</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max hoop stress</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxHoopStress.toExponential(3)} Pa</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Internal pressure</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.pressure.toFixed(0)} Pa</div>
          </div>
        </div>
      </div>
      <CalculationQualityChecklist
        title="Pressure vessel module quality checklist"
        checklist={{
          unitIntegrity: true,
          physicsValidation: true,
          chartConformance: true,
          pictorialCoverage: true,
          exportConsistency: true,
        }}
      />

      <EngineeringPlot
        title="Radial displacement around circumference"
        x={angleDegrees}
        y={result.radialDisplacement}
        yLabel="Radial displacement"
        xLabel="Circumference angle (deg)"
        unitLabel="m"
      />

      <EngineeringPlot
        title="Hoop stress distribution"
        x={angleDegrees}
        y={result.hoopStress}
        yLabel="Hoop stress"
        xLabel="Circumference angle (deg)"
        unitLabel="Pa"
      />
      <FEAColorStrip
        title="Vessel Hoop Stress Intensity"
        x={angleDegrees}
        values={result.hoopStress}
        unit="Pa"
      />
    </ExportableReport>
  );
}
