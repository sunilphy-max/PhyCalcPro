"use client";

import { useEntitlement } from "@/contexts/EntitlementContext";

export default function ValidationModeBanner() {
  const { isFreeLaunch, isValidationMode } = useEntitlement();

  if (isFreeLaunch) {
    return (
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
        <span className="font-medium text-slate-800 dark:text-slate-200">Early access</span>
        {" — "}all modules, standards, and export free · no signup required
      </div>
    );
  }

  if (!isValidationMode) return null;

  return (
    <div className="border-b border-emerald-300 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
      <span className="font-semibold">Validation mode</span> — Indicative, US, EU, ISO, and PDF export are
      unlocked for testing. Remove <code className="rounded bg-white/80 px-1 dark:bg-black/30">NEXT_PUBLIC_VALIDATION_MODE</code> before
      public launch.
    </div>
  );
}
