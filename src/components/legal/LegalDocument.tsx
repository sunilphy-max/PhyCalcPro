import Link from "next/link";
import type { ReactNode } from "react";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type LegalRelatedLink = {
  href: string;
  label: string;
};

type LegalDocumentProps = {
  title: string;
  summary: string;
  lastUpdated: string;
  sections: LegalSection[];
  relatedLinks?: LegalRelatedLink[];
};

export default function LegalDocument({
  title,
  summary,
  lastUpdated,
  sections,
  relatedLinks = [],
}: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-4 border-b border-slate-200 pb-8 dark:border-slate-800">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Legal
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p className="font-semibold text-slate-950 dark:text-white">In plain language</p>
          <p className="mt-2">{summary}</p>
        </div>
        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
          This page is provided for transparency and operational clarity. It is not legal advice.
          Have a licensed attorney review these materials before you rely on them for a public launch.
        </p>
      </header>

      <nav
        aria-label="On this page"
        className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          On this page
        </p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 space-y-4 border-t border-slate-200 pt-8 dark:border-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Questions about this notice:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>
        </p>
        {relatedLinks.length > 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Related:{" "}
            {relatedLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? " · " : null}
                <Link href={link.href} className="underline underline-offset-2">
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </footer>
    </article>
  );
}
