"use client";

import { useEffect } from "react";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { designCodeOptions } from "@/lib/standards/designCodes";
import type { DesignCodeId } from "@/lib/standards/types";
type Props = {
  moduleId?: string;
  compact?: boolean;
};

export default function DesignCodeSelector({ compact = false }: Props) {
  const { designCode, setDesignCode, option } = useDesignCode();
  const { canUseDesignCode, setDevTier, canSwitchTier, isLoading, featuresUnlocked, unlockAllFeatures } =
    useEntitlement();

  useEffect(() => {
    if (isLoading) return;
    if (!canUseDesignCode(designCode)) {
      setDesignCode("INDICATIVE");
    }
  }, [designCode, canUseDesignCode, setDesignCode, isLoading]);

  const onChange = (code: DesignCodeId) => {
    if (!canUseDesignCode(code)) return;
    setDesignCode(code);
  };

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Design standard
      </label>
      <select
        value={canUseDesignCode(designCode) ? designCode : "INDICATIVE"}
        onChange={(e) => onChange(e.target.value as DesignCodeId)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm"
      >
        {designCodeOptions.map((item) => (
          <option key={item.id} value={item.id} disabled={!canUseDesignCode(item.id)}>
            {item.label}
            {!canUseDesignCode(item.id) ? " (Pro)" : ""}
          </option>
        ))}
      </select>
      {!compact ? (
        <p className="text-xs text-slate-500">
          {option.description} Units switch automatically for supported fields.
        </p>
      ) : null}
      {!canUseDesignCode("US") ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">US / EU / ISO require Pro</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={unlockAllFeatures}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Unlock all (this browser)
            </button>
            {canSwitchTier ? (
              <button
                type="button"
                onClick={() => setDevTier("pro")}
                className="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-semibold"
              >
                Enable Pro tier
              </button>
            ) : null}
          </div>
          {!featuresUnlocked && !canSwitchTier ? (
            <p className="mt-2">
              Or add <code className="rounded bg-white/60 px-1">NEXT_PUBLIC_VALIDATION_MODE=true</code> to .env.local
              and restart dev.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
