import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningPath, LEARNING_PATHS } from "@/data/learningPaths";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ pathId: string }> };

export function generateStaticParams() {
  return LEARNING_PATHS.map((p) => ({ pathId: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { pathId } = await params;
  const path = getLearningPath(pathId);
  return buildPageMetadata({
    title: path?.title ?? "Learning path",
    description: path?.description ?? "PhyCalcPro engineering learning path.",
    path: `/learn/${pathId}`,
  });
}

export default async function LearningPathPage({ params }: Props) {
  const { pathId } = await params;
  const path = getLearningPath(pathId);
  if (!path) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-slate-500">
        <Link href="/learn" className="hover:underline">
          Learning paths
        </Link>
        <span className="mx-2">/</span>
        <span>{path.title}</span>
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{path.title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{path.description}</p>
      <ol className="mt-8 space-y-4">
        {path.steps.map((step, i) => (
          <li
            key={step.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Step {i + 1}
            </p>
            <Link href={step.href} className="mt-1 block text-lg font-semibold text-sky-800 hover:underline dark:text-sky-300">
              {step.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
            {step.starterHint ? (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {step.starterHint}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
