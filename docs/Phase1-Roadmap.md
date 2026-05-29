# Phase 1 — Code-aligned calculations

Phase 0 provides the **standards catalog, UI, and traceability**. Phase 1 adds **solvers and checks that follow US / EU / ISO practice** (beta, then verified with your workbook).

## Goals

| Goal | Done when |
|------|-----------|
| Code-specific checks produce **pass / warning / fail** (not only Indicative) | Per module, per code |
| **Method text** names the code article (e.g. AISC Ch. F, ISO 6336-3) | In `calculationSpec.method` |
| Catalog `implementation` flags match reality | `implemented` vs `planned` |
| Your benchmarks in `docs/PhyCalcPro_Verification_Template.xlsx` pass | CI + manual sign-off |

## Rollout waves

### Wave 1 (in codebase now) — Flagship pilots

| Module | US | EU | ISO | Notes |
|--------|----|----|-----|--------|
| **Beams** | AISC 360 ASD-style flexure & shear; L/360 deflection | EN 1993-1-1 σ/σ_Rd (γ_M0) | Same as EU (EN steel basis) | FEM unchanged; **capacity** from code factors |
| **Gears** | AGMA 2101-style allowable stress ratios | DIN 3990 / ISO 6336-style limits | ISO 6336-style limits | Lewis / Hertz **geometry** unchanged; **allowables** from code |
| **Columns** | AISC Ch. E buckling utilization | EN 1993-1-1 buckling utilization | ISO basis via EN factors | Uses FEA P_cr |

Still **not available** in Wave 1: LTB (beams), scuffing / micropitting (gears), full load combinations.

### Wave 2 — Structural & fasteners

Combined loading, columns (inelastic), plates, frames/trusses, bolts (EN 1993-1-8 / VDI 2230 shell), welds (AWS D1.1).

### Wave 3 — Pressure, dynamics, materials

Vessels (ASME VIII), pipes, fatigue (SN), hydraulics, vibrations.

### Wave 4 — Remaining modules + hardening

Manufacturing, profiles, database; equation appendix in exports; `npm run test:verification` runs solvers.

## Important assumptions (Wave 1)

1. **Loads you enter are taken as strength-level** unless we add load-combination UI later (you may pre-multiply by 1.2D+1.6L etc.).
2. **Simplified allowables** — documented in each module’s `limitations`; not a substitute for AGMA/AISC software.
3. **β (beta)** validation status until your Excel benchmarks pass.

## Your role

Same as Phase 0: run cases on the site under **US / EU / ISO**, compare to your standard worksheets, update the verification workbook. We flip checks from `planned` → `implemented` and tighten formulas from your feedback.

## Regenerate verification template

```bash
npm run generate:verification-template
```
