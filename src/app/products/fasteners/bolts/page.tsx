"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import BoltPatternInputs from "@/components/fasteners/bolts/BoltPatternInputs";
import BoltPatternResults from "@/components/fasteners/bolts/BoltPatternResults";
import Vdi2230Inputs from "@/components/fasteners/bolts/Vdi2230Inputs";
import Vdi2230Results from "@/components/fasteners/bolts/Vdi2230Results";
import { solveBoltPattern } from "@/lib/fasteners/bolts/boltPattern";
import {
  solveVdi2230,
  type BoltPropertyClass,
  type TighteningMethod,
  type Vdi2230Result,
} from "@/lib/fasteners/bolts/vdi2230";
import type { CalculationSpec } from "@/lib/standards/types";
import type { BoltPatternResult } from "@/lib/fasteners/bolts/boltPatternTypes";
import { toBase, fromBase } from "@/lib/units/conversions";
import Link from "next/link";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";

type AnalysisMode = "bolt_pattern" | "vdi2230";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("bolts");
  const [mode, setMode] = useState<AnalysisMode>("vdi2230");

  const [boltCount, setBoltCount] = useState(6);
  const [patternRadius, setPatternRadius] = useState(0.1);
  const [shearForce, setShearForce] = useState(25000);
  const [axialForce, setAxialForce] = useState(10000);
  const [eccentricityX, setEccentricityX] = useState(0.02);
  const [eccentricityY, setEccentricityY] = useState(0);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");

  const [jointSize, setJointSize] = useState("M12");
  const [propertyClass, setPropertyClass] = useState<BoltPropertyClass>("8.8");
  const [tighteningMethod, setTighteningMethod] = useState<TighteningMethod>("torque_wrench");
  const [clampLength, setClampLength] = useState(0.04);
  const [jointAxialLoad, setJointAxialLoad] = useState(15000);
  const [jointTransverseLoad, setJointTransverseLoad] = useState(5000);
  const [threadFriction, setThreadFriction] = useState(0.12);
  const [interfaceFriction, setInterfaceFriction] = useState(0.12);

  const [patternResult, setPatternResult] = useState<BoltPatternResult | null>(null);
  const [vdiResult, setVdiResult] = useState<(Vdi2230Result & { calculationSpec?: CalculationSpec }) | null>(null);
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const runCheck = () => {
    if (mode === "vdi2230") {
      const raw = solveVdi2230({
        size: jointSize,
        propertyClass,
        tighteningMethod,
        clampLength: toBase(clampLength, "length", lengthUnit),
        jointModulus: 205e9,
        axialLoad: toBase(jointAxialLoad, "force", forceUnit),
        transverseLoad: toBase(jointTransverseLoad, "force", forceUnit),
        threadFriction,
        headFriction: threadFriction,
        interfaceFriction,
      });
      setVdiResult(wrapResult(raw));
      setPatternResult(null);

      publishHandoff("frames", {
        fromModuleId: "bolts",
        fromTitle: "Bolt Design",
        summary: `Joint reactions: axial ${(toBase(jointAxialLoad, "force", forceUnit) / 1000).toFixed(2)} kN, transverse ${(toBase(jointTransverseLoad, "force", forceUnit) / 1000).toFixed(2)} kN.`,
        params: {
          reactionForce: Math.hypot(
            toBase(jointAxialLoad, "force", forceUnit),
            toBase(jointTransverseLoad, "force", forceUnit)
          ),
        },
      });
      completePowerTrainStep("bolts", `VDI ${jointSize}`);
      return;
    }
    setVdiResult(null);
    const pattern = solveBoltPattern({
      boltCount: Math.max(2, Math.round(boltCount)),
      patternRadius: toBase(patternRadius, "length", lengthUnit),
      shearForce: toBase(shearForce, "force", forceUnit),
      axialForce: toBase(axialForce, "force", forceUnit),
      eccentricityX: toBase(eccentricityX, "length", lengthUnit),
      eccentricityY: toBase(eccentricityY, "length", lengthUnit),
    });
    setPatternResult(pattern);

    publishHandoff("frames", {
      fromModuleId: "bolts",
      fromTitle: "Bolt Pattern",
      summary: `Pattern resultant ≈ ${(Math.hypot(toBase(shearForce, "force", forceUnit), toBase(axialForce, "force", forceUnit)) / 1000).toFixed(2)} kN.`,
      params: {
        reactionForce: Math.hypot(
          toBase(shearForce, "force", forceUnit),
          toBase(axialForce, "force", forceUnit)
        ),
      },
    });
    completePowerTrainStep("bolts", `${boltCount}-bolt pattern`);
  };

  const designUserInputs = useMemo((): ModuleUserInputs => ({
    maxForce: toBase(shearForce, "force", forceUnit),
    axialLoad: toBase(axialForce, "force", forceUnit),
    allowableStressPa: 260e6,
  }), [shearForce, forceUnit, axialForce]);

  useSyncDesignInputs("bolts", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.boltSize != null) setJointSize(String(fields.boltSize));
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("bolts", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="bolts"
      title="Bolt Design Analysis"
      inputs={
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            Power and ball screw analysis moved to{" "}
            <Link href="/products/machine/power-screws" className="font-semibold underline">
              Power &amp; Ball Screws
            </Link>
            .
          </div>
          <CrossCalcHandoffBanner
            moduleId="bolts"
            onApply={(params) => {
              if (params.tension != null) {
                setJointAxialLoad(fromBase(params.tension, "force", forceUnit));
                setMode("vdi2230");
              }
              if (params.shear != null) {
                setJointTransverseLoad(fromBase(params.shear, "force", forceUnit));
                setMode("vdi2230");
              }
              if (params.boltCount != null) {
                setBoltCount(Math.round(params.boltCount));
                setMode("bolt_pattern");
              }
              if (params.patternDiameter != null) {
                setPatternRadius(fromBase(params.patternDiameter / 2, "length", lengthUnit));
              }
            }}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Analysis mode</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("vdi2230")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "vdi2230" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                VDI 2230 joint
              </button>
              <button
                type="button"
                onClick={() => setMode("bolt_pattern")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "bolt_pattern" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                Bolt pattern
              </button>
            </div>
          </div>
          {mode === "vdi2230" ? (
            <Vdi2230Inputs
              size={jointSize}
              setSize={setJointSize}
              propertyClass={propertyClass}
              setPropertyClass={setPropertyClass}
              tighteningMethod={tighteningMethod}
              setTighteningMethod={setTighteningMethod}
              clampLength={clampLength}
              setClampLength={setClampLength}
              axialLoad={jointAxialLoad}
              setAxialLoad={setJointAxialLoad}
              transverseLoad={jointTransverseLoad}
              setTransverseLoad={setJointTransverseLoad}
              threadFriction={threadFriction}
              setThreadFriction={setThreadFriction}
              interfaceFriction={interfaceFriction}
              setInterfaceFriction={setInterfaceFriction}
              lengthUnit={lengthUnit}
              setLengthUnit={setLengthUnit}
              forceUnit={forceUnit}
              setForceUnit={setForceUnit}
              onCalculate={calculate}
            />
          ) : (
            <BoltPatternInputs
              boltCount={boltCount}
              setBoltCount={setBoltCount}
              patternRadius={patternRadius}
              setPatternRadius={setPatternRadius}
              shearForce={shearForce}
              setShearForce={setShearForce}
              axialForce={axialForce}
              setAxialForce={setAxialForce}
              eccentricityX={eccentricityX}
              setEccentricityX={setEccentricityX}
              eccentricityY={eccentricityY}
              setEccentricityY={setEccentricityY}
              lengthUnit={lengthUnit}
              setLengthUnit={setLengthUnit}
              forceUnit={forceUnit}
              setForceUnit={setForceUnit}
              onCalculate={calculate}
            />
          )}
        </div>
      }
      results={
        mode === "vdi2230" ? (
          <Vdi2230Results result={vdiResult} clampLengthM={toBase(clampLength, "length", lengthUnit)} />
        ) : (
          <BoltPatternResults result={patternResult} forceUnit={forceUnit} />
        )
      }
    />
  );
}
