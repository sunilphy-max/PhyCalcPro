import Link from "next/link";
import { allModules, categories } from "@/data/modules";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Documentation",
  description:
    "Engineering reference for PhyCalcPro calculator modules: governing formulas, numerical methods, design-code checks, assumptions, limitations, and known gaps.",
  path: "/documentation",
});

export default function DocumentationPage() {
  const moduleCount = allModules.filter((module) => !module.comingSoon).length;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
        PhyCalcPro documentation
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        Engineering reference for all calculator modules: governing formulas, numerical methods,
        design-code checks, assumptions, limitations, and known gaps.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/documentation/reference"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Full technical reference</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Complete manual — platform architecture, all {moduleCount} active modules, maturity
            matrix, and roadmap.
          </p>
        </Link>
        <Link
          href="/documentation/workflow-modes"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Workflow modes</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Auto-design, Validate, and Compare — how the three calculator modes work on every module.
          </p>
        </Link>
        <Link
          href="/documentation/modules"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Browse by module</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Jump to any module for purpose, equations, inputs/outputs, and gaps.
          </p>
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quick start</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 dark:text-slate-300">
          <li>
            Each calculator has a <strong>Design standard</strong> selector (Indicative, US, EU, ISO).
            Changing the standard sets default units; you can still edit units freely.
          </li>
          <li>
            After calculate, review <strong>engineering checks</strong> in the results panel.{" "}
            <em>Not available</em> means the check is catalogued but not yet verified for that code.
          </li>
          <li>
            Export **structured PDF** reports (title block, metrics, engineering checks, formulas, charts) plus CSV — included during early access (no signup required).
          </li>
          <li>
            Save and reload work from the <Link href="/projects" className="font-medium underline">Projects</Link> dashboard; flagship modules support cross-calculator handoff (e.g. gear → shaft → bearing).
          </li>
        </ul>
        <p className="mt-4 text-sm text-slate-500">
          <Link href="/trust" className="font-medium underline">
            Trust & responsibility
          </Link>
          {" · "}
          <Link href="/status" className="font-medium underline">
            Quality & maturity
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Modules by category</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white">{cat.title}</h3>
              <ul className="mt-3 space-y-1">
                {cat.modules.map((mod) => (
                  <li key={mod.id}>
                    <Link
                      href={`/documentation/modules/${mod.id}`}
                      className="text-sm text-blue-700 hover:underline dark:text-blue-400"
                    >
                      {mod.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Other</h3>
            <ul className="mt-3">
              <li>
                <Link
                  href="/documentation/modules/profiles"
                  className="text-sm text-blue-700 hover:underline dark:text-blue-400"
                >
                  Area properties (profiles)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
