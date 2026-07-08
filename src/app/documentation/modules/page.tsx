import Link from "next/link";
import { categories } from "@/data/modules";
import { getModuleDocSections } from "@/lib/documentation/loadReference";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Module documentation",
  description: "Per-module engineering documentation index with formulas, methods, and limitations.",
  path: "/documentation/modules",
});

export default function DocumentationModulesIndexPage() {
  const sections = getModuleDocSections();

  return (
    <div>
      <p className="text-sm text-slate-500">
        <Link href="/documentation" className="hover:underline">
          Documentation
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Modules</span>
      </p>

      <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">All modules</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Each page includes formulas, calculation methods, catalog assumptions, limitations, and
        engineering checks.
      </p>

      <div className="mt-10 space-y-10">
        {categories.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{cat.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{cat.description}</p>
            <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
              {cat.modules.map((mod) => {
                const profile = getModuleStandardProfile(mod.id);
                const hasDoc = sections.has(mod.id);
                return (
                  <li key={mod.id}>
                    <Link
                      href={`/documentation/modules/${mod.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{mod.title}</span>
                      <span className="flex gap-2 text-xs">
                        {profile ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {profile.validationStatus}
                          </span>
                        ) : null}
                        {!hasDoc ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                            Doc pending
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Other</h2>
          <ul className="mt-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <li>
              <Link
                href="/documentation/modules/profiles"
                className="block px-5 py-4 font-medium text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/50"
              >
                Area properties (profiles)
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
