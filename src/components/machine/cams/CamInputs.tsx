"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorFieldLabelClass, calculatorInputGridClass, calculatorSelectClass } from "@/components/calculator/styles";
import type { CamProfileType, MotionLaw } from "@/lib/machine/cams/types";

type Props = {
  lift: number;
  setLift: Dispatch<SetStateAction<number>>;
  liftUnit: string;
  setLiftUnit: Dispatch<SetStateAction<string>>;
  baseCircle: number;
  setBaseCircle: Dispatch<SetStateAction<number>>;
  baseCircleUnit: string;
  setBaseCircleUnit: Dispatch<SetStateAction<string>>;
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  radiusUnit: string;
  setRadiusUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  dwellAngle: number;
  setDwellAngle: Dispatch<SetStateAction<number>>;
  motionLaw: MotionLaw;
  setMotionLaw: Dispatch<SetStateAction<MotionLaw>>;
  profileType: CamProfileType;
  setProfileType: Dispatch<SetStateAction<CamProfileType>>;
  onCalculate: () => void;
};

export default function CamInputs({
  lift,
  setLift,
  liftUnit,
  setLiftUnit,
  baseCircle,
  setBaseCircle,
  baseCircleUnit,
  setBaseCircleUnit,
  radius,
  setRadius,
  radiusUnit,
  setRadiusUnit,
  speed,
  setSpeed,
  dwellAngle,
  setDwellAngle,
  motionLaw,
  setMotionLaw,
  profileType,
  setProfileType,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Cam design"
      description="Cam profile and motion analysis inputs."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate cam" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Lift"
          value={lift}
          onChange={setLift}
          unit={<ModuleUnitSelect moduleId="cams" fieldKey="radius" value={liftUnit} onChange={setLiftUnit} />}
        />
        <CalculatorUnitField
          label="Base circle"
          value={baseCircle}
          onChange={setBaseCircle}
          unit={
            <ModuleUnitSelect moduleId="cams" fieldKey="radius" value={baseCircleUnit} onChange={setBaseCircleUnit} />
          }
        />
        <CalculatorUnitField
          label="Follower radius"
          value={radius}
          onChange={setRadius}
          unit={<ModuleUnitSelect moduleId="cams" fieldKey="radius" value={radiusUnit} onChange={setRadiusUnit} />}
        />
        <CalculatorNumberField label="Cam speed (rpm)" value={speed} onChange={setSpeed} />
        <CalculatorNumberField
          label="Dwell angle (deg)"
          value={dwellAngle}
          onChange={setDwellAngle}
          min={0}
          max={360}
        />
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Motion law</span>
          <select
            value={motionLaw}
            onChange={(event) => setMotionLaw(event.target.value as MotionLaw)}
            className={calculatorSelectClass}
          >
            <option value="simple_harmonic">Simple harmonic</option>
            <option value="cycloidal">Cycloidal</option>
            <option value="polynomial">Polynomial</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Follower type</span>
          <select
            value={profileType}
            onChange={(event) => setProfileType(event.target.value as CamProfileType)}
            className={calculatorSelectClass}
          >
            <option value="flat_follower">Flat follower</option>
            <option value="roller_follower">Roller follower</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
