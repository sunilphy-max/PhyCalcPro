/**
 * Prepare docs/Modules-Technical-Reference.md for remark-math + rehype-katex ($ delimiters).
 * Source authoring may use \( \) and \[ \] (LaTeX-style); remark-math expects $ and $$.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** \( … \) → $ … $ ; \[ … \] → $$ … $$ */
export function convertMathDelimiters(markdown: string): string {
  let result = markdown;

  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, body: string) => {
    const trimmed = body.trim();
    return `\n$$\n${trimmed}\n$$\n`;
  });

  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, body: string) => {
    return `$${body.trim()}$`;
  });

  return result;
}

/** "- Label: $formula$" alone on a line → labeled display equation */
export function promoteListItemEquations(markdown: string): string {
  return markdown.replace(
    /^- ([^:\n]+):\s*(\$[^$\n]+\$)\s*$/gm,
    (_, label: string, math: string) => {
      const inner = math.slice(1, -1);
      return `- **${label.trim()}:**\n\n$$\n${inner}\n$$`;
    }
  );
}

/**
 * Link display equations to the next **Design codes:** line via GFM footnotes.
 */
export function attachEquationCitations(markdown: string): string {
  const sections = markdown.split(/\n(?=### )/);

  return sections
    .map((section) => {
      const designMatch = section.match(/\*\*Design codes:\*\*([^\n]*)/);
      if (!designMatch) return section;

      const citationText = designMatch[1].trim();
      if (!citationText || /^indicative only\.?$/i.test(citationText)) {
        return section;
      }

      const footnoteId = slugify(citationText) || "design-ref";
      let cited = false;
      let searchFrom = 0;

      const updated = section.replace(/\n\$\$\n([\s\S]*?)\n\$\$\n/g, (match, body) => {
        const matchIndex = section.indexOf(match, searchFrom);
        searchFrom = matchIndex + match.length;
        const after = section.slice(matchIndex + match.length, matchIndex + match.length + 800);
        if (!after.includes("**Design codes:**")) return match;

        if (!cited) {
          cited = true;
          return `\n$$\n${body}\n$$[^${footnoteId}]\n`;
        }
        return match;
      });

      if (!cited) return section;
      if (updated.includes(`[^${footnoteId}]:`)) return updated;
      return `${updated}\n\n[^${footnoteId}]: ${citationText}`;
    })
    .join("\n");
}

const LATEX_TOKEN_RE = /\\frac|\\sigma|\\tau|\\dot|\\quad|_\{|\\mu|\\pi|\\alpha|\\beta|\\epsilon|\\mathcal/;

function lineHasMathDelimiters(line: string): boolean {
  const t = line.trim();
  return (
    t.includes("$") ||
    t.includes("\\(") ||
    t.includes("\\[") ||
    /^\$\$/.test(t) ||
    /\$\$$/.test(t)
  );
}

/** Wrap standalone lines with LaTeX tokens into display math blocks. */
export function wrapStandaloneLatexLines(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inDisplay = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "\\[" || trimmed === "$$") {
      inDisplay = true;
      out.push(line);
      continue;
    }
    if (trimmed === "\\]" || trimmed === "$$" && inDisplay) {
      inDisplay = false;
      out.push(line);
      continue;
    }
    if (inDisplay || !trimmed || lineHasMathDelimiters(line)) {
      out.push(line);
      continue;
    }
    if (/^#{1,6}\s/.test(trimmed) || /^\|/.test(trimmed)) {
      out.push(line);
      continue;
    }
    if (!LATEX_TOKEN_RE.test(trimmed)) {
      out.push(line);
      continue;
    }
    out.push(`$$\n${trimmed}\n$$`);
  }

  return out.join("\n");
}

function plainToLatex(expr: string): string {
  return expr
    .replace(/≈/g, "\\approx ")
    .replace(/([A-Za-z0-9])\^([A-Za-z0-9]+)/g, "$1^{$2}")
    .replace(/\s+/g, " ")
    .trim();
}

const PLAIN_FORMULA_LINE_RE =
  /^([A-Za-z][^:\n]{0,80}):\s+(.+?)(?:\.|,|;)?\s*$/;

/** Convert "Label: k = G d^4 / (8 D^3 n)" style lines to display math. */
export function convertPlainTextFormulas(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inDisplay = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "\\[" || trimmed === "$$") {
      inDisplay = true;
      out.push(line);
      continue;
    }
    if (trimmed === "\\]" || (trimmed === "$$" && inDisplay)) {
      inDisplay = false;
      out.push(line);
      continue;
    }
    if (inDisplay || !trimmed || lineHasMathDelimiters(line)) {
      out.push(line);
      continue;
    }
    if (/^#{1,6}\s/.test(trimmed) || /^\|/.test(trimmed) || /^[-*]\s/.test(trimmed)) {
      out.push(line);
      continue;
    }
    const m = trimmed.match(PLAIN_FORMULA_LINE_RE);
    if (!m) {
      out.push(line);
      continue;
    }
    const body = m[2];
    if (!/[=^/]/.test(body) || !/[A-Za-z]/.test(body)) {
      out.push(line);
      continue;
    }
    const label = m[1].trim();
    const latex = plainToLatex(body);
    out.push(`**${label}:**\n\n\\[\n${latex}\n\\]`);
  }

  return out.join("\n");
}

export function normalizeDocumentationMath(markdown: string): string {
  let result = convertPlainTextFormulas(markdown);
  result = wrapStandaloneLatexLines(result);
  result = convertMathDelimiters(result);
  result = promoteListItemEquations(result);
  result = attachEquationCitations(result);
  return result;
}
