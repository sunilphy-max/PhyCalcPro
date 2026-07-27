import Link from "next/link";
import { LEARNING_PATHS } from "@/data/learningPaths";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Engineering learning paths",
  description:
    "Curated learning paths that teach beam design, shaft–bearing power trains, and fastener joints using PhyCalcPro workspaces.",
  path: "/learn",
});

export default function LearnIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Engineering learning platform
      </p>
      <h1 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">Learning paths</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Same verified solvers for students and professionals — denser pedagogy or denser code checks.
      </p>
      <ul className="mt-8 space-y-4">
        {LEARNING_PATHS.map((path) => (
          <li
            key={path.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
          >
            <Link href={`/learn/${path.id}`} className="text-lg font-semibold text-slate-900 hover:underline dark:text-white">
              {path.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{path.description}</p>
            <p className="mt-2 text-xs text-slate-400">{path.steps.length} steps</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
