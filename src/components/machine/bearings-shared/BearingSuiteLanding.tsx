"use client";

import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import {
  BEARING_FAMILY_CARDS,
  BEARING_SUITE_EXAMPLES,
  BEARING_SUITE_NAV,
  BEARING_SUITE_STANDARDS,
} from "@/lib/machine/bearings/bearingSuiteNav";

/**
 * Bearing Engineering Suite hub — family picker, tools, examples, standards.
 */
export default function BearingSuiteLanding() {
  const toolCards = BEARING_SUITE_NAV.filter(
    (item) => !["selection", "plain", "housing"].includes(item.id)
  );

  return (
    <BearingSuiteChrome subtitle="Select a family or open a focused engineering tool. Built for machine designers, maintenance, and purchasing.">
      <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Bearing Engineering Suite
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
            Not a single black-box calculator — a suite for life, equivalent load, catalog
            lookup, arrangement, lubrication, mounting, and failure analysis. Screening follows
            ISO 281 / ISO 76; confirm critical duty with OEM tools.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/products/bearings/life"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Open life calculator
            </Link>
            <Link
              href="/products/bearings/selection"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Full selection workflow
            </Link>
            <Link
              href="/products/bearings/database"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Browse catalog
            </Link>
          </div>
        </header>

        <section>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Start by bearing family
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Opens the selection workflow with the family pre-filtered.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BEARING_FAMILY_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{card.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Engineering tools</h2>
          <p className="mt-1 text-sm text-slate-500">
            Focused calculators matching how engineers search: L10 life, equivalent load, DN speed.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {toolCards.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4 transition hover:border-cyan-300 dark:border-cyan-900/40 dark:bg-cyan-950/20"
              >
                <p className="font-semibold text-cyan-950 dark:text-cyan-100">{tool.label}</p>
                <p className="mt-1 text-xs leading-5 text-cyan-900/70 dark:text-cyan-200/70">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Worked examples</h2>
            <ul className="mt-3 space-y-2">
              {BEARING_SUITE_EXAMPLES.map((ex) => (
                <li key={ex.id}>
                  <Link
                    href={ex.href}
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{ex.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{ex.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Standards</h2>
            <ul className="mt-3 space-y-2">
              {BEARING_SUITE_STANDARDS.map((std) => (
                <li key={std.id}>
                  <Link
                    href={std.href}
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{std.code}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{std.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </BearingSuiteChrome>
  );
}
