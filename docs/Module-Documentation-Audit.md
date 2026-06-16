# Module Documentation Audit

**Date:** 2026-06-13 (full module rewrite)  
**Scope:** `docs/modules/*.md` (63 per-module files), `docs/Modules-Technical-Reference.md` (platform + maturity), math rendering pipeline, module doc pages

## Math rendering pipeline

1. **Source authoring** — Each module has `docs/modules/{moduleId}.md` with required sections (Purpose, Physics & theory, Governing equations, Numerical method, Inputs, Outputs, Design codes & checks, Assumptions & limitations, References). Use `\( … \)` inline and `\[ … \]` display equations. Platform architecture lives in `docs/Modules-Technical-Reference.md` (sections 1–2, 12–13).
2. **`normalizeDocumentationMath`** (`src/lib/documentation/normalizeMath.ts`):
   - `fixPartialDerivativeShorthand` — `\partial^2 w/\partial x` → `\frac{\partial^2 w}{\partial x}`
   - `convertPlainTextFormulas` — `Label: k = G d^4 / …` → labeled `\[ … \]` blocks
   - `wrapStandaloneLatexLines` — bare lines with `\sigma`, `\frac`, `\dot`, etc. → `$$ … $$`
   - `convertMathDelimiters` — `\[ \]` / `\( \)` → `$$` / `$` for remark-math
   - `promoteListItemEquations` — list items with inline math → labeled display blocks
   - `attachEquationCitations` — footnotes on equations before **Design codes:**
3. **Web render** — `loadTechnicalReference()` → React Markdown + remark-math + rehype-katex on module doc pages.
4. **Formula reference tool** — `MathExpression` + `expressionToLatex` render Unicode expressions (σ, ½, ·) with KaTeX in `FormulaReferenceInputs` / `FormulaReferenceResults`.

## Architecture (2026-06-13)

- **Per-module files:** `docs/modules/{moduleId}.md` — canonical source for physics, formulas, and references.
- **Platform monolith:** `docs/Modules-Technical-Reference.md` — architecture, inventory, maturity matrix, roadmap only.
- **Compilation:** `loadReference.ts` concatenates platform + all module files for `/documentation/reference`; `/documentation/modules/[moduleId]` loads a single file.

## Content refresh (2026-06-13)

Complete rewrite of all 63 module docs with:

| Section | Content |
|---------|---------|
| Physics & theory | 2–4 paragraphs per module, aligned to solver code |
| Governing equations | LaTeX display blocks with variable definitions |
| References | Numbered textbooks and standards (Shigley, Roark, AISC, EN, ISO, VDI, etc.) |
| Design codes | Maps to PhyCalcPro check templates and beta modules |

## Verification

```bash
node scripts/audit-module-docs.mjs    # v-belts present; dupes resolved by longest-wins
node scripts/test-normalize-math.mjs  # plain/LaTeX/partial-derivative → $$ output
npm test                              # vitest unit + benchmark tests
npm run build                         # layout validate + production build
```

## Remaining gaps

- **Unit profiles** — trusses, safety-factor, cost-estimator, cam-toolpaths still lack full `moduleProfiles.ts` entries.
- **Hook consolidation** — prefer `useStandardCalculation` everywhere (beams migrated).
- **Specialized evaluators** — beams, columns, gears, combined-loading, welds; additional checks on bearings/springs/bolts via solver output.
- **Benchmark coverage** — expand `benchmarkRunner` and verification JSON beyond current flagship modules.

*Run `node scripts/audit-module-docs.mjs` after doc edits to catch missing headings and harmful duplicates.*
