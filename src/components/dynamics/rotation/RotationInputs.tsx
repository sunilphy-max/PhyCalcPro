"use client";

import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  mass: number;
  setMass: (value: number) => void;
  radius: number;
  setRadius: (value: number) => void;
  speedRPM: number;
  setSpeedRPM: (value: number) => void;
  power: number;
  setPower: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (unit: string) => void;
  powerUnit: string;
  setPowerUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function RotationInputs({
  mass,
  setMass,
  radius,
  setRadius,
  speedRPM,
  setSpeedRPM,
  power,
  setPower,
  lengthUnit,
  setLengthUnit,
  powerUnit,
  setPowerUnit,
  onCalculate,
}: Props) {
  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Rotational System</h3>
        <p className="text-sm text-slate-500 mt-1">
          Compute inertia, kinetic energy, centripetal force, and torque from rotation.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-600">
            Mass (kg)
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
          <div className="space-y-1 text-sm text-slate-600">
            Mass unit
            <input
              type="text"
              value="kg"
              disabled
              className="w-full cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-600">
            Radius
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
          <UnitSelector
            dimension="length"
            value={lengthUnit}
            onChange={setLengthUnit}
            label="Radius unit"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-600">
            Speed (RPM)
            <input
              type="number"
              value={speedRPM}
              onChange={(e) => setSpeedRPM(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
          <div className="space-y-1 text-sm text-slate-600">
            Power
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <input
                type="number"
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
              <UnitSelector
                dimension="power"
                value={powerUnit}
                onChange={setPowerUnit}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCalculate}
          className="rounded bg-slate-900 px-4 py-3 text-white hover:bg-slate-800"
        >
          Calculate Rotation
        </button>
      </div>
    </div>
  );
}
