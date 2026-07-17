import Link from "next/link";
import PhyCalcMark from "@/components/brand/PhyCalcMark";
import { getBuildInfo } from "@/lib/site/buildInfo";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";

const productLinks = [
  { href: "/products", label: "All modules" },
  { href: "/products/structural/beams", label: "Beams" },
  { href: "/products/machine/shafts", label: "Shafts" },
  { href: "/projects", label: "Saved projects" },
];

const resourceLinks = [
  { href: "/about", label: "About" },
  { href: "/documentation", label: "Documentation" },
  { href: "/trust", label: "Trust & responsibility" },
  { href: "/status", label: "Quality dashboard" },
  { href: "/support", label: "Support / Contact" },
];

const legalLinks = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/cookies", label: "Cookie & Storage Notice" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { buildLabel } = getBuildInfo();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <PhyCalcMark size={40} className="h-10 w-10 shrink-0 rounded-xl shadow-sm" />
              <div>
                <div className="font-semibold text-slate-950 dark:text-white">PhyCalcPro</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Engineering workspace</div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
              Design-assist calculations for mechanical, structural, and advanced systems work —
              with standards context, explicit assumptions, and exportable reports.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Resources
            </h3>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p>
              © {year} PhyCalcPro. All rights reserved. Results require independent engineering
              review.
            </p>
            <p className="text-xs">
              Build {buildLabel}. PhyCalcPro is a product brand providing design-assist software — not
              a substitute for licensed professional engineering services.
            </p>
          </div>
          <p className="shrink-0">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="transition hover:text-slate-700 dark:hover:text-slate-200"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
