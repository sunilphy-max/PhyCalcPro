"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorSelectField from "@/components/calculator/CalculatorSelectField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import type { En13906LifeClass, En13906WireQuality } from "@/lib/springs/shared/en13906Fatigue";

type Props = {
  enableFatigueCheck: boolean;
  setEnableFatigueCheck: Dispatch<SetStateAction<boolean>>;
  lifeClass: En13906LifeClass;
  setLifeClass: (value: En13906LifeClass) => void;
  wireQuality: En13906WireQuality;
  setWireQuality: (value: En13906WireQuality) => void;
  minStrokeLabel: string;
  minStroke: number;
  setMinStroke: Dispatch<SetStateAction<number>>;
  minStrokeUnit?: ReactNode;
};

export default function SpringFatigueFields({
  enableFatigueCheck,
  setEnableFatigueCheck,
  lifeClass,
  setLifeClass,
  wireQuality,
  setWireQuality,
  minStrokeLabel,
  minStroke,
  setMinStroke,
  minStrokeUnit,
}: Props) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={enableFatigueCheck}
          onChange={(e) => setEnableFatigueCheck(e.target.checked)}
          className="rounded border-slate-300"
        />
        EN 13906 fatigue screening
      </label>
      {enableFatigueCheck ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <CalculatorSelectField
            label="Life class"
            value={lifeClass}
            onChange={(v) => setLifeClass(v as En13906LifeClass)}
          >
            <option value="VL">VL — very long (≥ 10⁷ cycles)</option>
            <option value="LH">LH — long (10⁶ cycles)</option>
            <option value="MH">MH — medium (10⁵ cycles)</option>
            <option value="HH">HH — high (10⁴ cycles)</option>
          </CalculatorSelectField>
          <CalculatorSelectField
            label="Wire quality (EN 13906)"
            value={String(wireQuality)}
            onChange={(v) => setWireQuality(Number(v) as En13906WireQuality)}
          >
            <option value="1">Grade 1 — premium cold-formed</option>
            <option value="2">Grade 2 — standard</option>
            <option value="3">Grade 3 — general</option>
          </CalculatorSelectField>
          {minStrokeUnit ? (
            <CalculatorUnitField
              label={minStrokeLabel}
              value={minStroke}
              onChange={setMinStroke}
              unit={minStrokeUnit}
            />
          ) : (
            <CalculatorNumberField
              label={minStrokeLabel}
              value={minStroke}
              onChange={setMinStroke}
              min={0}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
