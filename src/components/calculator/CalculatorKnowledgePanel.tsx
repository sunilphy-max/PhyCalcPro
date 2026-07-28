"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MarkdownContent from "@/components/documentation/MarkdownContent";
import ModuleValidationQualitySection from "@/components/documentation/ModuleValidationQualitySection";

type Props = {
  knowledgeSlug: string;
  title?: string;
};

type DocPayload = {
  title: string;
  markdown: string;
};

/**
 * In-product knowledge panel (EDP-2) — loads module guide markdown via API.
 * Includes a compact Validation & quality summary (moved off the global nav Quality tab).
 */
export default function CalculatorKnowledgePanel({ knowledgeSlug, title }: Props) {
  const [doc, setDoc] = useState<DocPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/knowledge/${encodeURIComponent(knowledgeSlug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Knowledge not found (${res.status})`);
        return res.json() as Promise<DocPayload>;
      })
      .then((data) => {
        if (!cancelled) setDoc(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [knowledgeSlug]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {title ?? doc?.title ?? "Engineering knowledge"}
        </h3>
        <Link
          href={`/documentation/modules/${knowledgeSlug}`}
          className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
        >
          Open full guide
        </Link>
      </div>

      <ModuleValidationQualitySection moduleId={knowledgeSlug} variant="compact" />

      {loading ? (
        <p className="text-sm text-slate-500">Loading guide…</p>
      ) : error ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
      ) : doc ? (
        <div className="max-h-[70vh] overflow-y-auto prose-sm dark:prose-invert">
          <MarkdownContent markdown={doc.markdown} />
        </div>
      ) : null}
    </div>
  );
}
