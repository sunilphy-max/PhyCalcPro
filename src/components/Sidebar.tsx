"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { categories } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string; // optional filter (e.g. "structural")
};

export default function Sidebar({ activeCategoryId }: SidebarProps) {
  const pathname = usePathname();
  const [manualOpenCategory, setManualOpenCategory] = useState<{
    pathname: string | null;
    categoryId: string | null;
  } | null>(null);

  // -----------------------------
  // Scope categories based on page
  // -----------------------------
  const visibleCategories = useMemo(
    () =>
      activeCategoryId
        ? categories.filter((category) => category.id === activeCategoryId)
        : categories,
    [activeCategoryId]
  );

  const activeCategoryFromPath = useMemo(
    () =>
      visibleCategories.find((category) =>
        category.modules.some((module) => pathname?.startsWith(module.route))
      )?.id,
    [pathname, visibleCategories]
  );

  const defaultOpenCategory = useMemo(
    () => activeCategoryFromPath ?? visibleCategories[0]?.id ?? null,
    [activeCategoryFromPath, visibleCategories]
  );

  const openCategory =
    manualOpenCategory?.pathname === pathname
      ? manualOpenCategory.categoryId
      : defaultOpenCategory;

  const activeModuleRoute = useMemo(
    () =>
      visibleCategories
        .flatMap((category) => category.modules)
        .find((module) => pathname?.startsWith(module.route))?.route,
    [pathname, visibleCategories]
  );

  return (
    <aside className="relative z-50 h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white text-slate-950 shadow-sm">
      {/* Header */}
      <div className="px-5 py-6 border-b border-slate-200 bg-slate-50">
        <h1 className="text-lg font-semibold text-slate-950">PhyCalcPro</h1>
        <p className="mt-1 text-xs text-slate-500">Engineering Modules</p>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-3">
        {visibleCategories.map((cat) => {
          const isOpen = openCategory === cat.id;

          return (
            <div key={cat.id} className="rounded-3xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
              <button
                onClick={() =>
                  setManualOpenCategory({
                    pathname,
                    categoryId: isOpen ? null : cat.id,
                  })
                }
                className="w-full text-left px-4 py-3 transition hover:bg-slate-100"
              >
                <div className="font-semibold text-sm text-slate-950">{cat.title}</div>
                <div className="mt-1 text-xs text-slate-500">{cat.description}</div>
              </button>

              {isOpen && (
                <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3">
                  {cat.modules.map((mod) =>
                    mod.comingSoon ? (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm text-slate-400"
                        aria-disabled="true"
                      >
                        <span>{mod.title}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Soon
                        </span>
                      </div>
                    ) : (
                      <Link
                        key={mod.id}
                        href={mod.route}
                        className={`block rounded-2xl px-3 py-2 text-sm transition hover:bg-slate-100 ${
                          activeModuleRoute === mod.route
                            ? "bg-slate-900 font-medium text-white hover:bg-slate-800 hover:text-white"
                            : "text-slate-700 hover:text-slate-900"
                        }`}
                      >
                        {mod.title}
                      </Link>
                    )
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </aside>
  );
}