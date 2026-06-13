# Phase 1 — Code-aligned calculations

Phase 0 provides the **standards catalog, UI, and traceability**. Phase 1 adds **solvers and checks that follow US / EU / ISO practice** (beta, then verified with your workbook).

## Goals

| Goal | Done when |
|------|-----------|
| Code-specific checks produce **pass / warning / fail** (not only Indicative) | Per module, per code |
| **Method text** names the code article (e.g. AISC Ch. F, ISO 6336-3) | In `calculationSpec.method` |
| Catalog `implementation` flags match reality | `implemented` vs `planned` |
| Your benchmarks in `docs/PhyCalcPro_Verification_Template.xlsx` pass | CI + manual sign-off |

## Status (2026-06 gap remediation)

| Area | Status |
|------|--------|
| **Beams** | AISC 360 Ch. F/G flexure, shear, LTB screening; EN 1993-1-1 §6.2 |
| **Columns** | AISC 360 Ch. E elastic + E3 inelastic; EN 1993-1-1 §6.3 |
| **Gears** | ISO 6336 bending + contact worksheet (`iso6336.ts`) |
| **Bearings** | ISO 281 life with catalog C, ball/roller exponents, a1 |
| **Springs** | EN 13906-1 shear, buckling screen, τ_zul = 0.56·Rm |
| **Bolts** | VDI 2230-1 single-bolt worksheet mode + bolt table M3–M64 |
| **Fatigue** | Basquin S–N + Marin factors; Goodman / Gerber / Morrow selector |
| **Combined loading / welds** | Dedicated evaluators (Wave 2 pilots, β) |

Vitest benchmarks (`npm test`) cover solvers against Shigley, Roark, AISC, ISO, VDI, and EN references. JSON workbook cases (`npm run test:verification`) remain the path to **verified** tier.

## Rollout waves

### Wave 1 — Flagship pilots (**implemented**)

| Module | US | EU | ISO | Notes |
|--------|----|----|-----|--------|
| **Beams** | AISC 360 Ch. F/G flexure, shear, LTB screening; serviceability | EN 1993-1-1 §6.2.5–6.2.8 | EN steel basis | FEM unchanged; checks from `buildBeamCodeChecks` |
| **Gears** | AGMA 2101-style + Lewis geometry | DIN 3990 / ISO 6336 | ISO 6336-2/3 worksheet | Contact + bending safety factors |
| **Columns** | AISC Ch. E + E3 inelastic curves | EN 1993-1-1 §6.3 | ISO basis via EN factors | FEA P_cr + code utilization |

**Still planned:** full LTB refinement (beams), scuffing / micropitting (gears), load-combination UI.

### Wave 2 — Structural & fasteners (**partial**)

| Module | Status |
|--------|--------|
| Combined loading | Von Mises evaluator (β) |
| Welds | AWS D1.1 / EN throat stress (β) |
| Columns inelastic | **Done** — AISC E3 / EC3 |
| Bolts | **Done** — VDI 2230-1 worksheet; EN 1993-1-8 indicative in power-screw mode |
| Plates / frames / trusses | Indicative checks; FEM analytical tests added |

### Wave 3 — Pressure, dynamics, materials (**partial**)

| Module | Status |
|--------|--------|
| Fatigue | **Done** — Basquin + Marin; mean-stress selector |
| Pipes / vessels / hydraulics | Indicative; pipes in verification runner |
| Vibrations | Indicative FEM screening |

### Wave 4 — Platform hardening (**partial**)

| Deliverable | Status |
|-------------|--------|
| Structured PDF reports | **Done** — `structuredReport.ts` |
| Vitest unit + external benchmarks | **Done** — `npm test` (95 tests) |
| Parts catalogs (bolts, bearings, springs, gears) | **Done** |
| `/projects` save + cross-calc handoff | **Done** |
| Equation appendix in every export | Partial — formulas section in structured PDF |

## Important assumptions

1. **Loads you enter are taken as strength-level** unless we add load-combination UI later (you may pre-multiply by 1.2D+1.6L etc.).
2. **Simplified allowables** — documented in each module’s `limitations`; not a substitute for AGMA/AISC software.
3. **β (beta)** validation status until your Excel benchmarks pass.

## Your role

Run cases on the site under **US / EU / ISO**, compare to your standard worksheets, update the verification workbook. We flip checks from `planned` → `implemented` and tighten formulas from your feedback.

## Commands

```bash
npm test                              # Vitest — solvers + code-check benchmarks
npm run test:verification             # JSON workbook cases
npm run generate:verification-template
```
