"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { categories, type EngineeringCategory, type EngineeringModule } from "@/data/modules";

type SidebarProps = {
  activeCategoryId?: string;
};

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
  const barRef = useRef<HTMLElement>(null);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

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

  const activeModule = useMemo(
    () =>
      visibleCategories
        .flatMap((category) => category.modules)
        .find((module) => pathname?.startsWith(module.route)),
    [pathname, visibleCategories]
  );

  const openCategory = useMemo(
    () => visibleCategories.find((category) => category.id === openCategoryId) ?? null,
    [openCategoryId, visibleCategories]
  );

  // Close dropdown on route change.
  useEffect(() => {
    setOpenCategoryId(null);
  }, [pathname]);

  // Esc closes dropdown.
  useEffect(() => {
    if (!openCategoryId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenCategoryId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCategoryId]);

  // Click outside closes dropdown.
  useEffect(() => {
    if (!openCategoryId) return;
    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (target && barRef.current?.contains(target)) return;
      setOpenCategoryId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openCategoryId]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId((current) => (current === categoryId ? null : categoryId));
  };

  const moduleGroups = openCategory ? groupModulesBySubGroup(openCategory.modules) : [];
  const dropdownColumns =
    openCategory && openCategory.modules.length > 6
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : openCategory && openCategory.modules.length > 3
        ? "sm:grid-cols-2"
        : "grid-cols-1";

  return (
    <div className="products-sidebar-wrap shrink-0">
      <aside
        ref={barRef}
        className="products-sidebar products-category-subbar sticky top-14 z-[60] isolate w-full border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-950/95"
        aria-label="Module categories"
      >
        <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
          <Link
            href="/products"
            title="All products"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
          >
            PC
          </Link>

          <div
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="menubar"
            aria-label="Product categories"
          >
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              const isPathActive = activeCategoryFromPath === cat.id;
              const isOpen = openCategoryId === cat.id;
              const label = categoryBarLabel(cat);

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="menuitem"
                  title={cat.title}
                  aria-label={`${cat.title} modules`}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? "products-module-dropdown" : undefined}
                  onClick={() => toggleCategory(cat.id)}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium transition sm:px-3 ${
                    isOpen || isPathActive
                      ? "bg-gradient-to-br from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">{label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 opacity-70 transition ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          {activeModule ? (
            <div className="hidden min-w-0 max-w-[10rem] shrink truncate text-xs text-slate-500 sm:block md:max-w-[14rem] dark:text-slate-400">
              {activeModule.title}
            </div>
          ) : null}
        </div>

        {openCategory ? (
          <div
            id="products-module-dropdown"
            role="menu"
            aria-label={`${openCategory.title} modules`}
            className="products-module-dropdown border-t border-slate-200/70 bg-white dark:border-slate-700/60 dark:bg-slate-950"
          >
            <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                    {openCategory.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {openCategory.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenCategoryId(null)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>

              <div className={`grid gap-4 ${dropdownColumns}`}>
                {moduleGroups.map((group, groupIndex) => (
                  <div key={group.label ?? `group-${groupIndex}`} className="space-y-1">
                    {group.label ? (
                      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {group.label}
                      </div>
                    ) : null}
                    {group.modules.map((mod) =>
                      mod.comingSoon ? (
                        <div
                          key={mod.id}
                          role="menuitem"
                          aria-disabled="true"
                          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-slate-400"
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
                          role="menuitem"
                          onClick={() => setOpenCategoryId(null)}
                          className={`block rounded-xl px-3 py-2 text-sm transition ${
                            activeModule?.route === mod.route
                              ? "bg-gradient-to-r from-cyan-600 to-sky-600 font-medium text-white shadow-sm shadow-cyan-500/20"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          }`}
                        >
                          <span className="font-medium">{mod.title}</span>
                          {mod.description ? (
                            <span className="mt-0.5 block text-xs font-normal opacity-70">
                              {mod.description}
                            </span>
                          ) : null}
                        </Link>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
