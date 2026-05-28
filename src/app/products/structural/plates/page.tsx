"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import PlateInputs from "@/components/structural/plates/PlateInputs";
import PlateResults from "@/components/structural/plates/PlateResults";
import { toBase } from "@/lib/units/conversions";
import { solvePlateEngine } from "@/lib/structural/plates/engine";
import type { BoundaryType, PlateResult } from "@/lib/structural/plates/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("plates");
  const [length, setLength] = useState(2);
  const [width, setWidth] = useState(1.2);
  const [thickness, setThickness] = useState(0.015);
  const [pressure, setPressure] = useState(10000);
  const [E, setE] = useState(210e9);
  const [nu, setNu] = useState(0.3);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [thicknessUnit, setThicknessUnit] = useState("mm");
  const [pressureUnit, setPressureUnit] = useState("Pa");
  const [EUnit, setEUnit] = useState("Pa");
  const [meshSegments, setMeshSegments] = useState(8);
  const [boundaryType, setBoundaryType] = useState<BoundaryType>("clamped");
  const [result, setResult] = useState<PlateResult | null>(null);

  const calculate = () => {
    const config = {
      length: toBase(length, "length", lengthUnit),
      width: toBase(width, "length", lengthUnit),
      thickness: toBase(thickness, "length", thicknessUnit),
      E: toBase(E, "stress", EUnit),
      nu,
      q: toBase(pressure, "pressure", pressureUnit),
      elementsX: meshSegments,
      elementsY: meshSegments,
      boundaryType,
    };

    setResult(wrapResult(solvePlateEngine(config)));
  };

  return (
    <DashboardLayout title="Plate Bending Analysis">
      <CalculatorLayout
        moduleId="plates"
        title="Plate Bending Analysis"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Mesh control</h3>
              <p className="text-sm text-slate-500 mt-1">
                Refine the plate mesh for higher accuracy. Larger meshes increase the solver resolution.
              </p>
            </div>
            <MeshControls
              elements={meshSegments}
              onChangeElements={setMeshSegments}
              refine
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm uppercase tracking-wider text-slate-500">Boundary support</div>
              <div className="mt-3 text-slate-900 font-medium">{boundaryType === "clamped" ? "Clamped all edges" : "Simply supported all edges"}</div>
            </div>
          </div>
        }
        center={
          <PlateInputs
            length={length}
            setLength={setLength}
            width={width}
            setWidth={setWidth}
            thickness={thickness}
            setThickness={setThickness}
            pressure={pressure}
            setPressure={setPressure}
            E={E}
            setE={setE}
            nu={nu}
            setNu={setNu}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            thicknessUnit={thicknessUnit}
            setThicknessUnit={setThicknessUnit}
            pressureUnit={pressureUnit}
            setPressureUnit={setPressureUnit}
            EUnit={EUnit}
            setEUnit={setEUnit}
            boundaryType={boundaryType}
            setBoundaryType={setBoundaryType}
            onCalculate={calculate}
          />
        }
        right={<PlateResults result={result} />}
      />
    </DashboardLayout>
  );
}
