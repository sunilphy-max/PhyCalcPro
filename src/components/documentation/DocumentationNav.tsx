"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/modules";

const TOP_LINKS = [
  { href: "/documentation", label: "Overview" },
  { href: "/documentation/reference", label: "Full reference" },
  { href: "/documentation/modules", label: "All modules" },
] as const;

type Props = {
  currentModuleId?: string;
};

export default function DocumentationNav({ currentModuleId }: Props) {
  const pathname = usePathname();
  const activeModuleId =
    currentModuleId ?? pathname?.match(/^\/documentation\/modules\/([^/]+)$/)?.[1];

  const linkClass = (href: string, active?: boolean) =>
    `block rounded-lg px-3 py-2 text-sm transition ${
      active || pathname === href
        ? "bg-slate-900 font-medium text-white dark:bg-white dark:text-slate-950"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <nav className="space-y-6" aria-label="Documentation">
      <div className="space-y-1">
        {TOP_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            {item.label}
          </Link>
        ))}
      </div>

      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          By module
        </p>
        <div className="max-h-[calc(100vh-16rem)] space-y-4 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat.id}>
              <p className="px-3 text-xs font-medium text-slate-500">{cat.title}</p>
              <ul className="mt-1 space-y-0.5">
                {cat.modules.map((mod) => {
                  const href = `/documentation/modules/${mod.id}`;
                  return (
                    <li key={mod.id}>
                      <Link
                        href={href}
                        className={linkClass(
                          href,
                          activeModuleId === mod.id || pathname === href
                        )}
                      >
                        {mod.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div>
            <p className="px-3 text-xs font-medium text-slate-500">Other</p>
            <ul className="mt-1">
              <li>
                <Link
                  href="/documentation/modules/profiles"
                  className={linkClass(
                    "/documentation/modules/profiles",
                    activeModuleId === "profiles"
                  )}
                >
                  Area properties
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
