"use client";

import { useState } from "react";

type Props = {
  elements: number;
  onChangeElements: (n: number) => void;
  refine?: boolean;
  onToggleRefine?: (v: boolean) => void;
};

export default function MeshControls({
  elements,
  onChangeElements,
  refine = false,
  onToggleRefine,
}: Props) {
  const [local, setLocal] = useState(elements);

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-300">Mesh elements</div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={4}
          max={200}
          value={local}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocal(v);
            onChangeElements(v);
          }}
        />
        <div className="w-12 text-right text-sm text-slate-200">{local}</div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-300">Auto-refine</label>
        <input
          type="checkbox"
          checked={refine}
          onChange={(e) => onToggleRefine && onToggleRefine(e.target.checked)}
        />
      </div>
    </div>
  );
}
