import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import MarkdownContent from "@/components/documentation/MarkdownContent";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Workflow modes",
  description:
    "Auto-design, Validate, and Compare — how calculator workflow modes work across PhyCalcPro modules.",
  path: "/documentation/workflow-modes",
});

function loadWorkflowModesDoc(): string {
  const filePath = path.join(process.cwd(), "docs", "workflow-modes.md");
  return readFileSync(filePath, "utf8");
}

export default function WorkflowModesDocumentationPage() {
  const markdown = loadWorkflowModesDoc();

  return (
    <div>
      <p className="text-sm text-slate-500">
        <Link href="/documentation" className="hover:underline">
          Documentation
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Workflow modes</span>
      </p>

      <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
        Calculator workflow modes
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
        Auto-design, Validate, and Compare — shared across all engineering modules. Application
        presets and document-status guidance for exports.
      </p>

      <div className="mt-10">
        <MarkdownContent markdown={markdown} />
      </div>
    </div>
  );
}
