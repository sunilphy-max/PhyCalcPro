"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import FrameInputs from "@/components/structural/frames/FrameInputs";
import FrameResults from "@/components/structural/frames/FrameResults";
import { toBase } from "@/lib/units/conversions";
import { solveFrameEngine } from "@/lib/structural/frames/engine";
import type { FrameResult } from "@/lib/structural/frames/types";

export default function Page() {
  const { mode: workflowMode, setUserInputs } = useDesignWorkflow();
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

  const runCheck = () => {
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


  useEffect(() => {
    setUserInputs({
      length: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      maxForce: toBase(load, "force", loadUnit),
      E: toBase(E, "stress", EUnit),
      I: toBase(I, "inertia", inertiaUnit),
      area: toBase(area, "area", areaUnit),
    });
  }, [span, spanUnit, height, heightUnit, load, loadUnit, E, EUnit, I, inertiaUnit, area, areaUnit, setUserInputs]);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.I != null) setI(fields.I as number);
    if (fields.area != null) setArea(fields.area as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("frames", {
        length: toBase(span, "length", spanUnit),
        height: toBase(height, "length", heightUnit),
        maxForce: toBase(load, "force", loadUnit),
        E: toBase(E, "stress", EUnit),
      });
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
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
