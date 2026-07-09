"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { categories, type EngineeringModule } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string;
  collapsed?: boolean;
  onToggle?: () => void;
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

function SidebarToggleButton({
  collapsed,
  onToggle,
  className = "",
}: {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={collapsed ? "Expand module sidebar" : "Collapse module sidebar"}
      aria-label={collapsed ? "Expand module sidebar" : "Collapse module sidebar"}
      aria-expanded={!collapsed}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
    >
      {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden /> : <ChevronLeft className="h-4 w-4" aria-hidden />}
    </button>
  );
}

export default function Sidebar({ activeCategoryId, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const activeModuleTitle = useMemo(
    () =>
      visibleCategories
        .flatMap((category) => category.modules)
        .find((module) => pathname?.startsWith(module.route))?.title,
    [pathname, visibleCategories]
  );

  const navContent = (
    <nav className="space-y-3 p-4" aria-label="Engineering modules">
      {visibleCategories.map((cat) => {
        const isOpen = openCategory === cat.id;
        const moduleGroups = groupModulesBySubGroup(cat.modules);

        return (
          <div
            key={cat.id}
            className="overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50"
          >
            <button
              type="button"
              onClick={() =>
                setManualOpenCategory({
                  pathname,
                  categoryId: isOpen ? null : cat.id,
                })
              }
              className="w-full px-4 py-3 text-left transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
            >
              <div className="text-sm font-semibold text-slate-950 dark:text-white">{cat.title}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{cat.description}</div>
            </button>

            {isOpen ? (
              <div className="space-y-2 border-t border-slate-200/70 bg-white px-4 py-3 dark:border-slate-700/60 dark:bg-slate-950/40">
                {moduleGroups.map((group, groupIndex) => (
                  <div key={group.label ?? `group-${groupIndex}`} className="space-y-1">
                    {group.label ? (
                      <div className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {group.label}
                      </div>
                    ) : null}
                    {group.modules.map((mod) =>
                      mod.comingSoon ? (
                        <div
                          key={mod.id}
                          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-slate-400"
                          aria-disabled="true"
                        >
                          <span>{mod.title}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          key={mod.id}
                          href={mod.route}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-xl px-3 py-2 text-sm transition ${
                            activeModuleRoute === mod.route
                              ? "bg-gradient-to-r from-cyan-600 to-sky-600 font-medium text-white shadow-sm shadow-cyan-500/20 hover:from-cyan-500 hover:to-sky-500"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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
  );

  return (
    <div
      className={`products-sidebar-wrap shrink-0 ${
        collapsed ? "products-sidebar-wrap--collapsed" : "products-sidebar-wrap--expanded"
      }`}
    >
      {/* Mobile: compact bar + slide-over nav */}
      <div className="products-sidebar-mobile-bar sticky top-0 z-[61] flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden dark:border-slate-700/60 dark:bg-slate-950/95">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-950 dark:text-white">PhyCalcPro</div>
          {activeModuleTitle ? (
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{activeModuleTitle}</div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">Engineering modules</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close module menu" : "Open module menu"}
          aria-expanded={mobileOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[59] bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`products-sidebar sticky top-0 z-[60] isolate shrink-0 self-start overflow-hidden border-slate-200/70 bg-white/95 text-slate-950 shadow-sm backdrop-blur-md transition-[width] duration-300 ease-out dark:border-slate-700/60 dark:bg-slate-950/95 dark:text-slate-100 ${
          collapsed ? "products-sidebar--collapsed" : "products-sidebar--expanded"
        } ${
          mobileOpen
            ? "fixed inset-y-0 left-0 z-[60] w-[min(100vw,20rem)] overflow-y-auto border-r shadow-xl lg:static lg:shadow-sm"
            : "hidden lg:block lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-y-auto lg:border-r"
        }`}
      >
        {/* Expanded header */}
        <div
          className={`border-b border-slate-200/70 bg-slate-50/90 px-4 py-5 dark:border-slate-700/60 dark:bg-slate-900/60 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">PhyCalcPro</h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Engineering modules</p>
            </div>
            {onToggle ? (
              <SidebarToggleButton
                collapsed={collapsed}
                onToggle={onToggle}
                className="hidden lg:inline-flex"
              />
            ) : null}
          </div>
        </div>

        {/* Collapsed rail (desktop) */}
        <div
          className={`hidden h-[100dvh] flex-col items-center border-b border-slate-200/70 py-4 lg:flex ${
            collapsed ? "lg:flex" : "lg:hidden"
          }`}
        >
          <Link
            href="/products"
            title="PhyCalcPro"
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
          >
            PC
          </Link>
          {onToggle ? <SidebarToggleButton collapsed={collapsed} onToggle={onToggle} /> : null}
        </div>

        <div className={collapsed ? "lg:hidden" : ""}>{navContent}</div>
      </aside>
    </div>
  );
}
