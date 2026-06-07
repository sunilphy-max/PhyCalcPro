# Module Documentation Audit

**Date:** 2026-06-07  
**Scope:** `docs/Modules-Technical-Reference.md`, math rendering pipeline, module doc page resolution

## Math rendering pipeline

1. **Source authoring** — `docs/Modules-Technical-Reference.md` uses `\( … \)` inline and `\[ … \]` display equations (or `$` / `$$`).
2. **`normalizeDocumentationMath`** (`src/lib/documentation/normalizeMath.ts`):
   - `convertPlainTextFormulas` — `Label: k = G d^4 / …` → labeled `\[ … \]` blocks
   - `wrapStandaloneLatexLines` — bare lines with `\sigma`, `\frac`, `\dot`, etc. → `$$ … $$`
   - `convertMathDelimiters` — `\[ \]` / `\( \)` → `$$` / `$` for remark-math
   - `promoteListItemEquations` — list items with inline math → labeled display blocks
   - `attachEquationCitations` — footnotes on equations before **Design codes:**
3. **Web render** — `loadTechnicalReference()` → React Markdown + remark-math + rehype-katex on module doc pages.

## Duplicate heading fix

**Root cause:** Section 15 brief stubs (`### Module (\`vacuum-engineering\`)`, etc.) shared module IDs with Section 10 detailed advanced-system docs. `parseModuleSections` used last-write-wins, so stubs overwrote canonical content for 8 modules.

**Fix:** `parseModuleSections` now keeps the **longest** markdown chunk per `moduleId`. Section 15 advanced-system stubs were **deleted**; Section 10 remains canonical.

## Modules updated

| Change | Modules |
|--------|---------|
| **Added** full doc section | `v-belts` (matches `src/lib/powerTransmission/v-belts/engine.ts`) |
| **Rewritten** Section 15 entries | `compression-springs` … `unit-converter` (22 expansion modules) |
| **Removed** duplicate stubs | `vacuum-engineering`, `cryogenic-engineering`, `magnetic-fields`, `superconducting-systems`, `thermal-management`, `battery-ev-systems`, `hydrogen-systems`, `precision-motion` |
| **LaTeX display blocks** | Section 14.3–14.5 plain-text formulas |
| **Homogenization notes** | Section 1.1, 11 (profiles), 13.1 — Tier 2 layout migration marked complete |

## Verification

```bash
node scripts/audit-module-docs.mjs    # v-belts present; dupes resolved by longest-wins
node scripts/test-normalize-math.mjs  # plain/LaTeX → $$ output
npm run build                         # layout validate + production build
```

## Remaining gaps

- **Unit profiles** — trusses, material-db, safety-factor, cost-estimator, cam-toolpaths still lack full `moduleProfiles.ts` entries.
- **Hook consolidation** — beams still uses legacy `useCalculationPipeline`.
- **Specialized evaluators** — only beams, columns, gears, combined-loading, welds have non-generic code checks.
- **Benchmark coverage** — expand `benchmarkRunner` beyond current indicative solvers.
- **Section 15 vs category sections** — expansion modules documented in Section 15; main category sections (3–10) remain the primary narrative for mature modules.

*Run `node scripts/audit-module-docs.mjs` after doc edits to catch missing headings and harmful duplicates.*
