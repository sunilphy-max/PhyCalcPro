import Link from "next/link";
import MarkdownContent from "@/components/documentation/MarkdownContent";
import { loadTechnicalReference, parseMajorSections } from "@/lib/documentation/loadReference";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Technical reference",
  description: "Full engineering module manual with formulas, methods, and limitations.",
  path: "/documentation/reference",
});

export default function DocumentationReferencePage() {
  const markdown = loadTechnicalReference();
  const sections = parseMajorSections(markdown);

  return (
    <div>
      <p className="text-sm text-slate-500">
        <Link href="/documentation" className="hover:underline">
          Documentation
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Technical reference</span>
      </p>

      <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
        Modules technical reference
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
        Platform sections from{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
          docs/Modules-Technical-Reference.md
        </code>
        ; per-module physics and formulas from{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">docs/modules/*.md</code>
        . Display equations render with KaTeX; design-standard references appear as footnotes on keyed equations.
      </p>

      <nav className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
        <ol className="mt-3 columns-1 gap-x-8 text-sm sm:columns-2">
          {sections.map((section) => (
            <li key={section.id} className="mb-1.5 break-inside-avoid">
              <a href={`#${section.id}`} className="text-blue-700 hover:underline dark:text-blue-400">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10">
        <MarkdownContent markdown={markdown} />
      </div>
    </div>
  );
}
