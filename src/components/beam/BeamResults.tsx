import EngineeringPlot from "@/components/EngineeringPlot";
import type { BeamResult, Load, SupportType } from "@/lib/beam/types";
import BeamDashboard from "@/components/beam/BeamDashboard";

type Props = {
  result: BeamResult | null;
  length: number;
  support: SupportType;
  loads: Load[];

  onLoadDrag?: (
    id: string,
    updates: Partial<Extract<Load, { type: "point" }>>
  ) => void;
};

export default function BeamResults({
  result,
  length,
  support,
  loads,
  onLoadDrag,
}: Props) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">
          Run calculation to see results.
        </p>
      </div>
    );
  }

  return (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <BeamDashboard
      result={result}
      loads={loads}
      length={length}
      support={support}
      onLoadDrag={onLoadDrag}
    />
  </div>
);
}