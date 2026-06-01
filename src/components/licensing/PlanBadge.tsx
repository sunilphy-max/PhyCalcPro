"use client";

import Link from "next/link";
import { useEntitlement } from "@/contexts/EntitlementContext";

export default function PlanBadge() {
  const { tierLabel, entitlement, isMonetizationEnabled } = useEntitlement();

  if (!isMonetizationEnabled) {
    return null;
  }

  if (entitlement.tier === "free") {
    return (
      <Link
        href="/pricing"
        className="hidden sm:inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        Upgrade to Pro
      </Link>
    );
  }

  return (
    <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-100">
      {tierLabel}
    </span>
  );
}
