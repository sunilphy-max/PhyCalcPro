import Link from "next/link";
import { isFreeLaunch } from "@/lib/licensing/validationMode";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Trust & engineering responsibility",
  description: "How PhyCalcPro handles standards, verification, and professional responsibility.",
  path: "/trust",
});

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
        Trust & professional responsibility
      </h1>
      <p className="mt-4 text-slate-600 leading-7 dark:text-slate-300">
        PhyCalcPro is built for practicing engineers. It is a design-assist tool, not a substitute
        for licensed professional judgment or official code compliance review.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">What we claim</h2>
        <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
          <li>Transparent listing of engineering checks per module and design code.</li>
          <li>Explicit <strong>not available</strong> when a standard check is not yet implemented.</li>
          <li>Automated regression benchmarks for modules in CI (see Quality dashboard).</li>
          <li>β (beta) labels on code-aligned solvers until your verification workbook sign-off.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">What we do not claim</h2>
        <ul className="list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
          <li>Automatic approval under AISC, ASME, AGMA, EN, or ISO without your independent check.</li>
          <li>Replacement for project-specific load combinations, jurisdiction, or peer review.</li>
          <li>Certification of every module — see release tiers on each calculator.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Path to certified modules</h2>
        <ol className="list-decimal space-y-2 pl-6 text-slate-600 dark:text-slate-300">
          <li>You validate cases against your standard worksheets.</li>
          <li>You add benchmarks to <code className="rounded bg-slate-100 px-1 text-sm dark:bg-slate-800">src/data/verification/</code>.</li>
          <li>CI passes <code className="rounded bg-slate-100 px-1 text-sm dark:bg-slate-800">npm run test:verification</code>.</li>
          <li>Module reaches <strong>verified</strong> on <Link href="/status" className="underline">Quality</Link>.</li>
          <li>After review, we promote to <strong>certified</strong> in the catalog.</li>
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <strong>Important:</strong> Always verify results for your project before issuing drawings,
        specifications, or reports.
        {isFreeLaunch()
          ? " During early access all design standards are available; still review β code-check limitations for each module."
          : " Use Indicative mode unless you have Pro and understand the β code-check limitations for that module."}
      </section>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/legal/terms" className="underline">
          Terms of Service
        </Link>{" "}
        ·{" "}
        <Link href="/documentation" className="underline">
          Documentation
        </Link>
      </p>
    </div>
  );
}
