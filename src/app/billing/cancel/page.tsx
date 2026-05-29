import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Checkout canceled</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        No charge was made. You can continue using the free tier.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/pricing"
          className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          Back to pricing
        </Link>
        <Link
          href="/products"
          className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold dark:border-slate-600"
        >
          Calculators
        </Link>
      </div>
    </div>
  );
}
