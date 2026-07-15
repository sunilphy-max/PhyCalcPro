"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { categories, type EngineeringModule } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string;
  /** Whether the module catalog overlay is open. */
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  onToggleDrawer?: () => void;
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

export default function Sidebar({
  activeCategoryId,
  drawerOpen = false,
  onDrawerOpenChange,
  onToggleDrawer,
}: SidebarProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [manualOpenCategory, setManualOpenCategory] = useState<{
    pathname: string | null;
    categoryId: string | null;
  } | null>(null);

  const toggleDrawer = () => {
    if (onToggleDrawer) onToggleDrawer();
    else onDrawerOpenChange?.(!drawerOpen);
  };

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

  // Close drawer on route change (module navigate).
  useEffect(() => {
    onDrawerOpenChange?.(false);
  }, [pathname, onDrawerOpenChange]);

  // Esc closes drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDrawerOpenChange?.(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, onDrawerOpenChange]);

  // Focus the drawer when opened for a11y.
  useEffect(() => {
    if (!drawerOpen) return;
    const panel = drawerRef.current;
    if (!panel) return;
    const focusable = panel.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [drawerOpen]);

  const openCategoryInDrawer = (categoryId: string) => {
    setManualOpenCategory({ pathname, categoryId });
    onDrawerOpenChange?.(true);
  };

  const closeOnNavigate = () => {
    onDrawerOpenChange?.(false);
  };

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
                          onClick={closeOnNavigate}
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
    <div className="products-sidebar-wrap shrink-0">
      {/* Mobile: compact bar */}
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
          onClick={toggleDrawer}
          aria-label={drawerOpen ? "Close module menu" : "Open module menu"}
          aria-expanded={drawerOpen}
          aria-controls="products-nav-drawer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200"
        >
          {drawerOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {/* Desktop: permanent icon rail (always ~4rem, never pushes layout wider) */}
      <aside
        className="products-sidebar products-icon-rail hidden lg:flex lg:h-[100dvh] lg:max-h-[100dvh] lg:sticky lg:top-0 lg:z-[60] lg:isolate lg:w-full lg:flex-col lg:items-center lg:gap-1 lg:overflow-y-auto lg:border-r lg:border-slate-200/70 lg:bg-white/95 lg:py-4 lg:shadow-sm lg:backdrop-blur-md dark:lg:border-slate-700/60 dark:lg:bg-slate-950/95"
        aria-label="Module categories"
      >
        <Link
          href="/products"
          title="PhyCalcPro"
          className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
        >
          PC
        </Link>
        <button
          type="button"
          onClick={toggleDrawer}
          title={drawerOpen ? "Close module catalog" : "Open module catalog"}
          aria-label={drawerOpen ? "Close module catalog" : "Open module catalog"}
          aria-expanded={drawerOpen}
          aria-controls="products-nav-drawer"
          className="mb-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {drawerOpen ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
        </button>
        <div className="flex w-full flex-col items-center gap-1 px-1.5">
          {visibleCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategoryFromPath === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                title={cat.title}
                aria-label={cat.title}
                aria-current={isActive ? "true" : undefined}
                onClick={() => openCategoryInDrawer(cat.id)}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-gradient-to-br from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Overlay backdrop + drawer (mobile + desktop) */}
      {drawerOpen ? (
        <div
          className="products-nav-backdrop fixed inset-0 z-[59] bg-slate-950/40 backdrop-blur-[2px]"
          onClick={() => onDrawerOpenChange?.(false)}
          aria-hidden
        />
      ) : null}

      <div
        ref={drawerRef}
        id="products-nav-drawer"
        role="dialog"
        aria-modal={drawerOpen}
        aria-label="Engineering modules"
        aria-hidden={!drawerOpen}
        className={`products-nav-drawer fixed inset-y-0 left-0 z-[60] flex w-[min(100vw,20rem)] flex-col overflow-hidden border-r border-slate-200/70 bg-white/95 text-slate-950 shadow-xl backdrop-blur-md transition-transform duration-300 ease-out dark:border-slate-700/60 dark:bg-slate-950/95 dark:text-slate-100 lg:left-16 ${
          drawerOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        hidden={!drawerOpen}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 bg-slate-50/90 px-4 py-5 dark:border-slate-700/60 dark:bg-slate-900/60">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">PhyCalcPro</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Engineering modules</p>
          </div>
          <button
            type="button"
            onClick={() => onDrawerOpenChange?.(false)}
            title="Close module catalog"
            aria-label="Close module catalog"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{navContent}</div>
      </div>
    </div>
  );
}
