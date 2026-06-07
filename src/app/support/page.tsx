import Link from "next/link";
import { Mail } from "lucide-react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { isMonetizationEnabled } from "@/lib/licensing/validationMode";

export const metadata = {
  title: "Support — PhyCalcPro",
  description: "Contact PhyCalcPro for help, feedback, verification benchmarks, and engineering questions.",
};

const SUPPORT_EMAIL = "support@phycalcpro.com";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Support</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
        PhyCalcPro is maintained by a small engineering-focused team. If something looks wrong, you
        need clarification on a method, or you want to share benchmark data — reach out directly. We
        read every message.
      </p>

      <div className="mt-10">
        <FeedbackForm />
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        Prefer email?{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center gap-1 font-medium text-slate-700 underline dark:text-slate-200"
        >
          <Mail className="h-3.5 w-3.5" aria-hidden />
          {SUPPORT_EMAIL}
        </a>
      </p>

      <div className="mt-12 space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">What to contact us about</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 leading-7 dark:text-slate-300">
            <li>Calculator behaviour, unexpected results, or UI issues (module name and inputs help).</li>
            <li>Questions about formulas, assumptions, or design-code checks — see also the{" "}
              <Link href="/documentation" className="font-medium text-blue-700 underline dark:text-blue-400">
                documentation
              </Link>
              .
            </li>
            <li>Benchmark comparisons against your spreadsheets or code worksheets.</li>
            <li>Feature requests and prioritization for new modules or standards coverage.</li>
            {isMonetizationEnabled() ? (
              <li>Billing, subscriptions, and team or site license enquiries.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Verification program</h2>
          <p className="mt-3 text-slate-600 leading-7 dark:text-slate-300">
            If you are validating results against AGMA, AISC, ASME, EN, or similar references, attach
            your comparison workbook or tabulated cases. Include the module, design standard, and
            units used.
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Template (repository):{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              docs/PhyCalcPro_Verification_Template.xlsx
            </code>
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Before you write</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            PhyCalcPro is a design-assist tool — results are indicative unless a module is marked β
            with implemented code checks. Review the{" "}
            <Link href="/trust" className="font-medium text-blue-700 underline dark:text-blue-400">
              trust & responsibility
            </Link>{" "}
            page and the{" "}
            <Link href="/status" className="font-medium text-blue-700 underline dark:text-blue-400">
              quality dashboard
            </Link>{" "}
            for release tiers and known gaps.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/documentation" className="underline">
          Documentation
        </Link>
        {" · "}
        <Link href="/trust" className="underline">
          Trust
        </Link>
        {" · "}
        <Link href="/status" className="underline">
          Quality
        </Link>
        {isMonetizationEnabled() ? (
          <>
            {" · "}
            <Link href="/pricing" className="underline">
              Pricing
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
