# Auto-design / Validate / Compare Workflow Reference

Every PhyCalcPro calculator exposes three workflow modes in the header toolbar (via `CalculatorLayout`). They share one physics engine and one set of code checks; the mode controls **what happens when you click the primary action button**.

| Order | User-facing name | Internal ID | Primary button | Purpose |
|------:|------------------|-------------|----------------|---------|
| 1 | **Auto-design** | `design` | Auto-design | Size from targets: search catalog or reverse-solve, apply the best candidate, then run the full validation pass. |
| 2 | **Validate** | `check` | Calculate (or Validate) | Forward solve only — verify the geometry, loads, and material already in the form. No automatic sizing. |
| 3 | **Compare** | `select` | Compare options | Browse ranked sizing candidates in the Design Advisor; **Apply** loads one row into the form (switches to Validate). |

Internal IDs (`design`, `check`, `select`) are stable in code and persisted project state. User-facing copy always uses **Auto-design**, **Validate**, and **Compare**.

---

## When to use each mode

### Auto-design (first tab)

Use when you know **what the design must achieve** (power, load, deflection limit, safety factor, life, envelope) but not the exact size.

**On Calculate (Auto-design):**

1. Live page inputs and design targets merge into `ModuleUserInputs`.
2. `runModuleDesignMode(moduleId, userInputs)` runs the category design solver or catalog sweep.
3. The best-ranked candidate’s fields are applied to the form (`applyDesignCandidate` / page setters).
4. The module’s forward check solver runs on the updated geometry.
5. Results, charts, and code checks reflect the sized design.

**Examples:**

- Beams: find the lightest rolled section that meets stress and deflection targets.
- V-belts: pick belt section, pulley diameters, and belt count from power and speed ratio.
- Bearings: rank ISO deep-groove series for required L10 life.
- Compression springs: sweep wire diameter and active coils within an OD envelope.

### Validate (second tab)

Use when you **already have a design** — known section, diameter, belt size, or geometry — and want pass/fail, utilization, plots, and code worksheets.

**On Calculate (Validate):**

- No catalog sweep or reverse sizing.
- The forward solver runs on current form values only.

This is the default mode when opening a module without a saved project preference.

### Compare (third tab)

Use when you want to **see alternatives side by side** before committing to one size.

**On Calculate (Compare options):**

- Runs the same candidate ranking as Auto-design but **does not** auto-apply the best row.
- Open **Sizing candidates & reference** in the advisor panel.
- Click **Apply** on a row → fields load into the form and mode switches to **Validate**.
- Run **Validate** again for a full detailed check of the chosen option.

**Examples:**

- Beams: compare W8×31 vs W10×22 vs W12×26 utilization before picking one.
- Material database: rank grades by allowable stress; Apply sets material and E in the browse view.
- Gears: review tooth-count / module combinations before locking geometry.

---

## UI components

| Piece | Location | Role |
|-------|----------|------|
| Mode labels & order | `src/lib/design-workflows/workflowModeLabels.ts` | Single source of truth for tab order, descriptions, button labels |
| Mode state | `src/contexts/DesignWorkflowContext.tsx` | `mode`, `userInputs`, `designTargets`, `applyDesignCandidate` |
| Mode toggle | `src/components/design-workflows/DesignModeToggle.tsx` | Three-tab selector (Auto-design → Validate → Compare) |
| Mode help | `src/components/design-workflows/WorkflowModeHelp.tsx` | Step-by-step instructions per mode |
| Design targets | `src/components/design-workflows/DesignTargetFields.tsx` | Editable targets in Auto-design and Compare |
| Advisor panel | `src/components/design-workflows/ModuleDesignAdvisor.tsx` | Live candidates, Apply (Compare), linked modules |
| Per-module metadata | `src/lib/design-workflows/moduleDesignWorkflows.ts` | Design inputs, expert notes, maturity, linked workflows |
| Design router | `src/lib/design-workflows/designModeRegistry.ts` → `runModuleDesignMode()` | Maps module ID → category solver |
| Live candidates | `src/lib/design-workflows/computedCandidates.ts` | Ranked rows from live `userInputs` |

