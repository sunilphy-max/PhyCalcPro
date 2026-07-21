# PhyCalcPro — Modules Technical Reference

Engineering software manual for the **66 active product modules** shipped under `/products/*`. This document describes purpose, governing methods, design-code support, UI maturity, and known gaps. It complements the homogenization contract in [Homogenization-Roadmap.md](./Homogenization-Roadmap.md).

**Audience:** engineers evaluating PhyCalcPro for design work, and developers extending modules.

**Disclaimer:** All modules produce **indicative** results unless explicitly marked **beta** with implemented code checks. Nothing here replaces licensed professional review or official code compliance certification.

**Equations (authoring):** Use LaTeX in `\( … \)` for inline math and `\[ … \]` for display blocks (or `$ … $` / `$$ … $$`). The site converts these to KaTeX. Use `\frac{\partial^2 w}{\partial x^2}` for partial derivatives (slash shorthand is normalized at load time). List items like `- Torque: \(T = …\)` render as labeled display equations.

---

## Table of contents

1. [Platform architecture](#1-platform-architecture)
2. [Module inventory](#2-module-inventory)
3. [Module reference](#3-module-reference) — compiled from `docs/modules/*.md` at build time
4. [Maturity & numerical methods](#12-maturity--numerical-methods)
5. [Gaps & roadmap](#13-gaps--roadmap)

---

## 1. Platform architecture

### 1.1 Navigation and layout

- **Single products nav:** `src/app/products/layout.tsx` renders `ProductsCategoryBar` (category chip links on hub/landings; breadcrumb on modules). Category layouts are passthrough wrappers — browse at `/products/{categoryId}`.
- **Module chrome:** Each calculator page uses `CalculatorLayout` with a workspace under the products category bar:
  - **Inputs column** — parameters, mesh controls, calculate/save (`CalculatorInputPanel` where adopted).
  - **Results column** — plots, metric cards, engineering checks, export (`CalculatorResultsShell` / `ExportableReport`).
  - **Optional Design Summary rail** (`summary` prop) — persistent sticky checklist that can update live from inputs (bearings selection, plain bearings, housing).
- **Layout contract:** All product pages pass explicit `inputs` / `results` props to `CalculatorLayout`. The legacy `left` / `center` / `right` API is removed; `npm run validate:layout` enforces the contract in CI. Optional `summary` is allowed.
### 1.2 Calculation pipeline

Standard module contract (see homogenization roadmap):

```
page.tsx
  useStandardCalculation(moduleId, onRegionUnits?)   // or useCalculatorModule
  CalculatorLayout(moduleId, inputs, results)
  calculate → solver engine → wrapResult(output)
  *Results → ExportableReport(moduleId=…)
```

- **`wrapResult`** attaches a `CalculationSpec` with design-code checks via `withCalculationSpec`.
- **Specialized evaluators** (full check mapping): beams, columns, gears, combined-loading, welds.
- **Generic evaluator** (`evaluators/generic.ts`): all other catalogued modules — maps solver output fields (safety factor, utilization, life margin, fatigue SF, etc.) to catalog checks via `MODULE_FIELD_OVERRIDES`. Flagship modules with extended mappings: **shafts**, **bearings**, **compression-springs**, **extension-springs**, **torsion-springs**, **rivets**, **welds**.

### 1.3 Design codes

Global selector: **US / EU / ISO / Indicative** (`DesignCodeContext`).

| Code | Role |
|------|------|
| **Indicative** | Textbook / closed-form mechanics; always available. |
| **US** | AISC, ASME, AGMA, AWS, ASME Y14.5, etc. where catalogued. |
| **EU** | EN 1993, EN 13445, DIN, VDI references where catalogued. |
| **ISO** | ISO 281, ISO 6336, ISO 286, ISO 10816, etc. where catalogued. |

Changing design code sets **default units** via `useDesignCodeUnits` / `moduleProfiles.ts` (on code change, not every render). Field unit selectors still expose all units for the dimension unless `restrictToProfile` is set.

### 1.4 Units

- Field definitions: `src/lib/units/moduleProfiles.ts` (expansion modules profiled; legacy gaps remain for trusses, cost-estimator, cam-toolpaths).
- Preferred input widget: `CalculatorUnitField` + `calculatorNumberInputClass`.
- Metric display: `CalculatorMetricCard` / `formatEngineeringValue` for auto scientific notation when \(|v| \ge 1000\) or \(|v| < 0.01\).
- **Temperature:** affine conversions among °C, K, and °F (not a simple offset-only scale).

### 1.5 Export

`ExportableReport` with `moduleId` enables:

- **Structured PDF reports** via `src/lib/export/structuredReport.ts` — title block, optional **named `sections`** (Design Summary, ISO 281 / film / housing factors, arrangement, recommendation), curated inputs, metric results, engineering checks, formula steps, and embedded chart images (`collectChartImages` from Plotly). Flat `resultRows` remain supported for older modules. Excel mirrors section groups as extra sheets when present.
- CSV export from solver output.
- Quality checklist from `moduleQualityDefaults`.
- Engineering checks panel when `calculationSpec` is present.

Charts use `EngineeringPlot` with separate `yLabel`, `unitLabel`, `xLabel`, `xUnit` and `data-export-plot` for high-resolution capture.

### 1.6 Testing & verification

- **Vitest** (`npm test`) — unit tests and externally sourced benchmarks (Shigley, Roark, AISC, ISO 6336/281, VDI 2230, EN 13906, etc.) under `src/lib/**/**/*.test.ts`.
- **Verification CI** — `npm run test:verification` runs **38** JSON cases in `src/data/verification/` against **`moduleSolverRegistry.ts`** (64 solvers registered).
- **Bootstrap** — `npx tsx scripts/bootstrap-verification.ts` generates JSON from seeds in `verificationSeeds.ts`.
- **Engineer sign-off** — [validation-master-checklist.md](./validation-master-checklist.md) lists validation tasks for all 62 modules; springs also have [spring-modules-user-tasks.md](./modules/spring-modules-user-tasks.md).
- **FEM regression** — analytical comparisons for beam equilibrium, column buckling, and plate shear-locking in `src/lib/structural/__tests__/`.

**CI benchmark modules (38 JSON cases, 34 modules):** beams, bearings, bevel-gears, bolts, circular-plates, columns, combined-loading, compression-springs (×2), corrosion, extension-springs, fatigue, frames, gears, hydraulics, impact, internal-gears-rack (×2), keys-splines, pipes, plain-bearings (×2), power-screws (×2), rivets, rotation, shafts, shells, suspension, timing-belts, tolerance, torsion-springs, trusses, unit-converter, v-belts, vessels, vibrations, welds.

### 1.7 Release tiers

`CalculatorLayout` shows catalog `validationStatus` and a computed release tier from benchmark stats (`ReleaseTierBadge`). Solvers are registered for 61 modules; promote modules toward **verified** by adding JSON cases and completing the master validation checklist.

### 1.8 Design workflow layer

Every calculator page receives a shared **Auto-design / Validate / Compare** toolbar through `CalculatorLayout`.
Tab order is fixed: **Auto-design** (size from targets) → **Validate** (forward check) → **Compare** (ranked alternatives with Apply).
User-facing names and button labels live in `src/lib/design-workflows/workflowModeLabels.ts`; internal IDs remain `design`, `check`, and `select`.

The workflow registry (`src/lib/design-workflows/moduleDesignWorkflows.ts`) provides:

- required design inputs to define before sizing,
- automatic sizing targets,
- computed reference-design candidate comparisons,
- standard/catalog tables to consult,
- linked downstream modules,
- expert notes and explicit gaps.

The computed candidate engine (`src/lib/design-workflows/computedCandidates.ts`) supplies numerical
candidate rows for every active module family. These rows use best-available first-principles or
standard screening equations (for example beam stress/deflection, shaft von Mises stress,
Lewis gear bending, ISO 281 bearing life, spring shear stress, pressure hoop stress, pump-down
time, thermal conductance, coil field and battery cooling flow).

This is the platform layer needed for MITCalc-style worksheets. As of the full rollout:

- **`designModeRegistry.ts`** maps every module ID to a category design solver (catalog sweep, reverse sizing, or optimization screen).
- **`computedCandidates.ts`** calls the registry so the advisor shows live ranked candidates from page `userInputs`.
- **Calculate** branches on workflow mode: **Validate** runs the forward solver only; **Auto-design** applies the best registry candidate then re-runs validation; **Compare** ranks options without auto-apply (Apply in the advisor loads a row and switches to Validate).
- Shared helpers: `sweepCatalogForUtilization`, `materialCatalogService`, `scripts/scaffold-design-mode.mjs`.
- Full mode behavior: see [`docs/Design-Workflow-Reference.md`](Design-Workflow-Reference.md).

| Coverage type | Auto-design behavior |
|---------------|----------------------|
| **Solver-backed** | Real reverse/catalog solver; best candidate applied before validation (beams, columns, gears, shafts, pipes, …). |
| **Catalog-backed** | Ranks catalog entries (material-db, rolled-sections, bearings). |
| **Validate-only** | formula-reference, unit-converter — advisor registered; Auto-design does not resize (by design). |

**Count:** 61 modules with real design paths · 2 validate-only tools · 1 profiles page (section-from-required-I).

### 1.9 Persistence & cross-calculator handoff

- **Local projects** — `src/lib/localProjects.ts` saves inputs/results per module; `/projects` dashboard lists and reloads saved work.
- **Cloud sync** — optional Supabase workspace sync via `/api/workspaces/models` when authenticated.
- **Cross-calc handoff** — `crossCalcHandoff.ts` + `CrossCalcHandoffBanner` carry gear outputs → shaft sizing → bearing selection on linked pages.

---

## 2. Module inventory

| Category | Count | Module IDs |
|----------|------:|------------|
| Structural | 8 | beams, frames, trusses, columns, plates, combined-loading, circular-plates, shells |
| Power transmission | 4 | v-belts, timing-belts, roller-chains, multi-pulley |
| Machine | 13 | shafts, gears, internal-gears-rack, bearings, cams, flywheels, bevel-gears, worm-gears, planetary-gears, gear-ratio-design, plain-bearings, brakes-clutches, power-screws |
| Springs | 3 | compression-springs, extension-springs, torsion-springs |
| Connections | 6 | bolts, welds, rivets, keys-splines, shaft-hubs, pins |
| Materials | 8 | database, sections, rolled-sections, profiles, composites, temperature-properties, fatigue, corrosion |
| Pressure | 4 | pipes, vessels, hydraulics, heat-exchangers |
| Dynamics | 4 | vibrations, rotation, impact, suspension |
| Manufacturing | 4 | tolerance, fits, cost-estimator, cam-toolpaths |
| Advanced systems | 8 | vacuum-engineering, cryogenic-engineering, magnetic-fields, superconducting-systems, thermal-management, battery-ev-systems, hydrogen-systems, precision-motion |
| Tools | 4 | load-case-manager, safety-factor, formula-reference, unit-converter |
| **Total** | **66** | |

### Homogenization snapshot

| Aspect | Status |
|--------|--------|
| `CalculatorLayout` + `moduleId` | All 62 active pages |
| `useStandardCalculation` / `useCalculatorModule` | 62 / 62 |
| Unit profiles (`moduleProfiles.ts`) | All expansion modules + majority of legacy modules |
| Modern `inputs`/`results` or full `*Inputs`/`*Results` | **All 63 modules** (Tier 2 homogenization complete, 2026-06) |
| `CalculatorResultsShell` / metric cards | Universal on expansion modules; widespread elsewhere |
| Specialized code evaluators | 5 modules (beams, columns, gears, combined-loading, welds); **generic.ts** field mapping for shafts, bearings, all spring types, rivets, welds |
| Extracted from monolith (complete) | impact, corrosion, fatigue, combined-loading, suspension, load-case-manager, temperature-properties |

### Validation catalog status

| Status | Modules |
|--------|---------|
| **beta** | beams, columns, combined-loading, gears, welds |
| **draft** | cost-estimator, cam-toolpaths |
| **indicative** (default) | all others |

---

## 3. Module reference (source files)

Per-module documentation is authored in `docs/modules/{moduleId}.md` (63 files). Each file documents purpose, physics, governing equations, numerical method, inputs/outputs, design-code checks, assumptions, and numbered references. The web site compiles these into the full reference and per-module pages at `/documentation/modules/{moduleId}`.

Do **not** duplicate module write-ups in this file — edit the individual module files instead.



## 12. Maturity & numerical methods

From `src/data/moduleMaturity.ts`:

| Band | Count | Representative modules |
|------|------:|------------------------|
| **formula** | 48 | combined-loading, gears, bearings, welds, advanced systems, fits, tolerance, hydraulics, rotation, impact, … |
| **fem** | 9 | beams, frames, trusses, columns, plates, shafts, bolts, pipes, vessels |
| **advanced-numerics** | 5 | composites, fatigue, heat-exchangers, vibrations, suspension |

**Refactor risk (high):** beams, frames, shafts, bolts, pipes, vibrations, fatigue, composites — prioritize careful regression when homogenizing.

**Validation quality:** Most modules score 2–3/5; beams/columns/bolts/pipes/vessels slightly higher where benchmarks exist.

### Method legend

| Label | Meaning in PhyCalcPro |
|-------|----------------------|
| **FEM** | Mesh-based stiffness assembly + linear solve (beams, frames, shells, shafts, buckling, vibrations) |
| **Closed-form** | Direct algebraic evaluation from textbook formulas |
| **Empirical** | Code-style correlations, derating curves, or heuristic models |
| **Reference** | Lookup tables without numerical solve |

---

## 13. Gaps & roadmap

### 13.1 Homogenization (UI / contract) — **Tier 2 complete (2026-06)**

1. **Layout migration** — **Done.** All 62 product pages use `inputs` + `results` with `CalculatorInputPanel` and `CalculatorCalculateButton`; `validate:layout` blocks regressions.
2. **Results shell** — **Done** on expansion modules and majority of legacy modules (`CalculatorResultsShell`, `CalculatorMetricGrid`, `CalculatorMetricCard`, `formatEngineeringValue`).
3. **Solver-backed design mode** — Registry covers all modules; continue deepening reverse-sizing quality per module family.
4. **Unit profiles** — Add profiles for trusses, material-db, safety-factor, cost-estimator, cam-toolpaths; migrate remaining pages to `CalculatorUnitField`.
5. **Hook consolidation** — Prefer `useStandardCalculation` over ad hoc `useDesignCodeUnits` + manual `attach*CalculationSpec` (beams is the outlier).
6. **Export** — Structured PDF reports (`structuredReport.ts`) with chart capture; ensure plots use `EngineeringPlot` with `data-export-plot`.

### 13.2 MITCalc-style design depth

| Priority | Gap |
|----------|-----|
| Medium | Deepen reverse-sizing quality per module (tolerance stacks, weld groups, vessel nozzles). |
| Medium | Persist design **alternatives comparison** rows with weight/cost/availability scoring. |
| Medium | CAD/SVG/DXF export for geometry-producing modules. |
| Low | Expert coefficient auto-recommendations per standard clause. |

**Recently addressed (2026 gap remediation):** Standard/catalog tables; solver-backed design sweeps; `/projects` dashboard; cross-calc handoff; structured PDF reports; Vitest external benchmarks.

**Recently addressed (2026 Q3 module upgrades):**

- **Shafts** — 1D FEM, stepped/hollow geometry, bearing supports, Kt features, fatigue screening, FEA critical speed, bearing handoff; CI + `engine.test.ts`.
- **Bearings** — ISO 281 modified life, ISO 76 static check, speed margin, catalog ranking in design mode; CI + `engine.test.ts`.
- **Springs (all three)** — shared EN 13906 helpers, wire catalog (`springWireCatalog.ts`), fatigue screening (life class VL/LH/MH/HH), surge/buckling/hook factors, unified results UI, design sweeps; 5 CI cases + 18 Vitest tests.
- **Site-wide verification** — `moduleSolverRegistry.ts` (61 solvers), 24 JSON CI cases, [validation-master-checklist.md](./validation-master-checklist.md).

Dedicated evaluators: **beams, columns, gears, combined-loading, welds**. Additional standard checks attach via **generic.ts** on shafts, bearings, springs, rivets, welds, and bolts.

### 13.3 Design code depth

| Priority | Gap |
|----------|-----|
| Medium | Shafts: DIN 743 / AGMA fatigue checks as formal code checks |
| Medium | Tolerance/fits: expose full ISO 286 auto UI on all stack types |
| Low | Welds: eccentric weld group combined stress refinement |
| Low | Bolts: full multi-bolt VDI 2230 system (beyond elastic pattern sharing) |
| Low | Gears: scuffing and micropitting (ISO 6336-20/22) |

**Recently addressed (2026 remediation):** AISC 360 / EC3 beam shear + LTB + column inelastic curves; ISO 6336 gear worksheet; ISO 281 bearing life with catalog C; EN 13906 spring static + fatigue screening; VDI 2230 single-bolt mode; Basquin + Marin fatigue; graded material catalog.

### 13.4 Physics & solver scope

- **No module** provides full 3D solid FEA, nonlinear material, or contact — all "FEM" labels are reduced-order (beam, shell, truss, 1D shaft).
- **Load combinations / partial factors** are user responsibility (stated in catalog assumptions).
- **Fatigue, composites, suspension** need deeper physics before raising validation tier.
- **Draft modules** (cost-estimator, cam-toolpaths) should not be used for production decisions without explicit review.

### 13.5 Testing & release

- **34 modules** (38 JSON cases) have committed verification; **64** have solvers in `moduleSolverRegistry.ts`.
- Bootstrap new cases: `npx tsx scripts/bootstrap-verification.ts`.
- Engineer validation: [validation-master-checklist.md](./validation-master-checklist.md).
- Wire release tier gates to CI so **beta** modules require passing benchmarks before promotion.
- `npm run validate:layout` enforces no duplicate sidebars / DashboardLayout on product pages — keep in pre-build.

### 13.6 Documentation maintenance

When adding a module:

1. Register in `src/data/modules.ts` and `moduleStandardCatalog.ts`.
2. Add `moduleMaturity` entry and `moduleProfiles` fields.
3. Follow the page contract in [Homogenization-Roadmap.md](./Homogenization-Roadmap.md).
4. Add `docs/modules/{moduleId}.md` with all required sections; run `node scripts/audit-module-docs.mjs`.
5. Add verification JSON when the solver is stable; see [VerificationGuide.md](./VerificationGuide.md).

---

*Last updated: 2026-07 — reflects shaft/bearing/spring upgrades and site-wide verification registry.*
