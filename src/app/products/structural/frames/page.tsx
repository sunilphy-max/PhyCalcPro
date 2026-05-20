"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import FrameInputs from "@/components/structural/frames/FrameInputs";
import FrameResults from "@/components/structural/frames/FrameResults";
import { toBase } from "@/lib/units/conversions";
import { solveFrameEngine } from "@/lib/structural/frames/engine";
import type { FrameResult } from "@/lib/structural/frames/types";

export default function Page() {
  const [span, setSpan] = useState(6);
  const [height, setHeight] = useState(3);
  const [segments, setSegments] = useState(3);
  const [area, setArea] = useState(0.005);
  const [I, setI] = useState(1e-5);
  const [E, setE] = useState(210e9);
  const [load, setLoad] = useState(20000);
  const [spanUnit, setSpanUnit] = useState("m");
  const [heightUnit, setHeightUnit] = useState("m");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [loadUnit, setLoadUnit] = useState("N");
  const [EUnit, setEUnit] = useState("Pa");
  const [result, setResult] = useState<FrameResult | null>(null);

  const calculate = () => {
    const config = {
      span: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      segments: segments < 1 ? 1 : Math.round(segments),
      A: toBase(area, "area", areaUnit),
      I: toBase(I, "inertia", inertiaUnit),
      E: toBase(E, "stress", EUnit),
      load: toBase(load, "force", loadUnit),
    };

    setResult(solveFrameEngine(config));
  };

  return (
    <DashboardLayout title="Frame Analysis">
      <CalculatorLayout
        title="Frame Analysis"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Analysis control</h3>
              <p className="text-sm text-slate-500 mt-1">
                Adjust the beam mesh density and review the portal frame response.
              </p>
            </div>
            <MeshControls
              elements={segments}
              onChangeElements={setSegments}
              refine
            />
          </div>
        }
        center={
          <FrameInputs
            span={span}
            setSpan={setSpan}
            height={height}
            setHeight={setHeight}
            segments={segments}
            setSegments={setSegments}
            area={area}
            setArea={setArea}
            I={I}
            setI={setI}
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
            inertiaUnit={inertiaUnit}
            setInertiaUnit={setInertiaUnit}
            loadUnit={loadUnit}
            setLoadUnit={setLoadUnit}
            EUnit={EUnit}
            setEUnit={setEUnit}
            onCalculate={calculate}
          />
        }
        right={<FrameResults result={result} />}
      />
    </DashboardLayout>
  );
}
