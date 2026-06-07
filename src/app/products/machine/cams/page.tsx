"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CamInputs from "@/components/machine/cams/CamInputs";
import CamResults from "@/components/machine/cams/CamResults";
import { toBase } from "@/lib/units/conversions";
import { solveCamEngine } from "@/lib/machine/cams/engine";
import type { CamResult, MotionLaw, CamProfileType } from "@/lib/machine/cams/types";

const defaultMotionLaw: MotionLaw = "simple_harmonic";
const defaultProfileType: CamProfileType = "flat_follower";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("cams");
  const [lift, setLift] = useState(0.02);
  const [liftUnit, setLiftUnit] = useState("m");
  const [baseCircle, setBaseCircle] = useState(0.04);
  const [baseCircleUnit, setBaseCircleUnit] = useState("m");
  const [radius, setRadius] = useState(0.01);
  const [radiusUnit, setRadiusUnit] = useState("m");
  const [speed, setSpeed] = useState(1200);
  const [dwellAngle, setDwellAngle] = useState(90);
  const [motionLaw, setMotionLaw] = useState<MotionLaw>(defaultMotionLaw);
  const [profileType, setProfileType] = useState<CamProfileType>(defaultProfileType);
  const [result, setResult] = useState<CamResult | null>(null);

  const runCheck = () => {
    const config = {
      lift: toBase(lift, "length", liftUnit),
      baseCircle: toBase(baseCircle, "length", baseCircleUnit),
      radius: toBase(radius, "length", radiusUnit),
      speed,
      dwellAngle,
      motionLaw,
      profileType,
    };

    setResult(wrapResult(solveCamEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      lift: toBase(lift, "length", liftUnit),
      baseRadius: toBase(baseCircle, "length", baseCircleUnit),
      speedDriver: speed,
    }), [lift, liftUnit, baseCircle, baseCircleUnit, speed]);

  useSyncDesignInputs("cams", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    baseRadius: (v) => setBaseCircle(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("cams", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="cams"
        title="Cam Profile & Kinematics"
        inputs={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Cam design guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose a motion law and follower type to balance smooth displacement with acceptable pressure angles.
              </p>
            </div>
          </div>
        }
        results={<CamResults result={result} lengthUnit={liftUnit} />}
      />
  );
}
