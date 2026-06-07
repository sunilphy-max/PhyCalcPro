"use client";

import { toBase } from "@/lib/units/conversions";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import VibrationInputs from "@/components/dynamics/vibrations/VibrationInputs";
import VibrationResults from "@/components/dynamics/vibrations/VibrationResults";
import { normalizeInput } from "@/lib/physics";
import { solveVibrationEngine } from "@/lib/dynamics/vibrations/engine";
import type { VibrationResult, SupportType } from "@/lib/dynamics/vibrations/types";
import { useCalculationPipeline } from "@/hooks/useCalculationPipeline";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("vibrations");
  const [length, setLength] = useState(5);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [E, setE] = useState(210e9);
  const [EUnit, setEUnit] = useState("Pa");
  const [A, setA] = useState(0.005);
  const [areaUnit, setAreaUnit] = useState("m2");
  const [I, setI] = useState(8e-6);
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [rho, setRho] = useState(7850);
  const [rhoUnit, setRhoUnit] = useState("kg/m3");
  const [segments, setSegments] = useState(12);
  const [support, setSupport] = useState<SupportType>("simply_supported");
  const [dampingRatio, setDampingRatio] = useState(0.02);
  const [result, setResult] = useState<VibrationResult | null>(null);
  const vibrationPipeline = useCalculationPipeline({
    normalize: (input: {
      length: number;
      E: number;
      A: number;
      I: number;
      rho: number;
      segments: number;
      support: SupportType;
      dampingRatio: number;
    }) => ({
      length: normalizeInput({ value: input.length, unit: lengthUnit, dimension: "length" }),
      E: normalizeInput({ value: input.E, unit: EUnit, dimension: "stress" }),
      A: normalizeInput({ value: input.A, unit: areaUnit, dimension: "area" }),
      I: normalizeInput({ value: input.I, unit: inertiaUnit, dimension: "inertia" }),
      rho: normalizeInput({ value: input.rho, unit: rhoUnit, dimension: "density" }),
      segments: Math.max(2, Math.round(input.segments)),
      support: input.support,
      dampingRatio: Math.min(0.5, Math.max(0, input.dampingRatio)),
    }),
    solve: (normalized) => solveVibrationEngine(normalized),
    convertOutput: (raw) => raw,
  });

  const runCheck = () => {
    const { output: solved } = vibrationPipeline.run({
      length,
      E,
      A,
      I,
      rho,
      segments,
      support,
      dampingRatio,
    });
    setResult(wrapResult(solved));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      length: toBase(length, "length", lengthUnit),
      E: toBase(E, "stress", EUnit),
      inertia: toBase(I, "inertia", inertiaUnit),
      dampingRatio,
    }), [length, lengthUnit, E, EUnit, I, inertiaUnit, dampingRatio]);

  useSyncDesignInputs("vibrations", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.inertia != null) setI(fields.inertia as never);
    if (fields.I != null) setI(fields.I as never);
  }, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("vibrations", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="vibrations"
      title="Vibration Analysis"
      inputs={
        <VibrationInputs
          length={length}
          setLength={setLength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          E={E}
          setE={setE}
          EUnit={EUnit}
          setEUnit={setEUnit}
          I={I}
          setI={setI}
          inertiaUnit={inertiaUnit}
          setInertiaUnit={setInertiaUnit}
          A={A}
          setA={setA}
          areaUnit={areaUnit}
          setAreaUnit={setAreaUnit}
          rho={rho}
          setRho={setRho}
          rhoUnit={rhoUnit}
          setRhoUnit={setRhoUnit}
          segments={segments}
          setSegments={setSegments}
          support={support}
          setSupport={setSupport}
          dampingRatio={dampingRatio}
          setDampingRatio={setDampingRatio}
          onCalculate={calculate}
        />
      }
      results={<VibrationResults result={result} />}
    />
  );
}
