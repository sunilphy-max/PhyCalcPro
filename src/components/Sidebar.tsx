"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { categories } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string; // optional filter (e.g. "structural")
};

export default function Sidebar({ activeCategoryId }: SidebarProps) {
  const pathname = usePathname();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    if (activeCategoryFromPath) {
      setOpenCategory(activeCategoryFromPath);
    } else if (!openCategory) {
      setOpenCategory(visibleCategories[0]?.id ?? null);
    }
  }, [activeCategoryFromPath, openCategory, visibleCategories]);

  const activeModuleRoute = useMemo(
    () =>
      visibleCategories
        .flatMap((category) => category.modules)
        .find((module) => pathname?.startsWith(module.route))?.route,
    [pathname, visibleCategories]
  );

  const moduleCount = visibleCategories.reduce(
    (total, category) => total + category.modules.length,
    0
  );

  return (
    <div className="h-screen w-72 bg-white border-r border-slate-200 text-slate-950 shadow-sm overflow-y-auto">
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
                      className="block rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
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
    </div>
  );
}