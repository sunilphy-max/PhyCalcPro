"use client";

import Link from "next/link";

type Props = {
  feature: string;
  compact?: boolean;
};

export default function UpgradePrompt({ feature, compact = false }: Props) {
  if (compact) {
    return (
      <p className="text-xs text-amber-800 dark:text-amber-200">
        {feature} requires{" "}
        <Link href="/pricing" className="font-semibold underline">
          Pro
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-semibold">Pro license required</p>
      <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
        {feature} is included with PhyCalcPro Pro (US / EU / ISO standards and PDF export).
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        View pricing
      </Link>
    </div>
  );
}
