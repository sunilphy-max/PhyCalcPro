"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, featuredModules } from "@/data/modules";
import HeroSchematic from "@/components/HeroSchematic";
import { ArrowRight, Calculator, Layers, BarChart3, Search, Sparkles } from "lucide-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          modules: category.modules.filter((module) => {
            if (!normalizedQuery) return true;
            return [module.title, module.description, category.title]
              .some((value) => value.toLowerCase().includes(normalizedQuery));
          }),
        }))
        .filter((category) => category.modules.length > 0),
    [normalizedQuery]
  );

  const matchingModuleCount = filteredCategories.reduce(
    (count, category) => count + category.modules.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.06),_transparent_35%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-100 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
                <BarChart3 className="h-4 w-4 text-cyan-500" />
                Intelligent engineering products
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-500">Product hub</p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    A modern product hub for structured engineering workflows.
                  </h1>
                </div>

                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  Discover tools designed for fast decisions, clearer design intent, and a unified product experience.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Layers className="mt-1 h-5 w-5 text-cyan-500" />
                      <div>
                        <div className="font-semibold text-slate-950">One catalog, one entry point</div>
                        <p className="mt-2 text-sm text-slate-500">Browse structural, machine, pressure, and manufacturing tools from a single menu.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Calculator className="mt-1 h-5 w-5 text-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-950">Clean product visuals</div>
                        <p className="mt-2 text-sm text-slate-500">Enjoy improved spacing, readable cards, and thoughtful emphasis across every module.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400">
                  Browse modules
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/documentation" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300">
                  See docs
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 top-10 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute -left-10 bottom-6 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-xl">
                <div className="mb-4 overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-sm">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <HeroSchematic />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-950">Featured workflows</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Accelerate model setup with a premium visual language and smart workflow previews.
                  </p>
                  <div className="mt-6 grid gap-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Structural beam, shaft, and fastener design in one cohesive product library.</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Industry-ready checks, material selection, and result summaries with clarity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-500">Explore by category</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Find the ideal engineering tool for every workflow.</h2>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-950">
                    <Sparkles className="h-5 w-5 text-cyan-500" />
                    <div>
                      <p className="text-sm font-semibold">Featured modules</p>
                      <p className="text-xs text-slate-500">Hand-picked tools for rapid design and review.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="relative max-w-3xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="product-search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search modules or categories"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-950 shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {matchingModuleCount} module{matchingModuleCount === 1 ? "" : "s"} currently match your search.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {featuredModules.slice(0, 4).map((module) => {
                const ModuleIcon = module.icon;
                return (
                  <Link
                    key={module.id}
                    href={module.route}
                    className="group block overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500 text-white shadow-sm">
                        {ModuleIcon ? <ModuleIcon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{module.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{module.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            {filteredCategories.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-xl font-semibold text-slate-950">No matching modules found.</p>
                <p className="mt-3 text-sm text-slate-600">Try a broader search term or clear the query to see all available categories.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-6 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-3">
                {filteredCategories.map((category) => {
                  const CategoryIcon = category.icon;
                  const firstAvailableModule = category.modules.find((module) => !module.comingSoon);
                  return (
                    <div key={category.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-slate-900 text-white shadow-lg shadow-cyan-200/50">
                        <CategoryIcon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-2xl font-semibold text-slate-950">{category.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{category.modules.length} tools</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{category.title.split(" ")[0]}</span>
                        {category.modules.every((module) => module.comingSoon) ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">Coming soon</span>
                        ) : null}
                      </div>
                      <Link
                        href={firstAvailableModule?.route ?? "/products"}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-500 transition group-hover:text-cyan-600"
                      >
                        {firstAvailableModule ? "Explore category" : "Preview category"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
