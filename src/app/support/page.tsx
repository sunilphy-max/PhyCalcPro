import Link from "next/link";
import CheckoutButton from "@/components/licensing/CheckoutButton";

export const metadata = {
  title: "Support — PhyCalcPro",
  description: "Help, feedback, and contributions for PhyCalcPro.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Support</h1>
      <p className="mt-4 text-slate-600 leading-7 dark:text-slate-300">
        PhyCalcPro is built for practicing engineers who need fast, traceable calculations. For
        verification feedback, billing questions, or site licenses, reach out by email.
      </p>

      <div className="mt-10 space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Email</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            <a href="mailto:support@phycalcpro.com" className="font-medium underline">
              support@phycalcpro.com
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Verification program</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            If you are comparing results to AGMA, AISC, ASME, or EN worksheets, use the{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
              docs/PhyCalcPro_Verification_Template.xlsx
            </code>{" "}
            workbook and send your benchmark rows.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Support the project</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            One-time donations help fund standards verification and new modules.
          </p>
          <div className="mt-4 max-w-xs">
            <CheckoutButton planId="supporter" label="Donate" variant="secondary" />
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/documentation" className="underline">
          Documentation
        </Link>{" "}
        ·{" "}
        <Link href="/pricing" className="underline">
          Pricing
        </Link>
      </p>
    </div>
  );
}
