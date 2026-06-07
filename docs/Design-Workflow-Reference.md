# Design / Check / Select Workflow Reference

PhyCalcPro modules expose three workflow modes via the design toolbar on each calculator page:

| Mode | Purpose |
|------|---------|
| **Check** | Verify the current inputs against physics and code checks. No auto-sizing. |
| **Design** | Run the module design solver on **Calculate**; apply the best-ranked candidate fields to the form, then solve. |
| **Select** | Browse ranked candidates in the Design Advisor panel; **Apply** loads a candidate via `useRegisterApplyDesignCandidate`. |

## Architecture

| Piece | Location |
|-------|----------|
| Mode state | `src/contexts/DesignWorkflowContext.tsx` |
| Per-module metadata | `src/lib/design-workflows/moduleDesignWorkflows.ts` |
| Design router | `src/lib/design-workflows/designModeRegistry.ts` → `runModuleDesignMode()` |
| Category solvers | `src/lib/design-workflows/solvers/*.ts` |
| Live advisor candidates | `src/lib/design-workflows/computedCandidates.ts` |
| Page hooks | `useSyncDesignInputs`, `useRegisterApplyDesignCandidate`, `useModuleDesignCalculate` |

### Page integration pattern

Most modules follow the pins pattern:

1. Build `designUserInputs` from live form state (SI base units).
2. `useSyncDesignInputs(moduleId, designUserInputs)` — feeds the advisor.
3. `useApplyDesignFields({ field: setter, ... })` + `useRegisterApplyDesignCandidate`.
4. On **Calculate**, branch on `workflowMode === "design"` → `runModuleDesignMode` → apply `best.fields` → run check solver.

All solver-backed modules should use `runModuleDesignMode` on Calculate (including compression-springs) so Design and Select share the same ranked candidates.

## Maturity levels

| Level | Meaning |
|-------|---------|
| `solver-backed` | Design sweep uses the module engine or a dedicated design solver with real utilization. |
| `catalog-backed` | Design ranks catalog entries (sections, bearings, materials) against targets. |
| `workflow` | Design advisor and targets are wired; sizing uses indicative sweeps or linked assumptions. |

## Category behavior

### Structural

| Module | Check | Design / Select |
|--------|-------|-----------------|
| beams | FEM beam solver + code checks | Rolled-section search (`searchBeamSections`) for stress and deflection targets |
| columns | Buckling check | Catalog column ranking for target safety factor |
| plates, circular-plates | Plate bending | Geometry / thickness sweeps for moment and deflection |
| trusses, frames | Truss/frame equilibrium | Member size screening |
| combined-loading, load-case-manager | Superposition checks | Load-factor and case sweeps |

### Machine

| Module | Check | Design / Select |
|--------|-------|-----------------|
| gears | Lewis bending + contact | Pinion tooth-count sweep, then module / face-width sweep (live power, speed, ratio) |
| shafts | FEM shaft stress | Standard diameter sweep using live `shaftLoads` (or torque + bending defaults) |
| bearings | ISO 281 life | Deep-groove series ranking (6205–6210, 6307–6312) |
| bevel / worm / planetary gears | Module-specific engines | Ratio and geometry sweeps |
| flywheels, cams, brakes-clutches | Module engines | Inertia / profile / torque sweeps |
| plain-bearings | PV and wear | Bearing material and dimension screening |

### Power transmission

| Module | Check | Design / Select |
|--------|-------|-----------------|
| v-belts | Power capacity | A/B/SPA/SPB section sweep |
| timing-belts, roller-chains | Tension and rating | Pitch / width / strand sweeps |
| multi-pulley | Layout equilibrium | Pulley diameter and wrap screening |

### Springs

| Module | Check | Design / Select |
|--------|-------|-----------------|
| compression-springs | Wahl shear stress | Wire diameter + active coil sweep via `runModuleDesignMode`; **Select Apply** wired |
| extension-springs, torsion-springs | Module engines | Wire and coil sweeps |

### Fasteners

