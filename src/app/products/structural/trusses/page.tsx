"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import TrussInputs from "@/components/structural/trusses/TrussInputs";
import TrussResults from "@/components/structural/trusses/TrussResults";
import { toBase } from "@/lib/units/conversions";
import { solveTrussEngine } from "@/lib/structural/trusses/engine";
import type { TrussResult } from "@/lib/structural/trusses/types";

export default function Page() {
  const [span, setSpan] = useState(6);
  const [height, setHeight] = useState(1.2);
  const [panels, setPanels] = useState(4);
  const [area, setArea] = useState(0.005);
  const [E, setE] = useState(210e9);
  const [load, setLoad] = useState(10000);
  const [spanUnit, setSpanUnit] = useState("m");
  const [heightUnit, setHeightUnit] = useState("m");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [loadUnit, setLoadUnit] = useState("N");
  const [EUnit, setEUnit] = useState("Pa");
  const [meshSegments, setMeshSegments] = useState(4);
  const [result, setResult] = useState<TrussResult | null>(null);

  const calculate = () => {
    const config = {
      span: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      panels: meshSegments < 2 ? 2 : Math.round(meshSegments),
      A: toBase(area, "area", areaUnit),
      E: toBase(E, "stress", EUnit),
      load: toBase(load, "force", loadUnit),
    };

    setResult(solveTrussEngine(config));
  };

  return (
    <DashboardLayout title="Truss Analysis">
      <CalculatorLayout
        title="Truss Analysis"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Mesh & loading</h3>
              <p className="text-sm text-slate-500 mt-1">
                Refine the truss panels and visualize the solution with accurate axial force results.
              </p>
            </div>
            <MeshControls
              elements={meshSegments}
              onChangeElements={setMeshSegments}
              refine
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold">Panel count</div>
              <div className="text-slate-700 mt-2">{meshSegments} panels</div>
            </div>
          </div>
        }
        center={
          <TrussInputs
            span={span}
            setSpan={setSpan}
            height={height}
            setHeight={setHeight}
            panels={meshSegments}
            setPanels={setMeshSegments}
            area={area}
            setArea={setArea}
            E={E}
            setE={setE}
            load={load}
            setLoad={setLoad}
            spanUnit={spanUnit}
            setSpanUnit={setSpanUnit}
            heightUnit={heightUnit}
            setHeightUnit={setHeightUnit}
            areaUnit={areaUnit}
            setAreaUnit={setAreaUnit}
            loadUnit={loadUnit}
            setLoadUnit={setLoadUnit}
            EUnit={EUnit}
            setEUnit={setEUnit}
            onCalculate={calculate}
          />
        }
        right={<TrussResults result={result} />}
      />
    </DashboardLayout>
  );
}
