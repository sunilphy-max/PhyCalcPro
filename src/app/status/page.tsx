import Link from "next/link";
import { isMonetizationEnabled } from "@/lib/licensing/validationMode";
import ReleaseTierBadge from "@/components/qa/ReleaseTierBadge";
import { exportUnitAuditMatrix, defaultExportUnitMatrixNote } from "@/lib/qa/exportUnitMatrix";
import {
  buildModuleGateSummaries,
  releaseTierLabel,
} from "@/lib/qa/maturityGates";
import { getBenchmarkStatsFromLastRun, getLastVerificationReport } from "@/lib/qa/lastRun";
import { supportedBenchmarkModules } from "@/lib/qa/benchmarkRunner";
import type { ReleaseTier } from "@/lib/qa/types";

export const metadata = {
  title: "Quality & maturity — PhyCalcPro",
  description: "Module release tiers, verification status, and export audit matrix.",
};

export default function StatusPage() {
  const stats = getBenchmarkStatsFromLastRun();
  const summaries = buildModuleGateSummaries(stats);
  const lastRun = getLastVerificationReport();

  const tierCounts = summaries.reduce(
    (acc, row) => {
      acc[row.releaseTier] = (acc[row.releaseTier] ?? 0) + 1;
      return acc;
    },
    {} as Record<ReleaseTier, number>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Phase 4</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">
          Quality & maturity dashboard
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 leading-7 dark:text-slate-300">
          Release tiers combine catalog validation status, numerical maturity, and automated
          benchmark results. Run{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
            npm run test:verification
          </code>{" "}
          before each deploy.
        </p>

        {lastRun ? (
          <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
            Last verification: {lastRun.passed}/{lastRun.total} passed (
            {new Date(lastRun.ranAt).toLocaleString()})
          </p>
        ) : (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            No committed last-run report. Run verification locally.
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(["certified", "verified", "beta", "indicative", "draft"] as ReleaseTier[]).map(
            (tier) => (
              <div
                key={tier}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="text-sm text-slate-500">{releaseTierLabel(tier)}</div>
                <div className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                  {tierCounts[tier] ?? 0}
                </div>
              </div>
            )
          )}
        </div>

        <h2 className="mt-12 text-xl font-semibold text-slate-950 dark:text-white">
          Module release tiers
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Catalog</th>
                <th className="px-4 py-3">Benchmarks</th>
                <th className="px-4 py-3">Depth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summaries.map((row) => (
                <tr key={row.moduleId} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">
                    <ReleaseTierBadge tier={row.releaseTier} />
                  </td>
                  <td className="px-4 py-3 capitalize">{row.catalogStatus}</td>
                  <td className="px-4 py-3">
                    {row.benchmarksTotal > 0
                      ? `${row.benchmarksPassed}/${row.benchmarksTotal}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{row.numericalDepth}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-xl font-semibold text-slate-950 dark:text-white">
          Automated verification
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Modules with solvers wired in CI: {supportedBenchmarkModules().join(", ")}.
        </p>

        <h2 className="mt-12 text-xl font-semibold text-slate-950 dark:text-white">
          Export & unit audit (sample)
        </h2>
        <p className="mt-2 text-sm text-slate-500">{defaultExportUnitMatrixNote()}</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">PDF</th>
                <th className="px-4 py-3">CSV</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Design code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exportUnitAuditMatrix.map((row) => (
                <tr key={row.moduleId}>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {row.title}
                  </td>
                  <td className="px-4 py-3">{row.pdfExport}</td>
                  <td className="px-4 py-3">{row.csvExport}</td>
                  <td className="px-4 py-3">{row.unitProfiles}</td>
                  <td className="px-4 py-3">{row.designCodeSelector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-sm text-slate-500">
          <Link href="/documentation" className="underline">
            Documentation
          </Link>
          {isMonetizationEnabled() ? (
            <>
              {" "}
              ·{" "}
              <Link href="/pricing" className="underline">
                Pricing
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
