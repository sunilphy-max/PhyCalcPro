/**
 * Verify normalizeDocumentationMath wraps plain/LaTeX lines into $$ display blocks.
 * Mirrors src/lib/documentation/normalizeMath.ts for regression checks.
 * Run: node scripts/test-normalize-math.mjs
 */

const LATEX_TOKEN_RE = /\\frac|\\sigma|\\tau|\\dot|\\quad|_\{|\\mu|\\pi|\\alpha|\\beta|\\epsilon|\\mathcal/;

function lineHasMathDelimiters(line) {
  const t = line.trim();
  return (
    t.includes("$") ||
    t.includes("\\(") ||
    t.includes("\\[") ||
    /^\$\$/.test(t) ||
    /\$\$$/.test(t)
  );
}

function wrapStandaloneLatexLines(markdown) {
  return markdown
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || lineHasMathDelimiters(line)) return line;
      if (/^#{1,6}\s/.test(trimmed) || /^\|/.test(trimmed)) return line;
      if (!LATEX_TOKEN_RE.test(trimmed)) return line;
      return `$$\n${trimmed}\n$$`;
    })
    .join("\n");
}

function plainToLatex(expr) {
  return expr
    .replace(/≈/g, "\\approx ")
    .replace(/([A-Za-z0-9])\^([A-Za-z0-9]+)/g, "$1^{$2}")
    .replace(/\s+/g, " ")
    .trim();
}

const PLAIN_FORMULA_LINE_RE = /^([A-Za-z][^:\n]{0,80}):\s+(.+?)(?:\.|,|;)?\s*$/;

function convertPlainTextFormulas(markdown) {
  return markdown
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || lineHasMathDelimiters(line)) return line;
      if (/^#{1,6}\s/.test(trimmed) || /^\|/.test(trimmed) || /^[-*]\s/.test(trimmed)) return line;
      const m = trimmed.match(PLAIN_FORMULA_LINE_RE);
      if (!m) return line;
      const body = m[2];
      if (!/[=^/]/.test(body) || !/[A-Za-z]/.test(body)) return line;
      const label = m[1].trim();
      const latex = plainToLatex(body);
      return `**${label}:**\n\n\\[\n${latex}\n\\]`;
    })
    .join("\n");
}

function convertMathDelimiters(markdown) {
  let result = markdown;
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, body) => `\n$$\n${body.trim()}\n$$\n`);
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, body) => `$${body.trim()}$`);
  return result;
}

function normalizeDocumentationMath(markdown) {
  let result = convertPlainTextFormulas(markdown);
  result = wrapStandaloneLatexLines(result);
  result = convertMathDelimiters(result);
  return result;
}

let failed = 0;

function assertIncludes(label, actual, needle) {
  if (!actual.includes(needle)) {
    console.error(`FAIL ${label}: expected to include ${JSON.stringify(needle)}`);
    console.error("  got:", actual.slice(0, 200));
    failed++;
  } else {
    console.log(`ok ${label}`);
  }
}

const plain = "Helical compression: k = G d^4 / (8 D^3 n)";
const plainOut = convertPlainTextFormulas(plain);
assertIncludes("plain-text formula", plainOut, "\\[");
assertIncludes("plain-text exponent", plainOut, "d^{4}");

const latexLine = String.raw`\sigma = \frac{M c}{I}`;
const latexOut = wrapStandaloneLatexLines(latexLine);
assertIncludes("standalone LaTeX", latexOut, "$$");
assertIncludes("standalone sigma", latexOut, "\\sigma");

const normalized = normalizeDocumentationMath(
  [
    "Helical compression: k = G d^4 / (8 D^3 n)",
    String.raw`\dot Q = k A \Delta T / L`,
    String.raw`\[E = mc^2\]`,
  ].join("\n")
);
assertIncludes("normalize pipeline display", normalized, "$$");
assertIncludes("normalize preserves converted plain", normalized, "G d^{4}");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll normalize-math checks passed.");
