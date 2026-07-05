/** True when the string is already LaTeX (module equation registry, docs). */
export function isAuthoredLatex(expression: string): boolean {
  return /\\(?:[a-zA-Z]+|[^a-zA-Z\s])/.test(expression);
}

/**
 * Convert formula-reference Unicode expressions to KaTeX-safe LaTeX.
 * Used where authors write readable symbols (σ, ½, ·) instead of raw LaTeX.
 */
export function expressionToLatex(expression: string): string {
  let s = expression
    .replace(/½/g, "\\frac{1}{2}")
    .replace(/·/g, "\\cdot ")
    .replace(/×/g, "\\times ")
    .replace(/−/g, "-")
    .replace(/²/g, "^{2}")
    .replace(/³/g, "^{3}")
    .replace(/⁴/g, "^{4}")
    .replace(/μ/g, "\\mu")
    .replace(/σ/g, "\\sigma")
    .replace(/τ/g, "\\tau")
    .replace(/Δ/g, "\\Delta")
    .replace(/π/g, "\\pi")
    .replace(/θ/g, "\\theta")
    .replace(/ω/g, "\\omega");

  s = s.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}");

  s = s.replace(/\\sigma([a-z]{1,4})/g, "\\sigma_$1");
  s = s.replace(/\\tau([a-z]{1,4})/g, "\\tau_$1");

  s = s.replace(/\bPcr\b/g, "P_{cr}");
  s = s.replace(/\bKt\b/g, "K_t");
  s = s.replace(/\bCd\b/g, "C_d");

  return s;
}
