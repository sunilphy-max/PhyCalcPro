import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import { bearingAssistantHubCards } from "@/lib/machine/bearings/bearingApplicationAssistants";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: { absolute: "Bearing Selection Assistants — PhyCalcPro" },
  description:
    "Machine-guided bearing selection: electric motor, pump, fan, gearbox, conveyor, and ballscrew assistants.",
  path: "/products/bearings/assistant",
});

export default function BearingAssistantsIndexPage() {
  const cards = bearingAssistantHubCards();

  return (
    <BearingSuiteChrome subtitle="Pick a machine — then answer a few questions before the calculator.">
      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Selection assistants
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Select for an application
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            PhyCalc machine paths. Each assistant pre-fills duty, profile, and
            arrangement in the Bearing System Designer.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <Link
                href={card.formHref}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {card.label}
                  </p>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-cyan-600" />
                </div>
                <p className="mt-1 text-xs font-medium text-cyan-800 dark:text-cyan-300">
                  {card.outcome}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{card.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-slate-500">
          Or go straight to the{" "}
          <Link
            href="/products/bearings/designer"
            className="font-medium text-cyan-700 hover:underline dark:text-cyan-400"
          >
            calculator
          </Link>
          .
        </p>
      </div>
    </BearingSuiteChrome>
  );
}
