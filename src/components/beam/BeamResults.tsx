import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import ResultCards from "@/components/ResultCards";
import type { Load } from "@/lib/beam/types";
import BeamDashboard from "@/components/beam/BeamDashboard";

type Props = {
  result: any;
  length: number;
  support: "simply_supported" | "cantilever" | "fixed_fixed";
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