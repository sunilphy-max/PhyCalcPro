# Module Documentation Audit

**Date:** 2026-06-12 (updated after gap remediation)  
**Scope:** `docs/Modules-Technical-Reference.md`, math rendering pipeline, module doc pages, formula-reference UI

## Math rendering pipeline

1. **Source authoring** — `docs/Modules-Technical-Reference.md` uses `\( … \)` inline and `\[ … \]` display equations (or `$` / `$$`). Use `\frac{\partial^2 w}{\partial x^2}` for partial derivatives — slash shorthand is auto-fixed but explicit fractions are preferred.
2. **`normalizeDocumentationMath`** (`src/lib/documentation/normalizeMath.ts`):
   - `fixPartialDerivativeShorthand` — `\partial^2 w/\partial x` → `\frac{\partial^2 w}{\partial x}`
   - `convertPlainTextFormulas` — `Label: k = G d^4 / …` → labeled `\[ … \]` blocks
   - `wrapStandaloneLatexLines` — bare lines with `\sigma`, `\frac`, `\dot`, etc. → `$$ … $$`
   - `convertMathDelimiters` — `\[ \]` / `\( \)` → `$$` / `$` for remark-math
   - `promoteListItemEquations` — list items with inline math → labeled display blocks
   - `attachEquationCitations` — footnotes on equations before **Design codes:**
3. **Web render** — `loadTechnicalReference()` → React Markdown + remark-math + rehype-katex on module doc pages.
4. **Formula reference tool** — `MathExpression` + `expressionToLatex` render Unicode expressions (σ, ½, ·) with KaTeX in `FormulaReferenceInputs` / `FormulaReferenceResults`.

## Duplicate heading fix

**Root cause:** Section 15 brief stubs shared module IDs with Section 10 detailed advanced-system docs. `parseModuleSections` keeps the **longest** markdown chunk per `moduleId`.

**Fix:** Section 15 advanced-system stubs were **deleted**; Section 10 remains canonical.

## Content refresh (2026-06-12)

Updated technical reference for gap remediation:

| Area | Documentation change |
|------|----------------------|
| Export | Structured PDF reports (not screenshot capture) |
| Beams / columns | AISC/EC3 shear, LTB, inelastic column curves |
| Gears / bearings | ISO 6336 worksheet; ISO 281 catalog life |
| Bolts | VDI 2230-1 worksheet mode |
| Springs | EN 13906-1, direct G input |
| Fatigue | Basquin + Marin + mean-stress selector |
| Materials | ~58 graded catalog entries |
| Platform | Vitest benchmarks, `/projects`, cross-calc handoff |

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
