import { getModuleDoc, getModuleDocForDisplay } from "@/lib/documentation/loadReference";
import {
  extractFaqItems,
  extractMarkdownH2Section,
  extractBoldLabeledSection,
} from "@/lib/documentation/parseFrontmatter";
import MarkdownContent from "@/components/documentation/MarkdownContent";
import Link from "next/link";

const SUPPORTING_SECTIONS: {
  id: string;
  title: string;
  /** Prefer ## heading match */
  h2?: string;
  /** Fall back to **Label** technical block */
  boldLabel?: string;
}[] = [
  { id: "theory", title: "Theory", h2: "How engineers", boldLabel: "Physics & theory" },
  { id: "standards", title: "Applicable standards", boldLabel: "Design codes & checks", h2: "Design code" },
  { id: "assumptions", title: "Design assumptions", boldLabel: "Assumptions & limitations" },
  { id: "materials", title: "Material selection", h2: "Beam types" },
  { id: "example", title: "Worked example", h2: "Worked example" },
  { id: "faq", title: "FAQs", h2: "FAQ" },
  { id: "references", title: "References", boldLabel: "References" },
];

type Props = {
  moduleId: string;
  calculatorRoute: string;
};

/**
 * Below-fold supporting content for product calculator pages (SEO + engineer education).
 * Single-sourced from docs/modules/{moduleId}.md — excerpts only; full guide linked.
 */
export default function ModuleSupportingContent({ moduleId, calculatorRoute }: Props) {
  const raw = getModuleDoc(moduleId);
  const display = getModuleDocForDisplay(moduleId);
  if (!raw || !display) return null;

  const markdown = display.markdown;
  const faq = raw.faq.length ? raw.faq : extractFaqItems(raw.markdown);

  const blocks = SUPPORTING_SECTIONS.map((section) => {
    let body =
      (section.h2 ? extractMarkdownH2Section(markdown, section.h2) : null) ??
      (section.boldLabel ? extractBoldLabeledSection(markdown, section.boldLabel) : null);
    if (!body && section.id === "faq" && faq.length) {
      body = faq.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n");
    }
    if (!body?.trim()) return null;
    // Keep excerpts short for product page
    const trimmed = trimExcerpt(body, section.id === "faq" ? 3500 : 2200);
    return { ...section, body: trimmed };
  }).filter(Boolean) as { id: string; title: string; body: string }[];

  if (blocks.length === 0) return null;

  return (
    <section
      className="mx-auto mt-10 max-w-5xl space-y-8 border-t border-slate-200/80 px-4 pb-16 pt-10 dark:border-slate-700/60"
      aria-label="Engineering guide"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Engineering guide
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {raw.frontmatter.guideHeadline ?? "Theory, standards & examples"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Supporting content for design review and search — sourced from the module knowledge guide.
          </p>
        </div>
        <Link
          href={`/documentation/modules/${moduleId}`}
          className="text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400"
        >
          Open full guide
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Guide sections">
        {blocks.map((block) => (
          <a
            key={block.id}
            href={`#guide-${block.id}`}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            {block.title}
          </a>
        ))}
      </nav>

      {blocks.map((block) => (
        <article
          key={block.id}
          id={`guide-${block.id}`}
          className="scroll-mt-20 space-y-3 rounded-2xl border border-slate-200/70 bg-white/80 p-5 dark:border-slate-700/50 dark:bg-slate-900/40"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{block.title}</h3>
          <div className="prose-sm max-w-none dark:prose-invert">
            <MarkdownContent markdown={block.body} />
          </div>
        </article>
      ))}

      <p className="text-center text-sm text-slate-500">
        Ready to size a member?{" "}
        <a href={calculatorRoute} className="font-semibold text-sky-700 hover:underline dark:text-sky-400">
          Back to the calculator
        </a>
      </p>
    </section>
  );
}

function trimExcerpt(markdown: string, maxChars: number): string {
  if (markdown.length <= maxChars) return markdown;
  const cut = markdown.slice(0, maxChars);
  const lastBreak = Math.max(cut.lastIndexOf("\n\n"), cut.lastIndexOf("\n"));
  return `${cut.slice(0, lastBreak > maxChars * 0.5 ? lastBreak : maxChars).trim()}\n\n…`;
}
