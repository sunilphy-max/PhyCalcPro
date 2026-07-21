"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { getCategoryById, groupModulesBySubGroup } from "@/data/modules";

type CategoryLandingProps = {
  /** Serializable category id — icons are resolved client-side from modules.ts. */
  categoryId: string;
};

export default function CategoryLanding({ categoryId }: CategoryLandingProps) {
  const category = getCategoryById(categoryId);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredModules = useMemo(() => {
    if (!category) return [];
    return category.modules.filter((module) => {
      if (!normalizedQuery) return true;
      return [module.title, module.description, module.subGroup]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [category, normalizedQuery]);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-950 dark:text-white">Category not found</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-cyan-600">
          Back to products
        </Link>
      </div>
    );
  }

  const CategoryIcon = category.icon;
  const moduleGroups = groupModulesBySubGroup(filteredModules);
  const availableCount = category.modules.filter((m) => !m.comingSoon).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-transparent dark:text-slate-100">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-slate-900 text-white shadow-lg shadow-cyan-200/40 dark:shadow-cyan-950/40">
              <CategoryIcon className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
                Category
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                {category.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                {category.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                  {category.modules.length} tools
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                  {availableCount} available
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Filter ${category.title.toLowerCase()} modules`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-950 shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
            />
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredModules.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">
                No matching modules
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Try a broader filter or clear the search.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {moduleGroups.map((group, groupIndex) => (
                <div key={group.label ?? `group-${groupIndex}`} className="space-y-4">
                  {group.label ? (
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {group.label}
                    </h2>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.modules.map((mod) => {
                      const ModuleIcon = mod.icon;
                      if (mod.comingSoon) {
                        return (
                          <div
                            key={mod.id}
                            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 opacity-70 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                                {ModuleIcon ? (
                                  <ModuleIcon className="h-5 w-5" />
                                ) : (
                                  <Sparkles className="h-5 w-5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-500">{mod.title}</p>
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    Soon
                                  </span>
                                </div>
                                {mod.description ? (
                                  <p className="mt-1 text-sm text-slate-400">{mod.description}</p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={mod.id}
                          href={mod.route}
                          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-sm">
                              {ModuleIcon ? (
                                <ModuleIcon className="h-5 w-5" />
                              ) : (
                                <Sparkles className="h-5 w-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-950 group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-300">
                                {mod.title}
                              </p>
                              {mod.description ? (
                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                  {mod.description}
                                </p>
                              ) : null}
                              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                                Open calculator
                                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
