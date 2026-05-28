"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import VibrationInputs from "@/components/dynamics/vibrations/VibrationInputs";
import VibrationResults from "@/components/dynamics/vibrations/VibrationResults";
import { normalizeInput } from "@/lib/physics";
import { solveVibrationEngine } from "@/lib/dynamics/vibrations/engine";
import type { VibrationResult, SupportType } from "@/lib/dynamics/vibrations/types";
import { useEquationWorkflow } from "@/hooks/useEquationWorkflow";
import { useCalculationPipeline } from "@/hooks/useCalculationPipeline";

export default function Page() {
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
    }) => ({
      length: normalizeInput({ value: input.length, unit: lengthUnit, dimension: "length" }),
      E: normalizeInput({ value: input.E, unit: EUnit, dimension: "stress" }),
      A: normalizeInput({ value: input.A, unit: areaUnit, dimension: "area" }),
      I: normalizeInput({ value: input.I, unit: inertiaUnit, dimension: "inertia" }),
      rho: normalizeInput({ value: input.rho, unit: rhoUnit, dimension: "density" }),
      segments: Math.max(2, Math.round(input.segments)),
      support: input.support,
    }),
    solve: (normalized) => solveVibrationEngine(normalized),
    convertOutput: (raw) => raw,
  });
  const {
    equationExpression,
    setEquationExpression,
    equationValueDisplay,
    equationError,
    runStatusMessage,
    evaluateExpression,
    recordRun,
  } = useEquationWorkflow({
    initialExpression: "(pi/(2*L^2))*sqrt((E*I)/(rho*A))",
    fromBaseOutput: (value) => value,
  });

  const calculate = async () => {
    const { normalized: config, output: solved } = vibrationPipeline.run({
      length,
      E,
      A,
      I,
      rho,
      segments,
      support,
    });
    setResult(solved);

    const { baseValue, failure } = evaluateExpression({
      L: config.length,
      E: config.E,
      I: config.I,
      rho: config.rho,
      A: config.A,
    });

    await recordRun({
      projectId: "vibration-local",
      modelId: "vibration-analysis",
      equationId: "vibration-first-mode",
      input: {
        config,
        units: { lengthUnit, EUnit, areaUnit, inertiaUnit, rhoUnit },
      },
      output: {
        firstModeHz: solved.frequencies[0] ?? null,
        customEquationHz: baseValue,
        equationError: failure,
      },
    });
  };

  return (
    <DashboardLayout title="Vibration Analysis">
      <CalculatorLayout
        title="Dynamic Vibration FEM"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Analysis control</h3>
              <p className="text-sm text-slate-500 mt-1">
                Adjust mesh density and support conditions to capture the first vibration modes.
              </p>
            </div>
            <MeshControls
              elements={segments}
              onChangeElements={setSegments}
              refine
            />
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h3 className="font-semibold">Custom mode equation</h3>
              <p className="text-sm text-slate-500">
                Evaluate a deterministic equation with variables: L, E, I, rho, A.
              </p>
              <input
                className="w-full border rounded p-2 font-mono text-sm"
                value={equationExpression}
                onChange={(event) => setEquationExpression(event.target.value)}
              />
              {equationValueDisplay !== null ? (
                <p className="text-sm">
                  Equation estimate:{" "}
                  <span className="font-semibold">{equationValueDisplay.toFixed(4)} Hz</span>
                </p>
              ) : null}
              {equationError ? <p className="text-xs text-red-600">{equationError}</p> : null}
              {runStatusMessage ? (
                <p className="text-xs text-slate-500">{runStatusMessage}</p>
              ) : null}
            </div>
          </div>
        }
        center={
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
            onCalculate={calculate}
          />
        }
        right={<VibrationResults result={result} />}
      />
    </DashboardLayout>
  );
}
