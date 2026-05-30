"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { categories } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string; // optional filter (e.g. "structural")
};

export default function Sidebar({ activeCategoryId }: SidebarProps) {
  const pathname = usePathname();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

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

  // Sync open section when the route changes — do not depend on openCategory or manual toggles are undone.
  useEffect(() => {
    if (activeCategoryFromPath) {
      setOpenCategory(activeCategoryFromPath);
    }
  }, [activeCategoryFromPath]);

  useEffect(() => {
    if (!activeCategoryFromPath && visibleCategories.length > 0) {
      setOpenCategory((prev) => prev ?? visibleCategories[0]!.id);
    }
  }, [activeCategoryFromPath, visibleCategories]);

  const activeModuleRoute = useMemo(
    () =>
      visibleCategories
        .flatMap((category) => category.modules)
        .find((module) => pathname?.startsWith(module.route))?.route,
    [pathname, visibleCategories]
  );

  return (
    <aside className="relative z-20 h-screen w-72 shrink-0 bg-white border-r border-slate-200 text-slate-950 shadow-sm overflow-y-auto">
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
                onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                className="w-full text-left px-4 py-3 transition hover:bg-slate-100"
              >
                <div className="font-semibold text-sm text-slate-950">{cat.title}</div>
                <div className="mt-1 text-xs text-slate-500">{cat.description}</div>
              </button>

              {isOpen && (
                <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3">
                  {cat.modules.map((mod) => (
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
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </aside>
  );
}