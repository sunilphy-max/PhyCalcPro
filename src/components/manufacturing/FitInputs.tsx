"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  nominalSize: number;
  setNominalSize: (value: number) => void;
  nominalUnit: string;
  setNominalUnit: (unit: string) => void;
  useIsoLookup: boolean;
  setUseIsoLookup: (v: boolean) => void;
  isoHoleLetter: string;
  setIsoHoleLetter: (v: string) => void;
  isoHoleGrade: number;
  setIsoHoleGrade: (v: number) => void;
  isoShaftLetter: string;
  setIsoShaftLetter: (v: string) => void;
  isoShaftGrade: number;
  setIsoShaftGrade: (v: number) => void;
  holeUpper: number;
  setHoleUpper: (value: number) => void;
  holeLower: number;
  setHoleLower: (value: number) => void;
  shaftUpper: number;
  setShaftUpper: (value: number) => void;
  shaftLower: number;
  setShaftLower: (value: number) => void;
  toleranceUnit: string;
  setToleranceUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function FitInputs({
  nominalSize,
  setNominalSize,
  nominalUnit,
  setNominalUnit,
  useIsoLookup,
  setUseIsoLookup,
  isoHoleLetter,
  setIsoHoleLetter,
  isoHoleGrade,
  setIsoHoleGrade,
  isoShaftLetter,
  setIsoShaftLetter,
  isoShaftGrade,
  setIsoShaftGrade,
  holeUpper,
  setHoleUpper,
  holeLower,
  setHoleLower,
  shaftUpper,
  setShaftUpper,
  shaftLower,
  setShaftLower,
  toleranceUnit,
  setToleranceUnit,
  onCalculate,
}: Props) {
  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Fits & Clearances</h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter nominal size and tolerances manually or use ISO 286 grade lookup.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm text-slate-600">
            Nominal size
            <input
              type="number"
              value={nominalSize}
              onChange={(e) => setNominalSize(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
          <UnitSelector dimension="length" value={nominalUnit} onChange={setNominalUnit} />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={useIsoLookup} onChange={(e) => setUseIsoLookup(e.target.checked)} />
          ISO 286 auto lookup from nominal + grade
        </label>

        {useIsoLookup ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="font-semibold text-slate-900">Hole (e.g. H7)</div>
              <label className="text-sm text-slate-600 block">
                Letter
                <select
                  value={isoHoleLetter}
                  onChange={(e) => setIsoHoleLetter(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
                >
                  <option value="H">H</option>
                  <option value="G">G</option>
                  <option value="K">K</option>
                </select>
              </label>
              <label className="text-sm text-slate-600 block">
                IT grade
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={isoHoleGrade}
                  onChange={(e) => setIsoHoleGrade(Number(e.target.value))}
                  className={calculatorNumberInputClass}
                />
              </label>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="font-semibold text-slate-900">Shaft (e.g. g6)</div>
              <label className="text-sm text-slate-600 block">
                Letter
                <select
                  value={isoShaftLetter}
                  onChange={(e) => setIsoShaftLetter(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
                >
                  <option value="h">h</option>
                  <option value="g">g</option>
                  <option value="k">k</option>
                </select>
              </label>
              <label className="text-sm text-slate-600 block">
                IT grade
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={isoShaftGrade}
                  onChange={(e) => setIsoShaftGrade(Number(e.target.value))}
                  className={calculatorNumberInputClass}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="font-semibold text-slate-900">Hole tolerance</div>
              <label className="text-sm text-slate-600 block">
                Upper deviation
                <input type="number" value={holeUpper} onChange={(e) => setHoleUpper(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600 block">
                Lower deviation
                <input type="number" value={holeLower} onChange={(e) => setHoleLower(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-200 px-3 py-2" />
              </label>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="font-semibold text-slate-900">Shaft tolerance</div>
              <label className="text-sm text-slate-600 block">
                Upper deviation
                <input type="number" value={shaftUpper} onChange={(e) => setShaftUpper(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600 block">
                Lower deviation
                <input type="number" value={shaftLower} onChange={(e) => setShaftLower(Number(e.target.value))} className="mt-1 w-full rounded border border-slate-200 px-3 py-2" />
              </label>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <UnitSelector dimension="length" value={toleranceUnit} onChange={setToleranceUnit} label="Tolerance units" />
          <button type="button" onClick={onCalculate} className="rounded bg-slate-900 px-4 py-3 text-white hover:bg-slate-800">
            Calculate Fit
          </button>
        </div>
      </div>
    </div>
  );
}
