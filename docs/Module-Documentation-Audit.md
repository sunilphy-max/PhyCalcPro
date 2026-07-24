# Module Documentation Audit

**Date:** 2026-07-23 (engineering knowledge-guide refresh)  
**Scope:** `docs/modules/*.md`, platform docs, verification CI, math rendering pipeline, SEO page shell

## Knowledge-guide format

Each `docs/modules/{moduleId}.md` is an **engineering knowledge page** (SEO selection/analysis guide) plus the technical reference block.

### YAML frontmatter

```yaml
---
seoTitle: "Bearing Selection Guide: How Engineers Select Bearings"
seoDescription: "…"
guideHeadline: "How Engineers Select Bearings"
keywords: ["bearing selection", "L10 life", "ISO 281"]
---
```

Parsed by [`src/lib/documentation/parseFrontmatter.ts`](../src/lib/documentation/parseFrontmatter.ts) and consumed by `/documentation/modules/[moduleId]` for metadata, H1, TOC, and FAQ JSON-LD.

### Required knowledge sections

1. Intro (`## How engineers …`)
2. Types / configurations / when to use
3. `## Engineering workflow`
4. `## Key quantities and formulas` (with `\[ … \]` display math)
5. `## Worked example`
6. `## Common mistakes and checks`
7. `## FAQ` (### questions — feeds `FAQPage` schema)
8. `## Use the PhyCalcPro calculator`

### Required technical sections

**Purpose**, **Physics & theory**, **Governing equations**, **Numerical method**, **Inputs**, **Outputs**, **Design codes & checks**, **Assumptions & limitations**, **References** (plus **Verification** when CI exists).

## Math rendering pipeline

1. **Source authoring** — `\( … \)` inline and `\[ … \]` display equations. Platform architecture lives in `docs/Modules-Technical-Reference.md` (sections 1–2, 12–13).
2. **`normalizeDocumentationMath`** (`src/lib/documentation/normalizeMath.ts`) — delimiter conversion, plain-text promotion, KaTeX prep.
3. **Web render** — `getModuleDocForDisplay()` strips the leading `###` heading (page H1 replaces it), then normalizes math. Compiled reference at `/documentation/reference` concatenates all module bodies.
4. **SEO shell** — `documentationModuleJsonLd` emits BreadcrumbList + TechArticle + FAQPage; sticky TOC from `##` headings; calculator CTA above the fold.

## Architecture

- **Per-module files:** `docs/modules/{moduleId}.md` — canonical knowledge + technical source.
- **Platform monolith:** `docs/Modules-Technical-Reference.md` — architecture, inventory, maturity, roadmap.
- **Loader:** `src/lib/documentation/loadReference.ts` — frontmatter, TOC, FAQ, category compile lists (includes shells, motor, housing, power-screws, bearings suite).
- **Validation hub:** `docs/validation-master-checklist.md`
- **Verification guide:** `docs/VerificationGuide.md`

## Coverage

| Item | Count |
|------|-------|
| Catalog modules with guides | 65 |
| Skip non-doc files | `bearings-suite-audit.md`, `spring-modules-user-tasks.md` |
| Obsolete audit ids (no file expected) | `load-case-manager`, `safety-factor`, `formula-reference` |

## Verification commands

```bash
node scripts/audit-module-docs.mjs    # frontmatter + knowledge + technical headings; math issues
node scripts/test-normalize-math.mjs  # plain/LaTeX/partial-derivative → $$ output
npm test                              # vitest unit + benchmark tests
npm run test:verification             # JSON CI
npm run build                         # layout validate + production build
```

## Remaining gaps

- **JSON CI expansion** — modules without committed verification JSON still use the generic verification note until cases are added.
- **Vendor gold** — bearings engineer sign-off pending ±5% vendor gold where noted in the guide.

*Run `node scripts/audit-module-docs.mjs` after doc edits.*