---

## Page integration pattern

Most modules follow this pattern:

1. Build `designUserInputs` from live form state (SI base units).
2. `useSyncDesignInputs(moduleId, designUserInputs)` — feeds the advisor.
3. `useApplyDesignFields({ field: setter, … })` + `useRegisterApplyDesignCandidate`.
4. On **Calculate**, branch on `workflowMode === "design"` → `runModuleDesignMode` → apply `best.fields` → run forward solver.

`useModuleDesignCalculate` wraps steps 2–4 for pages that opt in.

All solver-backed modules should use `runModuleDesignMode` on Calculate so **Auto-design** and **Compare** share the same ranked candidate table.

---

## Maturity levels

Each module declares a maturity in `moduleDesignWorkflows.ts`. This controls advisor messaging, not whether Validate works.

| Level | Auto-design behavior | Compare behavior |
|-------|----------------------|------------------|
| `solver-backed` | Real reverse/catalog solver; best candidate applied before validation (beams, columns, gears, shafts, v-belts, welds, timing-belts, fatigue, combined-loading, bearings, …). | Same ranked table; Apply loads a row; no auto-apply on Calculate. |
| `catalog-backed` | Ranks catalog entries (sections, materials) against targets. | Apply sets catalog selection into the form. |
| `workflow` | Advisor and targets wired; indicative/reference strategy until a dedicated reverse solver lands (e.g. some advanced-systems, cost-estimator). | Reference candidate table; Apply when fields are available. |

**Validate-only tools:** `unit-converter` registers the workflow UI for consistency; Auto-design does not resize (by design).

**Fleet audit (physics + design depth):** [Module-Physics-Design-Audit.md](./Module-Physics-Design-Audit.md) — maturity, design quality, verification coverage, and apply-field unit contracts.

---

## Category behavior (solver-backed highlights)

### Structural

| Module | Validate | Auto-design / Compare |
|--------|----------|------------------------|
| beams | FEM beam solver + code checks | Rolled-section search for stress and deflection targets |
| columns | Buckling check | Catalog column ranking for target safety factor |
| plates, circular-plates | Plate bending | Thickness sweeps (circular: deflection + stress) |
| trusses, frames | Equilibrium | Member size screening |
| combined-loading | Von Mises combination | Solid round diameter sweep |

### Machine

| Module | Validate | Auto-design / Compare |
|--------|----------|------------------------|
| gears | Lewis + contact | Tooth-count sweep, module / face-width sweep |
| shafts | FEM shaft stress, fatigue, critical speed | Standard diameter sweep from live loads; fatigue handoff |
| bearings | ISO 281 basic + modified life, ISO 76 static, speed margin | Catalog ranking by utilization; shaft handoff |
| bevel / worm / planetary | Module engines | Ratio and geometry sweeps |
| flywheels, cams, brakes-clutches | Module engines | Inertia / profile / torque sweeps |

### Power transmission

| Module | Validate | Auto-design / Compare |
|--------|----------|------------------------|
| v-belts | Power capacity, tensions, shaft loads | Belt section and pulley sweep from application + SF |
| timing-belts | Tension and rating | Pitch × teeth × width power sweep |
| roller-chains | Tension and rating | Pitch / strand sweeps |
| multi-pulley | Layout equilibrium | Pulley diameter screening |

### Springs

| Module | Validate | Auto-design / Compare |
|--------|----------|------------------------|
| compression-springs | Wahl shear, buckling, surge, optional EN 13906 fatigue | Wire + coil sweep from `springWireCatalog`; max OD envelope |
| extension-springs | Body + hook SF, Fi limit, surge, optional fatigue | Wire/coil sweep for rate, hook SF, fatigue margin |
| torsion-springs | Bending SF with curvature factor Kb, optional fatigue | Wire/coil/leg sweep for target rate (N·m/rad) |

