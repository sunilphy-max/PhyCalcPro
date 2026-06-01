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

export function normalizeDocumentationMath(markdown: string): string {
  let result = convertMathDelimiters(markdown);
  result = promoteListItemEquations(result);
  result = attachEquationCitations(result);
  return result;
}
