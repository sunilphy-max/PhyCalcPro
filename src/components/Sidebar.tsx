"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { categories, type EngineeringModule } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string; // optional filter (e.g. "structural")
};

function groupModulesBySubGroup(modules: EngineeringModule[]) {
  const groups: { label: string | null; modules: EngineeringModule[] }[] = [];
  let currentLabel: string | null | undefined = undefined;

  for (const mod of modules) {
    const label = mod.subGroup ?? null;
    if (label !== currentLabel) {
      groups.push({ label, modules: [mod] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].modules.push(mod);
    }
  }

  return groups;
}

export default function Sidebar({ activeCategoryId }: SidebarProps) {
  const pathname = usePathname();
  const [manualOpenCategory, setManualOpenCategory] = useState<{
    pathname: string | null;
    categoryId: string | null;
  } | null>(null);

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
    <aside className="products-sidebar sticky top-0 z-[60] isolate h-auto w-full shrink-0 self-start overflow-y-auto border-b border-slate-200 bg-white text-slate-950 shadow-sm lg:h-[100dvh] lg:max-h-[100dvh] lg:border-b-0 lg:border-r">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-6">
        <h1 className="text-lg font-semibold text-slate-950">PhyCalcPro</h1>
        <p className="mt-1 text-xs text-slate-500">Engineering Modules</p>
      </div>

      <nav className="space-y-3 p-4" aria-label="Engineering modules">
        {visibleCategories.map((cat) => {
          const isOpen = openCategory === cat.id;
          const moduleGroups = groupModulesBySubGroup(cat.modules);

          return (
            <div key={cat.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setManualOpenCategory({
                    pathname,
                    categoryId: isOpen ? null : cat.id,
                  })
                }
                className="w-full px-4 py-3 text-left transition hover:bg-slate-100"
              >
                <div className="text-sm font-semibold text-slate-950">{cat.title}</div>
                <div className="mt-1 text-xs text-slate-500">{cat.description}</div>
              </button>

              {isOpen ? (
                <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-3">
                  {moduleGroups.map((group, groupIndex) => (
                    <div key={group.label ?? `group-${groupIndex}`} className="space-y-1">
                      {group.label ? (
                        <div className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {group.label}
                        </div>
                      ) : null}
                      {group.modules.map((mod) =>
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
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
