"use client";

import Link from "next/link";
import ReleaseTierBadge from "@/components/qa/ReleaseTierBadge";
import { getModuleMaturity } from "@/data/moduleMaturity";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import {
  computeReleaseTier,
  releaseTierLabel,
} from "@/lib/qa/maturityGates";
import { getBenchmarkStatsFromLastRun } from "@/lib/qa/lastRun";

type Props = {
  moduleId: string;
  /** Compact banner for workspace Knowledge tab */
  variant?: "full" | "compact";
};

/**
 * Per-module validation & quality — lives in Docs / Knowledge instead of a top-level Quality nav tab.
 */
export default function ModuleValidationQualitySection({
  moduleId,
  variant = "full",
}: Props) {
  const profile = getModuleStandardProfile(moduleId);
  const maturity = getModuleMaturity(moduleId);
  const stats = getBenchmarkStatsFromLastRun()[moduleId];
  const tier = computeReleaseTier(moduleId, stats);

  if (!profile && !maturity) return null;

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Validation & quality
          </span>
          <ReleaseTierBadge tier={tier} />
          {profile ? (
            <span className="text-xs capitalize text-slate-600 dark:text-slate-400">
              Catalog: {profile.validationStatus}
            </span>
          ) : null}
        </div>
        {maturity?.notes ? (
          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">{maturity.notes}</p>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">
          <Link
            href={`/documentation/modules/${moduleId}#validation-quality`}
            className="font-medium text-sky-700 hover:underline dark:text-sky-400"
          >
            Full guide section
          </Link>
          {" · "}
          <Link href="/status" className="font-medium text-sky-700 hover:underline dark:text-sky-400">
            Fleet dashboard
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section
      id="validation-quality"
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Validation & quality
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Trust signals for this module — release tier, catalog status, and verification notes.
            Engineers should review assumptions and limitations before relying on results.
          </p>
        </div>
        <ReleaseTierBadge tier={tier} />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Release tier</dt>
          <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
            {releaseTierLabel(tier)}
          </dd>
        </div>
        {profile ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Catalog status
            </dt>
            <dd className="mt-0.5 font-semibold capitalize text-slate-900 dark:text-white">
              {profile.validationStatus}
            </dd>
          </div>
        ) : null}
        {maturity ? (
          <>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Validation quality
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                {maturity.validationQuality} / 5
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Numerical depth
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                {maturity.numericalDepth} / 5 · {maturity.maturityBand}
              </dd>
            </div>
          </>
        ) : null}
        {stats && stats.total > 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              CI benchmarks
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
              {stats.passed} / {stats.total} passed
            </dd>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              CI benchmarks
            </dt>
            <dd className="mt-0.5 text-slate-600 dark:text-slate-400">No committed cases yet</dd>
          </div>
        )}
      </dl>

      {maturity?.notes ? (
        <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{maturity.notes}</p>
      ) : null}

      <p className="mt-4 text-sm text-slate-500">
        Fleet-wide release tiers and export audit:{" "}
        <Link href="/status" className="font-medium text-sky-700 hover:underline dark:text-sky-400">
          Quality & maturity dashboard
        </Link>
        {" · "}
        <Link href="/trust" className="font-medium text-sky-700 hover:underline dark:text-sky-400">
          Trust & responsibility
        </Link>
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Indicative results still require independent engineering review for certified work.
      </p>
    </section>
  );
}
