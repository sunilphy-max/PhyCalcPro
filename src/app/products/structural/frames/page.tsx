"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import FrameInputs from "@/components/structural/frames/FrameInputs";
import FrameResults from "@/components/structural/frames/FrameResults";
import { toBase } from "@/lib/units/conversions";
import { solveFrameEngine } from "@/lib/structural/frames/engine";
import type { FrameResult } from "@/lib/structural/frames/types";

export default function Page() {
  const { wrapResult } = useStandardCalculation("frames");
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

    setResult(wrapResult(solveFrameEngine(config)));
  };

  return (
    <CalculatorLayout
      moduleId="frames"
      title="Frame Analysis"
      inputs={
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
      results={<FrameResults result={result} />}
    />
  );
}
