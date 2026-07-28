export type ModuleDocFrontmatter = {
  seoTitle?: string;
  seoDescription?: string;
  guideHeadline?: string;
  keywords?: string[];
};

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseKeywords(raw: string): string[] {
  const inner = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
  if (!inner.trim()) return [];
  return inner
    .split(",")
    .map((part) => unquote(part.trim()))
    .filter(Boolean);
}

/** Minimal YAML frontmatter parser for module knowledge docs. */
export function parseFrontmatter(raw: string): {
  data: ModuleDocFrontmatter;
  body: string;
} {
  const normalized = raw.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n") && !normalized.startsWith("---\r\n")) {
    return { data: {}, body: normalized };
  }

  const endMatch = normalized.match(/\n---\r?\n/);
  if (!endMatch || endMatch.index === undefined) {
    return { data: {}, body: normalized };
  }

  const yamlBlock = normalized.slice(3, endMatch.index).replace(/^\r?\n/, "");
  const body = normalized.slice(endMatch.index + endMatch[0].length);
  const data: ModuleDocFrontmatter = {};
  const lines = yamlBlock.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]?.trim() ?? "";
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Multi-line list: keywords:\n  - item
    if (/^keywords:\s*$/.test(trimmed)) {
      const items: string[] = [];
      while (i + 1 < lines.length) {
        const next = lines[i + 1] ?? "";
        const listItem = /^\s*-\s+(.+)$/.exec(next);
        if (!listItem) break;
        items.push(unquote(listItem[1]));
        i += 1;
      }
      data.keywords = items;
      continue;
    }

    const colon = trimmed.indexOf(":");
    if (colon <= 0) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (key === "seoTitle") data.seoTitle = unquote(value);
    else if (key === "seoDescription") data.seoDescription = unquote(value);
    else if (key === "guideHeadline") data.guideHeadline = unquote(value);
    else if (key === "keywords") data.keywords = parseKeywords(value);
  }

  return { data, body: body.replace(/^\r?\n/, "") };
}

export type TocHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

export function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Extract ## / ### headings for in-page TOC (skips bold technical labels). */
export function extractTocHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    const title = match[2].replace(/\s*\(`[^`]+`\)\s*/, "").trim();
    if (!title || title.startsWith("**")) continue;
    // Only include ## in TOC for clarity; FAQ ### questions are skipped
    if (level !== 2) continue;
    headings.push({ id: slugifyHeading(title), title, level });
  }
  return headings;
}

export type FaqItem = { question: string; answer: string };

/** Parse ## FAQ section: ### Question followed by answer paragraphs until next heading. */
export function extractFaqItems(markdown: string): FaqItem[] {
  const faqStart = markdown.search(/\n## FAQ\b/);
  if (faqStart < 0) return [];

  const afterFaq = markdown.slice(faqStart + 1);
  const nextH2 = afterFaq.search(/\n## /);
  const faqBlock = nextH2 >= 0 ? afterFaq.slice(0, nextH2) : afterFaq;
  const chunks = faqBlock.split(/\n(?=### )/).slice(1);
  const items: FaqItem[] = [];

  for (const chunk of chunks) {
    const lines = chunk.trim().split(/\r?\n/);
    const question = lines[0]?.replace(/^###\s+/, "").trim();
    if (!question) continue;
    const answer = lines
      .slice(1)
      .join("\n")
      .trim()
      .replace(/\n+/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "");
    if (!answer) continue;
    items.push({ question, answer });
  }

  return items;
}

/** Drop the leading ### module title line (page H1 replaces it). */
export function stripLeadingModuleHeading(markdown: string): string {
  return markdown.replace(/^### .+?\n+/, "").trimStart();
}

/**
 * Extract a ## section whose title contains `titleMatch` (case-insensitive).
 * Stops at the next ## heading.
 */
export function extractMarkdownH2Section(markdown: string, titleMatch: string): string | null {
  const needle = titleMatch.toLowerCase();
  const lines = markdown.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = /^##\s+(.+)$/.exec(lines[i] ?? "");
    if (!m) continue;
    if (m[1].toLowerCase().includes(needle)) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i] ?? "")) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim() || null;
}

/**
 * Extract a **Label** technical block until the next **Label** or ## heading.
 */
export function extractBoldLabeledSection(markdown: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startRe = new RegExp(`\\*\\*${escaped}\\*\\*\\s*\\n+`, "i");
  const startMatch = startRe.exec(markdown);
  if (!startMatch || startMatch.index === undefined) return null;
  const from = startMatch.index + startMatch[0].length;
  const rest = markdown.slice(from);
  const nextBold = rest.search(/\n\*\*[^*\n]+\*\*/);
  const nextH2 = rest.search(/\n## /);
  let end = rest.length;
  if (nextBold >= 0) end = Math.min(end, nextBold);
  if (nextH2 >= 0) end = Math.min(end, nextH2);
  return rest.slice(0, end).trim() || null;
}
