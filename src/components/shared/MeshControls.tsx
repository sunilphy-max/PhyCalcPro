"use client";

import { useEffect, useState } from "react";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  elements: number;
  onChangeElements: (n: number) => void;
  refine?: boolean;
  onToggleRefine?: (v: boolean) => void;
  /** Slider minimum (default 4) */
  minElements?: number;
  /** Slider maximum; omit for a high default (500). Direct number entry is not capped. */
  maxElements?: number;
};

export default function MeshControls({
  elements,
  onChangeElements,
  refine = false,
  onToggleRefine,
  minElements = 4,
  maxElements = 500,
}: Props) {
  const [local, setLocal] = useState(elements);

  useEffect(() => {
    setLocal(elements);
  }, [elements]);

  const commit = (value: number) => {
    const v = Math.max(minElements, Math.round(value));
    setLocal(v);
    onChangeElements(v);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">Element count</span>
        <input
          type="number"
          min={minElements}
          step={1}
          value={local}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isFinite(parsed)) commit(parsed);
          }}
          className={`${calculatorNumberInputClass} !flex-none w-20 text-right`}
          aria-label="Mesh element count"
        />
      </div>
      <input
        type="range"
        min={minElements}
        max={maxElements}
        value={Math.min(local, maxElements)}
        onChange={(e) => commit(Number(e.target.value))}
        className="w-full accent-slate-800"
        aria-label="Adjust mesh element count"
      />
      <p className="text-xs text-slate-500">
        Slider up to {maxElements} elements; type a higher value in the box if you need a finer mesh.
      </p>

      {onToggleRefine ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={refine}
            onChange={(e) => onToggleRefine(e.target.checked)}
            className="rounded border-slate-300"
          />
          Auto-refine near peak stress
        </label>
      ) : null}
    </div>
  );
}