All three support wire stock picker, saved projects, fatigue module handoff, and CI verification JSON.

### Fasteners

| Module | Validate | Auto-design / Compare |
|--------|----------|------------------------|
| bolts, welds, pins | Joint capacity | Diameter / pattern / weld size sweeps |
| keys-splines, shaft-hubs | Shear and bearing | Key size screening |

### Materials

| Module | Validate | Auto-design / Compare |
|--------|----------|------------------------|
| material-db | Browse catalog | Rank by allowable stress; Apply sets material + E |
| fatigue, corrosion, composites | Module engines | Life, allowance, ply-count sweeps |

### Pressure, dynamics, manufacturing

Same three-mode pattern: Validate = forward check; Auto-design = thickness/diameter/stiffness sweeps; Compare = ranked alternatives with Apply.

### Advanced systems (all eight)

`AdvancedSystemCalculator` uses `buildAdvancedUserInputs` + `runModuleDesignMode` — e.g. pump speed for vacuum, turns for solenoid field, operating current for superconducting energy margin. Auto-design applies fields onto the live form before re-solving.

---

## Input contract

Live page state maps to `ModuleUserInputs` (`src/lib/design-workflows/userInputs.ts`). Common keys:

- Stress / force targets: `allowableStressPa`, `maxForce`, `targetSafetyFactor`
- Geometry: `length`, `diameter`, `inertia`, `deflectionLimit`
- Advanced: `formValues` — full calculator snapshot for advanced-systems modules

Design targets from the toolbar merge into `userInputs` for advisor and solver calls.

---

## Cross-module handoff

`ModuleDesignAdvisor` renders **Continue workflow** links from `linkedWorkflowModuleIds`. Canonical **power-train chain**:

**motor** → **v-belts** → **multi-pulley** (optional) → **shafts** → **bearings** → **keys-splines** → **housing** → **bolts** → **frames**

| Edge | Published params (SI) |
|------|----------------------|
| motor → v-belts | power (kW), speed (rpm), serviceFactor |
| multi-pulley → v-belts | diameterDriver, diameterDriven, centerDistance |
| v-belts → shafts | torque, radialForce, speed |
| v-belts → bearings | radialLoad, speed |
| shafts → keys-splines | torque, shaftDiameter |
| shafts → bearings | radialLoad, axialLoad, speed |
| bearings → housing | boreMm, radialLoad, axialLoad, speed |
| housing → bolts | tension, shear, boltCount, patternDiameter |
| bolts → frames | reactionForce |

Implementation: `publishHandoff` in [`crossCalcHandoff.ts`](../src/lib/design-workflows/crossCalcHandoff.ts); param registry in [`handoffParamRegistry.ts`](../src/lib/design-workflows/handoffParamRegistry.ts). Target pages show **Apply to inputs** via `CrossCalcHandoffBanner`. Assembly workflow auto-applies when navigating from the power-train stepper.

Other machine chains:

- **gears** → gear-ratio-design, shafts, bearings, keys-splines
- **shafts** → keys-splines, bearings, housing, gears, fatigue

---

## Gaps and planned depth

- **Tools**: No sizing candidates by design (Validate + advisor context only).
- **Cross-module handoff**: Full power-train chain wired; assembly stepper tracks progress across modules.
- **Workflow maturity**: Residual `workflow` modules are mostly advanced-systems screening and manufacturing cost/toolpath helpers — see [Module-Physics-Design-Audit.md](./Module-Physics-Design-Audit.md).
- **Registry**: Catalog category `bearings` must route to `designMachineModule` (fixed 2026-07-19).

---

## Verification

- `npm run validate:layout` — product page layout rules
- `npm run build` — type and layout checks
- `npm run test:verification` — physics benchmarks (24 JSON cases; 61 solvers registered)
- [validation-master-checklist.md](./validation-master-checklist.md) — engineer sign-off per module
- Manual: toggle **Auto-design → Validate → Compare**; confirm Auto-design applies best candidate; Compare **Apply** updates form and switches to Validate.
