import type { Dispatch, SetStateAction } from "react";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
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
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Cam profile inputs</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define cam lift, base circle, follower radius, speed, and motion law.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Lift</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={lift}
              onChange={(event) => setLift(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="cams"
              fieldKey="radius"
              value={liftUnit}
              onChange={setLiftUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Base circle</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={baseCircle}
              onChange={(event) => setBaseCircle(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="cams"
              fieldKey="radius"
              value={baseCircleUnit}
              onChange={setBaseCircleUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Follower radius</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="cams"
              fieldKey="radius"
              value={radiusUnit}
              onChange={setRadiusUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Cam speed</span>
          <input
            type="number"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-400">RPM</p>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Dwell angle</span>
          <input
            type="number"
            value={dwellAngle}
            min={0}
            max={360}
            onChange={(event) => setDwellAngle(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-400">Degrees of dwell</p>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Motion law</span>
          <select
            value={motionLaw}
            onChange={(event) => setMotionLaw(event.target.value as MotionLaw)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="simple_harmonic">Simple harmonic</option>
            <option value="cycloidal">Cycloidal</option>
            <option value="polynomial">Polynomial</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Follower type</span>
          <select
            value={profileType}
            onChange={(event) => setProfileType(event.target.value as CamProfileType)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="flat_follower">Flat follower</option>
            <option value="roller_follower">Roller follower</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 font-medium hover:bg-slate-800"
      >
        Analyze Cam Profile
      </button>
    </div>
  );
}
