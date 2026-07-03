# Module Documentation Audit

**Date:** 2026-07-03 (post shaft/bearing/spring + verification registry update)  
**Scope:** `docs/modules/*.md`, platform docs, verification CI, math rendering pipeline

## Math rendering pipeline

1. **Source authoring** — Each module has `docs/modules/{moduleId}.md` with required sections (Purpose, Physics & theory, Governing equations, Numerical method, Inputs, Outputs, Design codes & checks, Assumptions & limitations, References). Use `\( … \)` inline and `\[ … \]` display equations. Platform architecture lives in `docs/Modules-Technical-Reference.md` (sections 1–2, 12–13).
2. **`normalizeDocumentationMath`** (`src/lib/documentation/normalizeMath.ts`):
   - `fixPartialDerivativeShorthand` — `\partial^2 w/\partial x` → `\frac{\partial^2 w}{\partial x}`
   - `convertPlainTextFormulas` — `Label: k = G d^4 / …` → labeled `\[ … \]` blocks
   - `wrapStandaloneLatexLines` — bare lines with `\sigma`, `\frac`, `\dot`, etc. → `$$ … $$`
   - `convertMathDelimiters` — `\[ \]` / `\( \)` → `$$` / `$` for remark-math
   - `promoteListItemEquations` — list items with inline math → labeled display blocks
   - `attachEquationCitations` — footnotes on equations before **Design codes:**
3. **Web render** — `loadTechnicalReference()` and `getModuleDocForDisplay()` both call `normalizeDocumentationMath()` before React Markdown + remark-math + rehype-katex. Per-module pages at `/documentation/modules/[moduleId]` use `getModuleDocForDisplay()`; the compiled reference at `/documentation/reference` normalizes the concatenated document once.
4. **Formula reference tool** — `MathExpression` + `expressionToLatex` render Unicode expressions (σ, ½, ·) with KaTeX in `FormulaReferenceInputs` / `FormulaReferenceResults`.

## Architecture

- **Per-module files:** `docs/modules/{moduleId}.md` — canonical source for physics, formulas, and references.
- **Platform monolith:** `docs/Modules-Technical-Reference.md` — architecture, inventory, maturity matrix, roadmap.
- **Validation hub:** `docs/validation-master-checklist.md` — engineer sign-off for all 62 modules.
- **Verification guide:** `docs/VerificationGuide.md` — CI commands, JSON schema, 24 benchmark modules.
- **Spring checklist:** `docs/modules/spring-modules-user-tasks.md` — spring-specific tasks.
- **Compilation:** `loadReference.ts` concatenates platform + all module files for `/documentation/reference`.

## Flagship module docs (2026 Q3 refresh)

These module files were updated for the latest solver/UI work:

| Module | Key doc updates |
|--------|-----------------|
| shafts | FEM, fatigue, critical speed, handoff |
| bearings | ISO 281/76, modified life, catalog design |
| compression-springs | Fatigue, wire catalog, surge, buckling, CI cases |
| extension-springs | Hook stress, Fi, fatigue, CI case |
| torsion-springs | Rate formula k=Ed⁴/(64Dn), curvature factor, fatigue, CI case |

## Verification & testing

| Layer | Coverage |
|-------|----------|
| **JSON CI** | 24 modules — `npm run test:verification` |
| **Solver registry** | 61 modules — `src/lib/qa/moduleSolverRegistry.ts` |
| **Vitest engines** | shafts, bearings, 3× springs, v-belts, fatigue, gears solver, bolts FEM/VDI, structural FEM |
| **Bootstrap** | `npx tsx scripts/bootstrap-verification.ts` |

## Verification commands

```bash
node scripts/audit-module-docs.mjs    # missing headings; dupes resolved by longest-wins
node scripts/test-normalize-math.mjs  # plain/LaTeX/partial-derivative → $$ output
npm test                              # vitest unit + benchmark tests
npm run test:verification             # JSON CI (24 cases)
npm run build                         # layout validate + production build
```

## Remaining gaps

- **Unit profiles** — trusses, safety-factor, cost-estimator, cam-toolpaths still lack full `moduleProfiles.ts` entries.
- **Hook consolidation** — prefer `useStandardCalculation` everywhere (beams migrated).
- **JSON CI expansion** — 38 modules have solvers but no committed verification JSON yet; use master checklist priority order.
- **Per-module doc refresh** — all 24 CI modules now have explicit **Verification** sections; remaining modules still use the generic reference line until JSON cases are added.

*Run `node scripts/audit-module-docs.mjs` after doc edits to catch missing headings and harmful duplicates.*
