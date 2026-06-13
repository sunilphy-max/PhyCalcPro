"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { expressionToLatex } from "@/lib/display/expressionToLatex";

type Props = {
  expression: string;
  /** Pre-authored LaTeX; when set, skips Unicode conversion. */
  latex?: string;
  display?: boolean;
  className?: string;
};

export default function MathExpression({
  expression,
  latex,
  display = false,
  className = "",
}: Props) {
  const tex = latex ?? expressionToLatex(expression);

  try {
    const html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: "ignore",
      trust: true,
    });

    return (
      <span
        className={`math-expression ${display ? "katex-display" : ""} ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <span className={`font-mono text-sm text-slate-800 ${className}`.trim()}>{expression}</span>
    );
  }
}
