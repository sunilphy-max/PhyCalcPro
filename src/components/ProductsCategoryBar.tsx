"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { categories, type EngineeringCategory } from "@/data/modules";

/** Concise labels for the horizontal category bar. */
const CATEGORY_BAR_LABELS: Record<string, string> = {
  structural: "Structural",
  "power-transmission": "Power",
  machine: "Machine",
  bearings: "Bearings",
  springs: "Springs",
  fasteners: "Fasteners",
  materials: "Materials",
  pressure: "Pressure",
  dynamics: "Dynamics",
  manufacturing: "Manufacturing",
  "advanced-systems": "Advanced",
  tools: "Tools",
};

function categoryBarLabel(cat: EngineeringCategory) {
  return CATEGORY_BAR_LABELS[cat.id] ?? cat.title;
}

export default function ProductsCategoryBar() {
  const pathname = usePathname();

  const activeCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          pathname === `/products/${category.id}` ||
          pathname?.startsWith(`/products/${category.id}/`)
      ),
    [pathname]
  );

  const activeModule = useMemo(
    () =>
      categories
        .flatMap((category) => category.modules)
        .find((module) => pathname?.startsWith(module.route)),
    [pathname]
  );

  const isModulePage = Boolean(activeModule);
  const isHub = pathname === "/products" || pathname === "/products/";

  if (isModulePage && activeModule && activeCategory) {
    return (
      <div className="products-nav-wrap shrink-0">
        <aside
          className="products-nav products-context-bar sticky top-14 z-[60] isolate w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-950/95"
          aria-label="Module location"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-4">
            <nav
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Breadcrumb"
            >
              <Link
                href="/products"
                className="shrink-0 rounded-md px-1.5 py-1 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Products
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden />
              <Link
                href={`/products/${activeCategory.id}`}
                className="shrink-0 truncate rounded-md px-1.5 py-1 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {activeCategory.title}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden />
              <span className="truncate px-1.5 py-1 font-semibold text-slate-900 dark:text-white" aria-current="page">
                {activeModule.title}
              </span>
            </nav>

            <div className="hidden w-full max-w-[12rem] shrink-0 md:block lg:max-w-[16rem]">
              <SearchBar />
            </div>
          </div>

          <div className="border-t border-slate-200/60 px-3 py-1.5 md:hidden dark:border-slate-700/50">
            <SearchBar />
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="products-nav-wrap shrink-0">
      <aside
        className="products-nav products-category-subbar sticky top-14 z-[60] isolate w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-950/95"
        aria-label="Module categories"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-4">
          <Link
            href="/products"
            title="All products"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[0.65rem] font-semibold tracking-wide transition ${
              isHub
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            All
          </Link>

          <div
            className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="navigation"
            aria-label="Product categories"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory?.id === cat.id;
              const label = categoryBarLabel(cat);

              return (
                <Link
                  key={cat.id}
                  href={`/products/${cat.id}`}
                  title={cat.title}
                  aria-label={`${cat.title} category`}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition sm:px-2.5 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden w-full max-w-[12rem] shrink-0 md:block lg:max-w-[16rem]">
            <SearchBar />
          </div>
        </div>

        <div className="border-t border-slate-200/60 px-3 py-1.5 md:hidden dark:border-slate-700/50">
          <SearchBar />
        </div>
      </aside>
    </div>
  );
}
