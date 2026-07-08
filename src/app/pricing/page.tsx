import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutButton from "@/components/licensing/CheckoutButton";
import { plans } from "@/lib/licensing/plans";
import { isFreeLaunch } from "@/lib/licensing/validationMode";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description: "Free engineering tools, Supporter donations, and Pro licenses for US/EU/ISO standards.",
  path: "/pricing",
});

export default function PricingPage() {
  if (isFreeLaunch()) {
    redirect("/products");
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Phase 3</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Simple pricing for professional work
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Start free with indicative checks. Upgrade to Pro for US, EU, and ISO design codes and PDF
            reports with engineering checks. Code-aligned solvers are in active verification (β).
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-3xl border p-8 shadow-sm ${
                plan.id === "pro"
                  ? "border-slate-900 bg-white ring-2 ring-slate-900 dark:border-white dark:bg-slate-900 dark:ring-white"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
              <p className="mt-6 text-3xl font-semibold text-slate-950 dark:text-white">
                {plan.priceLabel}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.id === "free" ? (
                  <Link
                    href="/products"
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-100"
                  >
                    Get started
                  </Link>
                ) : plan.id === "supporter" ? (
                  <CheckoutButton planId="supporter" label="Donate via Stripe" variant="secondary" />
                ) : (
                  <CheckoutButton planId="pro" label="Subscribe to Pro" />
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Payments are processed by Stripe. Licenses activate on this device after checkout. For
          team or site licenses, contact us via{" "}
          <Link href="/support" className="font-medium text-slate-700 underline dark:text-slate-200">
            Support
          </Link>
          . See <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
          <Link href="/legal/privacy" className="underline">Privacy</Link>.
        </p>
      </div>
    </div>
  );
}
