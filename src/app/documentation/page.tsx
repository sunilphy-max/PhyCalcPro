import Link from "next/link";

export const metadata = {
  title: "Documentation — PhyCalcPro",
  description: "How to use design codes, exports, and verification in PhyCalcPro.",
};

export default function DocumentationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Documentation</h1>
      <p className="mt-4 text-slate-600 leading-7 dark:text-slate-300">
        Quick reference for engineers using PhyCalcPro in production workflows.
      </p>

      <div className="mt-10 space-y-10 text-slate-700 dark:text-slate-200">
        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Design standards</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            Each calculator includes a <strong>Design standard</strong> selector: Indicative (free),
            US, EU, or ISO (Pro). Indicative uses educational mechanics without a code compliance
            claim. Pro unlocks the full check list defined for that module in the standards catalog.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Engineering checks</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            After you calculate, the results panel shows pass / warning / fail / not available per
            check. <em>Not available</em> means the standard expects that check but the solver is not
            yet verified for your selected code — not a passing result.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Export</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
            <li>CSV export — all tiers</li>
            <li>PDF export with checks and calculation basis — Pro</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Verification</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            See <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">docs/VerificationGuide.md</code> and the Excel template under{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">docs/</code>.
            Regenerate the template with{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">npm run generate:verification-template</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Trust & launch</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            Read <Link href="/trust" className="font-medium underline">Trust & responsibility</Link>{" "}
            before using results in formal deliverables. Manage your plan on{" "}
            <Link href="/account" className="font-medium underline">Account</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quality dashboard</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            See <Link href="/status" className="font-medium underline">Quality & maturity</Link> for
            per-module release tiers and export audit. Run{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
              npm run test:verification
            </code>{" "}
            before releases.
          </p>
        </section>
      </div>
    </div>
  );
}
