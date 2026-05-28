"use client";

import { useDesignCode } from "@/contexts/DesignCodeContext";
import { designCodeOptions } from "@/lib/standards/designCodes";
import type { DesignCodeId } from "@/lib/standards/types";

type Props = {
  moduleId?: string;
  compact?: boolean;
};

export default function DesignCodeSelector({ compact = false }: Props) {
  const { designCode, setDesignCode, option } = useDesignCode();

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Design standard
      </label>
      <select
        value={designCode}
        onChange={(e) => setDesignCode(e.target.value as DesignCodeId)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm"
      >
        {designCodeOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {!compact ? (
        <p className="text-xs text-slate-500">
          {option.description} Units switch automatically for supported fields.
        </p>
      ) : null}
    </div>
  );
}
