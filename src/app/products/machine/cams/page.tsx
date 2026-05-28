"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import CamInputs from "@/components/machine/cams/CamInputs";
import CamResults from "@/components/machine/cams/CamResults";
import { toBase } from "@/lib/units/conversions";
import { solveCamEngine } from "@/lib/machine/cams/engine";
import type { CamResult, MotionLaw, CamProfileType } from "@/lib/machine/cams/types";

const defaultMotionLaw: MotionLaw = "simple_harmonic";
const defaultProfileType: CamProfileType = "flat_follower";

export default function Page() {
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

  const calculate = () => {
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

  return (
    <DashboardLayout title="Cam Design Module">
      <CalculatorLayout
        moduleId="cams"
        title="Cam Profile & Kinematics"
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Cam design guidance</h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose a motion law and follower type to balance smooth displacement with acceptable pressure angles.
              </p>
            </div>
          </div>
        }
        center={
          <CamInputs
            lift={lift}
            setLift={setLift}
            liftUnit={liftUnit}
            setLiftUnit={setLiftUnit}
            baseCircle={baseCircle}
            setBaseCircle={setBaseCircle}
            baseCircleUnit={baseCircleUnit}
            setBaseCircleUnit={setBaseCircleUnit}
            radius={radius}
            setRadius={setRadius}
            radiusUnit={radiusUnit}
            setRadiusUnit={setRadiusUnit}
            speed={speed}
            setSpeed={setSpeed}
            dwellAngle={dwellAngle}
            setDwellAngle={setDwellAngle}
            motionLaw={motionLaw}
            setMotionLaw={setMotionLaw}
            profileType={profileType}
            setProfileType={setProfileType}
            onCalculate={calculate}
          />
        }
        right={<CamResults result={result} lengthUnit={liftUnit} />}
      />
    </DashboardLayout>
  );
}
