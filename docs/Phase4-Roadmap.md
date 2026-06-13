# Phase 4 — QA, maturity gates, and continuous verification

Phase 4 keeps PhyCalcPro trustworthy over time: **benchmarks in CI**, **release tiers** per module, and a visible **quality dashboard**.

## Goals

| Goal | Mechanism |
|------|-----------|
| Regressions caught before deploy | `npm test` + `npm run test:verification` |
| Clear “how ready is this module?” | Release tiers on calculators + `/status` |
| Export & units audited | Export/unit matrix (see below) |
| Your sign-off tracked | JSON cases in `src/data/verification/` |

## Release tiers

| Tier | Meaning |
|------|---------|
| **draft** | Early / incomplete module |
| **indicative** | Default; educational mechanics |
| **beta** | Code checks or FEM in active verification (catalog `beta`) |
| **verified** | All benchmark cases for the module pass |
| **certified** | Verified + catalog `verified` + validation quality ≥ 4 (manual promotion) |

Tiers are computed in `src/lib/qa/maturityGates.ts`.

## Automated test layers

| Layer | Command | Scope |
|-------|---------|--------|
| **Vitest** | `npm test` | Unit tests + externally sourced benchmarks (AISC, ISO 6336/281, VDI 2230, EN 13906, Shigley, Roark, FEM analytical) in `src/lib/**/*.test.ts` |
| **Verification workbook** | `npm run test:verification` | JSON cases in `src/data/verification/` via `benchmarkRunner.ts` |
| **Layout contract** | `npm run validate:layout` | All product pages use `CalculatorLayout` inputs/results |
| **Doc math** | `node scripts/test-normalize-math.mjs` | LaTeX normalization for `/documentation` |

## Verification cases

Add JSON under `src/data/verification/` (see `VerificationGuide.md`). Run:

```bash
npm run test:verification
```

**Verification runner modules** (`benchmarkRunner.ts`): `gears`, `columns`, `combined-loading`, `impact`, `fatigue`, `corrosion`, `suspension`, `rotation`, `compression-springs`, `timing-belts`, `bevel-gears`, `keys-splines`, `circular-plates`, `shafts`, `bearings`, `v-belts`, `pipes`.

**Vitest-only benchmarks** (not yet in JSON runner): beam/column code checks, ISO 6336, VDI 2230, bolt table, FEM analytical suites.

## Export / unit QA matrix

Documented in `src/lib/qa/exportUnitMatrix.ts` and shown on `/status`. Structured PDF export (`structuredReport.ts`) replaces screenshot capture. Update the matrix when you change export or `moduleUnitProfiles`.

## CI recommendation

```yaml
- run: npm test
- run: npm run test:verification
- run: npm run validate:layout
- run: npm run build
```

## Relation to other phases

- **Phase 0** — catalog & traceability (foundation for gates)
- **Phase 1** — code-aligned checks (benchmarks target US/EU/ISO where defined)
- **Phase 3** — monetization (do not mark **certified** until benchmarks pass)
- **Phase 5** — production deploy, accounts, operations
