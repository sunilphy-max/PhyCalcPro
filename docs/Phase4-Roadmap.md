# Phase 4 — QA, maturity gates, and continuous verification

Phase 4 keeps PhyCalcPro trustworthy over time: **benchmarks in CI**, **release tiers** per module, and a visible **quality dashboard**.

## Goals

| Goal | Mechanism |
|------|-----------|
| Regressions caught before deploy | `npm run test:verification` |
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

## Verification cases

Add JSON under `src/data/verification/` (see `README.md`). Run:

```bash
npm run test:verification
```

Supported automated modules today: `gears`, `columns`, `combined-loading`, `impact`, `fatigue`, `corrosion`, `suspension`, `rotation`, `bolts` (extend in `benchmarkRunner.ts`).

## Export / unit QA matrix

Documented in `src/lib/qa/exportUnitMatrix.ts` and shown on `/status`. Update when you change export or `moduleUnitProfiles`.

## CI recommendation

```yaml
- run: npm run test:verification
- run: npm run build
```

## Relation to other phases

- **Phase 0** — catalog & traceability (foundation for gates)
- **Phase 1** — code-aligned checks (benchmarks target US/EU/ISO where defined)
- **Phase 3** — monetization (do not mark **certified** until benchmarks pass)
