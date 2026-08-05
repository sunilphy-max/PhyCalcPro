"use client";

import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import {
  BEARING_FAMILY_CARDS,
  BEARING_SUITE_EXAMPLES,
  BEARING_SUITE_STANDARDS,
} from "@/lib/machine/bearings/bearingSuiteNav";

/**
 * Bearing Engineering Suite hub — System Designer first, siblings second.
 */
export default function BearingSuiteLanding() {
  return (
    <BearingSuiteChrome subtitle="One Application System Designer for design and service — not a grid of overlapping calculators.">
      <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Bearing Engineering Suite
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
            Size and verify rolling-bearing systems with a single project object: stations, duty,
            catalog size, lubrication, and fits. Screening follows ISO 281 / ISO 76 — confirm
            critical duty with OEM tools.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/products/bearings/designer?intent=design"
              className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Open System Designer
            </Link>
            <Link
              href="/products/bearings/designer?intent=service"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Check / diagnose
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/products/bearings/database" className="underline-offset-2 hover:underline">
              Catalog database
            </Link>
            <Link href="/products/bearings/plain" className="underline-offset-2 hover:underline">
              Plain bearings
            </Link>
            <Link href="/products/bearings/housing" className="underline-offset-2 hover:underline">
              Housings
            </Link>
            <Link
              href="/documentation/modules/bearings"
              className="underline-offset-2 hover:underline"
            >
              Docs
            </Link>
          </div>
        </header>

        <section>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Start by bearing family
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Opens System Designer with the family pre-filtered.
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
