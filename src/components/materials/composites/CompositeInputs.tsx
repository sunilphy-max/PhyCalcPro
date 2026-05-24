import type { Dispatch, SetStateAction } from "react";
import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  fiberVolumeFraction: number;
  setFiberVolumeFraction: Dispatch<SetStateAction<number>>;
  fiberModulus: number;
  setFiberModulus: Dispatch<SetStateAction<number>>;
  matrixModulus: number;
  setMatrixModulus: Dispatch<SetStateAction<number>>;
  fiberStrength: number;
  setFiberStrength: Dispatch<SetStateAction<number>>;
  matrixStrength: number;
  setMatrixStrength: Dispatch<SetStateAction<number>>;
  fiberDensity: number;
  setFiberDensity: Dispatch<SetStateAction<number>>;
  matrixDensity: number;
  setMatrixDensity: Dispatch<SetStateAction<number>>;
  fiberPoisson: number;
  setFiberPoisson: Dispatch<SetStateAction<number>>;
  matrixPoisson: number;
  setMatrixPoisson: Dispatch<SetStateAction<number>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  densityUnit: string;
  setDensityUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function CompositeInputs({
  fiberVolumeFraction,
  setFiberVolumeFraction,
  fiberModulus,
  setFiberModulus,
  matrixModulus,
  setMatrixModulus,
  fiberStrength,
  setFiberStrength,
  matrixStrength,
  setMatrixStrength,
  fiberDensity,
  setFiberDensity,
  matrixDensity,
  setMatrixDensity,
  fiberPoisson,
  setFiberPoisson,
  matrixPoisson,
  setMatrixPoisson,
  stressUnit,
  setStressUnit,
  densityUnit,
  setDensityUnit,
  onCalculate,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Composite material inputs</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define fiber and matrix properties to estimate composite stiffness, strength, and density.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700 col-span-full">
          <span>Fiber volume fraction</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={fiberVolumeFraction}
              onChange={(event) => setFiberVolumeFraction(Number(event.target.value))}
              className="w-full"
            />
            <span className="w-20 text-right text-sm text-slate-700">{(fiberVolumeFraction * 100).toFixed(0)}%</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Fiber modulus</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={fiberModulus}
              onChange={(event) => setFiberModulus(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={stressUnit}
              onChange={setStressUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Matrix modulus</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={matrixModulus}
              onChange={(event) => setMatrixModulus(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={stressUnit}
              onChange={setStressUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Fiber strength</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={fiberStrength}
              onChange={(event) => setFiberStrength(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={stressUnit}
              onChange={setStressUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Matrix strength</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={matrixStrength}
              onChange={(event) => setMatrixStrength(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={stressUnit}
              onChange={setStressUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Fiber density</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={fiberDensity}
              onChange={(event) => setFiberDensity(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="density"
              value={densityUnit}
              onChange={setDensityUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Matrix density</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={matrixDensity}
              onChange={(event) => setMatrixDensity(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="density"
              value={densityUnit}
              onChange={setDensityUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Fiber Poisson's ratio</span>
          <input
            type="number"
            step={0.01}
            min={0}
            max={0.5}
            value={fiberPoisson}
            onChange={(event) => setFiberPoisson(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Matrix Poisson's ratio</span>
          <input
            type="number"
            step={0.01}
            min={0}
            max={0.5}
            value={matrixPoisson}
            onChange={(event) => setMatrixPoisson(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white font-medium hover:bg-slate-800"
      >
        Compute Composite Properties
      </button>
    </div>
  );
}
