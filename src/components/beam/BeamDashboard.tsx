import BeamDiagram from "@/components/BeamDiagram";
import EngineeringPlot from "@/components/EngineeringPlot";
export default function BeamDashboard({
  result,
  loads,
  length,
  support,
  onLoadDrag,
}: any) {
  return (
    <div className="grid grid-cols-1 gap-4">
      
      {/* TOP VIEW (Beam + Loads) */}
      <BeamDiagram
        loads={loads}
        length={length}
        support={support}
        onLoadDrag={onLoadDrag}
      />

      {/* MIDDLE: SHEAR */}
      <EngineeringPlot
        title="Shear Force V(x)"
        x={result.x}
        y={result.shear}
        yLabel="V"
      />

      {/* MIDDLE: MOMENT */}
      <EngineeringPlot
        title="Bending Moment M(x)"
        x={result.x}
        y={result.moment}
        yLabel="M"
      />

      {/* LOWER: DEFLECTION */}
      <EngineeringPlot
        title="Deflection y(x)"
        x={result.x}
        y={result.deflection}
        yLabel="y"
      />

      {/* SUMMARY STRIP */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>Max Moment: {result.maxMoment}</div>
        <div>Max Shear: {result.maxShear}</div>
        <div>Max Deflection: {result.maxDeflection}</div>
      </div>
    </div>
  );
}