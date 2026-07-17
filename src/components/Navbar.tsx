"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PhyCalcMark from "@/components/brand/PhyCalcMark";
import NavUserMenu from "@/components/account/NavUserMenu";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { showAccountNav } from "@/lib/supabase/setupStatus";

const allNavigationItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/copilot", label: "Copilot" },
  { href: "/projects", label: "Projects" },
  { href: "/pricing", label: "Pricing", monetizationOnly: true },
  { href: "/account", label: "Account", authEnabled: true },
  { href: "/status", label: "Quality" },
  { href: "/support", label: "Support" },
  { href: "/documentation", label: "Docs" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  // On product pages the search box renders below the category sub-bar instead.
  const isProductsRoute = pathname?.startsWith("/products") ?? false;
  const { isMonetizationEnabled } = useEntitlement();
  const accountNavVisible = showAccountNav();
  const navigationItems = useMemo(
    () =>
      allNavigationItems.filter((item) => {
        if ("monetizationOnly" in item && item.monetizationOnly) {
          return isMonetizationEnabled;
        }
        if ("authEnabled" in item && item.authEnabled) {
          return accountNavVisible;
        }
        return true;
      }),
    [isMonetizationEnabled, accountNavVisible]
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setIsDarkMode(storedTheme === "dark");
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm dark:bg-slate-950/95 dark:border-slate-800">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <PhyCalcMark size={44} className="h-11 w-11 shrink-0 rounded-2xl shadow-sm" />
            <div className="hidden sm:block">
              <div className="text-slate-900 font-semibold dark:text-slate-100">PhyCalcPro</div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Engineering Platform</div>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-900 dark:hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <NavUserMenu />

          <button
            type="button"
            onClick={() => setIsDarkMode((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <NavUserMenu />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {!isProductsRoute ? (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/95 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl justify-end">
            <div className="w-full max-w-md sm:max-w-lg">
              <SearchBar />
            </div>
          </div>
        </div>
      ) : null}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 px-4 pb-4 dark:border-slate-800 dark:bg-slate-950/95">
          <nav className="space-y-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkMode ? "Light mode" : "Dark mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
