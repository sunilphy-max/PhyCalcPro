"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BEARING_SUITE_NAV, suiteNavItemForPath } from "@/lib/machine/bearings/bearingSuiteNav";

type Props = {
  children: ReactNode;
  /** Optional subtitle under the suite title */
  subtitle?: string;
};

/**
 * Shared chrome for the Bearing Engineering Suite — sticky tool nav + consistent look.
 */
export default function BearingSuiteChrome({ children, subtitle }: Props) {
  const pathname = usePathname() ?? "";
  const active = suiteNavItemForPath(pathname);
  const line =
    subtitle ??
    active?.description ??
    "Product Select–style bearing suite — start modes, then single-bearing / system calculator.";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent">
      <div className="border-b border-cyan-200/80 bg-white/95 backdrop-blur-sm dark:border-cyan-900/50 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0">
              <Link
                href="/products/bearings"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 hover:underline dark:text-cyan-400"
              >
                Bearing Engineering Suite
              </Link>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{line}</p>
            </div>
            <Link
              href="/documentation/modules/bearings"
              className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
            >
              Standards & guide →
            </Link>
          </div>

          <nav
            aria-label="Bearing suite tools"
            className="mt-3 -mx-1 flex gap-1 overflow-x-auto pb-1"
          >
            {BEARING_SUITE_NAV.map((item) => {
              const isActive = active?.id === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.description}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
