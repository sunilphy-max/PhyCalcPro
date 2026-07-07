"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import FrameInputs from "@/components/structural/frames/FrameInputs";
import FrameResults from "@/components/structural/frames/FrameResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveFrameEngine } from "@/lib/structural/frames/engine";
import type { FrameResult } from "@/lib/structural/frames/types";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
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
  const [sectionDesignation, setSectionDesignation] = useState("");
  const [result, setResult] = useState<FrameResult | null>(null);
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const applySectionProperties = useCallback(
    (_designation: string, section: RolledSectionProps) => {
      setArea(section.area);
      setI(section.ix);
    },
    []
  );

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

    const raw = solveFrameEngine(config);
    setResult(wrapResult(raw));
    completePowerTrainStep("frames", `Max moment ${(raw.maxMoment / 1000).toFixed(2)} kN·m`);
  };


  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      length: toBase(span, "length", spanUnit),
      height: toBase(height, "length", heightUnit),
      maxForce: toBase(load, "force", loadUnit),
      E: toBase(E, "stress", EUnit),
      I: toBase(I, "inertia", inertiaUnit),
      area: toBase(area, "area", areaUnit),
    }),
    [span, spanUnit, height, heightUnit, load, loadUnit, E, EUnit, I, inertiaUnit, area, areaUnit]
  );

  useSyncDesignInputs("frames", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.sectionDesignation != null) setSectionDesignation(String(fields.sectionDesignation));
    if (fields.I != null) setI(fields.I as number);
    if (fields.area != null) setArea(fields.area as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("frames", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="frames"
      title="Frame Analysis"
      inputs={
        <div className="space-y-4">
          <CrossCalcHandoffBanner
            moduleId="frames"
            onApply={(params) => {
              if (params.reactionForce != null) {
                setLoad(fromBase(params.reactionForce, "force", loadUnit));
              }
            }}
          />
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
          sectionDesignation={sectionDesignation}
          setSectionDesignation={setSectionDesignation}
          onSectionApplied={applySectionProperties}
          onCalculate={calculate}
        />
        </div>
      }
      results={<FrameResults result={result} />}
    />
  );
}