| Module | Check | Design / Select |
|--------|-------|-----------------|
| bolts, welds, pins | Joint capacity | Diameter / pattern / weld size sweeps |
| keys-splines, shaft-hubs | Shear and bearing | Key size and fit screening |
| safety-factor | Combined margin | Target SF sweeps |

### Materials

| Module | Check | Design / Select |
|--------|-------|-----------------|
| **material-db** | Browse catalog | Rank by `allowableStressPa`; Apply sets highlighted material + E |
| sections, rolled-sections | Area properties | Inertia / rolled-section search |
| fatigue, corrosion, composites, temperature-properties | Module engines | Life, allowance, ply-count, derating sweeps |

### Pressure

| Module | Check | Design / Select |
|--------|-------|-----------------|
| vessels, pipes, hydraulics, heat-exchangers | ASME/EN-style checks | Thickness and diameter sweeps |

### Dynamics

| Module | Check | Design / Select |
|--------|-------|-----------------|
| vibrations, impact, suspension | Modal / shock / ride | Stiffness, damping, and geometry sweeps |

### Manufacturing

| Module | Check | Design / Select |
|--------|-------|-----------------|
| fits, tolerance, cost-estimator | Stack and cost models | Tolerance class and process sweeps |

### Advanced systems (solver-backed)

All eight advanced calculators use `AdvancedSystemCalculator` with `buildAdvancedUserInputs` + `runModuleDesignMode`:

| Module | Design sweep |
|--------|----------------|
| thermal-management | Convection coefficient `h` for heat-rejection capacity |
| vacuum-engineering | Pump speed classes for pump-down time target |
| cryogenic-engineering | Effective emissivity / MLI layers for heat-leak limit |
| magnetic-fields | Turn count for solenoid field target |
| battery-ev-systems | Coolant ΔT for ohmic heat rejection |
| hydrogen-systems | Orifice area for relief mass flow |
| precision-motion | Flexure length for stiffness / deflection limit |
| superconducting-systems | Operating current for stored energy and Ic margin |

Design applies fields directly onto the live calculator form (`pumpSpeed`, `turns`, `operatingCurrent`, etc.) before re-solving.

### Tools

| Module | Check | Design / Select |
|--------|-------|-----------------|
| unit-converter, formula-reference | Conversion / lookup | Advisor context only; no auto-sizing candidates |

### Profiles (`/products/profiles`)

Section property calculator with rolled-section design via `designProfilesSection`.

## Input contract

Live page state is mapped to `ModuleUserInputs` (`src/lib/design-workflows/userInputs.ts`). Common keys:

- Stress / force targets: `allowableStressPa`, `maxForce`, `targetSafetyFactor`
- Geometry: `length`, `diameter`, `inertia`, `deflectionLimit`
- Advanced: `formValues` — full calculator snapshot for advanced-systems modules

Design targets from the toolbar merge into `userInputs` for advisor and solver calls.

## Cross-module handoff

`ModuleDesignAdvisor` renders **Continue workflow** links from each module’s `linkedWorkflowModuleIds` in `moduleDesignWorkflows.ts`. Example machine chain:

- **gears** → gear-ratio-design, shafts, bearings, keys-splines
- **shafts** → keys-splines, bearings, gears, fatigue
- **bearings** → shafts, plain-bearings, fatigue

Links are clickable routes to the next calculator in the chain (manual handoff; no automatic load transfer yet).

## Gaps and planned depth

- **Tools**: No sizing candidates by design.
- **Cross-module handoff**: Links are wired; automatic torque/load propagation gear → shaft → bearing is planned.
- **Code evaluators**: Some modules use generic checks; specialized code paths are expanding per `moduleCatalog.ts`.

## Verification

- `npm run build` — layout and type checks
- `npm run test:verification` — physics benchmarks including gears, columns, springs, shafts, v-belts, bearings, pipes
- Manual: toggle Check → Design → Select on a module; confirm Calculate applies best candidate and advisor Apply updates the form.
