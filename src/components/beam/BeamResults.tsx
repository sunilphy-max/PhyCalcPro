import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
import ResultCards from "@/components/ResultCards";
import type { Load } from "@/lib/beam/types";

type Props = {
  result: any;
  length: number;
  support: "simply_supported" | "cantilever" | "fixed_fixed";
  loads: Load[];
};

export default function BeamResults({
  result,
  length,
  support,
  loads,
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

      {/* BEAM DIAGRAM */}
      <BeamDiagram
        length={length}
        support={support}
        loads={loads}
      />

      {/* SUMMARY CARDS */}
      <ResultCards result={result} />

      {/* ENGINEERING PLOTS */}
      <EngineeringPlot
        title="Shear Force Diagram"
        x={result.x}
        y={result.shear}
        yLabel="Force"
      />

      <EngineeringPlot
        title="Bending Moment Diagram"
        x={result.x}
        y={result.moment}
        yLabel="Moment"
      />

      <EngineeringPlot
        title="Deflection Diagram"
        x={result.x}
        y={result.deflection}
        yLabel="Deflection"
      />

      <EngineeringPlot
        title="Stress Distribution"
        x={result.x}
        y={result.stress}
        yLabel="Stress"
      />
    </div>
  );
}