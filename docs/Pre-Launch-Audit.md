# PhyCalcPro — Pre-Launch Audit

**Date:** 2026-06-07  
**Scope:** UI/theme consistency, formatting, physics/solvers, Auto-design/Validate/Compare, clutter, launch readiness  
**Environment tested:** `NEXT_PUBLIC_FREE_LAUNCH=true` (`.env.local`), Windows, Node build pipeline  
**Full module audit:** [`docs/Website-Module-Audit.md`](Website-Module-Audit.md) — 63 modules, homogenization complete (2026-06-07)

---

## Verdict: **Launch ready**

Post-improvement pass (2026-06-07): complete website module audit and homogenization — all 62 modules use `CalculatorInputPanel` + `CalculatorCalculateButton` inputs and `CalculatorResultsShell` results; 4 remaining legacy `center={}` layouts removed; layout validator extended. See `docs/Website-Module-Audit.md`.

## Previous verdict: **Launch with caveats**

PhyCalcPro is **deployable today** for a free early-access launch: production build passes, layout validation passes, and automated verification benchmarks are green (13/13). Monetization UI is correctly gated under free launch. Auto-design / Validate / Compare is wired on all calculator pages; machine solvers (gear tooth sweep, expanded bearing catalog, live shaft loads) and cross-module advisor links are complete. Remaining work is **homogenization polish** on workflow-scaffold modules—not launch blockers for an indicative engineering workspace.

---

## Passed checks

| Area | Result |
|------|--------|
| `npm run validate:layout` | Pass — no duplicate sidebars, no `DashboardLayout` on product pages, no legacy inline metric blocks in `*Results.tsx` |
| `npm run build` | Pass — 153 static routes, TypeScript clean |
| `npm run test:verification` | **13/13 pass** — gears, columns, combined-loading, compression-springs, timing-belts, bevel-gears, keys-splines, circular-plates, fatigue, shafts, v-belts, bearings, pipes |
| Module count | **62 active modules** — matches `docs/Modules-Technical-Reference.md` |
| Single products nav (icon rail + overlay) | `src/app/products/layout.tsx` only |
| Free launch gating | Navbar hides Pricing/Account; `PlanBadge` hidden; `/pricing` redirects; `allFeaturesUnlocked()` true |
| Design workflow | **Complete** — all 62 modules registered; `useSyncDesignInputs` + `useRegisterApplyDesignCandidate` on every calculator page (including advanced-systems via `AdvancedSystemCalculator`, compression-springs via `runModuleDesignMode`) |
| Solver-backed design (spot-check) | **Gears** — pinion tooth-count sweep then module sweep; **Shafts** — live `shaftLoads` diameter sweep; **Bearings** — 6205–6210 / 6307–6312 catalog; **V-belts** — section sweep; **material-db** — catalog ranking |
| Cross-module handoff | `ModuleDesignAdvisor` **Continue workflow** links from `linkedWorkflowModuleIds` (gear → shaft → bearing chain clickable) |
| Export shell | All catalog `*Results.tsx` use `CalculatorResultsShell` (validator enforced) |
| Advanced systems (8) | Shared `AdvancedSystemCalculator` — `CalculatorUnitField`, `formatEngineeringValue`, unified inputs/results |
| Documentation | KaTeX via remark/rehype on module docs; 63 SSG module doc routes |

---

## Issues fixed in this session

### Launch blockers (resumed audit — 2026-06-06)

1. **Build failure — `ModuleDesignAdvisor.tsx`** — Incomplete header JSX (missing `</div>` closures after copy trim) caused Turbopack parse error and blocked `npm run build`. Restored closing tags and maturity badge span.
2. **Results formatting — combined-loading** — Migrated `CombinedLoadingResults.tsx` from hand-rolled `Metric` + `bg-slate-900` status card to `CalculatorMetricGrid` + `CalculatorMetricCard` + `formatEngineeringValue` (verified benchmark module).

### Improvements pass (2026-06-06)

8. **Layout homogenization** — Migrated **42** product pages from `left`/`center`/`right` to `inputs`/`results` (`scripts/migrate-legacy-layout.mjs`).
9. **Design Apply wiring** — **34** pages now use `useApplyDesignFields` so Select-mode Apply loads candidate geometry (`scripts/wire-apply-design-fields.mjs`).
10. **Shared utilities** — `useApplyDesignFields`, `applyDesignFieldValues` for consistent candidate application.
11. **Hydraulics results** — `HydraulicsResults.tsx` migrated to `CalculatorMetricGrid` + `formatDisplayNumber`.
12. **Clutter** — Removed unused `CalculatorGuidancePanel` imports from migrated pages.

### Improvements pass 2 (2026-06-06)

13. **Results homogenization** — Migrated legacy `<dl>` / `toFixed` panels to `CalculatorMetricGrid` + `CalculatorMetricCard` + `formatEngineeringValue`: welds, rivets, safety-factor, load-case-manager, corrosion, rotation, heat-exchangers, cost-estimator, suspension.
14. **Bearing inputs** — `BearingInputs.tsx` now uses `CalculatorInputPanel`, `CalculatorUnitField`, and `CalculatorCalculateButton`.
15. **Rolled section catalog** — `RolledSectionPicker` wired to **frames** and **trusses** (area / inertia auto-fill from catalog).

### Prior session (same day)

3. **Layout migration (structure)** — Migrated to explicit `inputs` / `results` props:
   - `src/app/products/machine/bearings/page.tsx` (removed orphan guidance column)
   - `src/app/products/machine/gears/page.tsx`
   - `src/app/products/structural/columns/page.tsx`
4. **Results formatting** — Replaced custom `<dl>` summary blocks with `CalculatorMetricGrid` + `CalculatorMetricCard` + `formatDisplayNumber`:
   - `src/components/machine/gears/GearResults.tsx`
   - `src/components/machine/bearings/BearingResults.tsx`
5. **Clutter trim** — Shortened `ModuleDesignAdvisor` copy; removed duplicate design-target bullet lists; renamed expert section to “Expert notes”
6. **Homepage copy** — “active calculators” → “engineering modules” (`src/app/page.tsx`)
7. **Launch banner copy** — Free-launch banner now says “engineering modules” (`ValidationModeBanner.tsx`)

---

## Remaining issues (prioritized)

### P1 — Homogenization — **Tier 2 complete (2026-06-06)**

| Issue | Status | Notes |
|-------|--------|-------|
| Legacy `left` / `center` / `right` API | **Done** | All product pages use `inputs`/`results` (4 stragglers fixed 2026-06-07; validator enforces) |
| Custom results summaries | **Done** | All `*Results.tsx` use `CalculatorMetricCard` + `formatEngineeringValue` (table coordinate cells may use fixed decimals) |
| Results dashboards | **Done** | Shaft, buckling, profiles, screws dashboards migrated |
| Truss / frame inputs | **Done** | `CalculatorInputPanel` + `CalculatorUnitField` + `CalculatorCalculateButton` |
| Profiles layout | **Done** | `inputs` prop wired; legacy three-column layout removed |
| Remaining raw inputs | **Done** | `ProfilesInputs` shape dimension fields use `CalculatorUnitField` |

### P2 — Auto-design depth

| Issue | Modules | Notes |
|-------|---------|-------|
| Workflow scaffold only | ~40 modules with `maturity: "workflow"` | Mode toggle + advisor visible; Calculate label changes; **solver not invoked** on Design — expected until solver integration |
| Inline vs panel design targets | beams, columns, compression-springs, v-belts use inline fields; others use `DesignTargetFields` | Documented in `designInputFieldRegistry.ts`; no bug |
| Compare Apply | `useApplyDesignFields` on 34+ pages | Remaining pages use registry fields matching local state names |

### P3 — Physics & verification

| Issue | Notes |
|-------|-------|
| Benchmark coverage | **17 module IDs** in automated CI (`supportedBenchmarkModules`) | Includes shafts, v-belts, bearings, pipes (2026-06-07) |
| Generic code evaluator | Most modules use `evaluators/generic.ts` — indicative checks only | Beams, columns, gears, combined-loading, welds have specialized evaluators |
| Hardcoded material tables | Gears/bearings pages embed Steel/Aluminum/Bronze constants | Acceptable for launch; catalog materials integration is roadmap |

### P4 — Minor / polish

- `status/page.tsx` still says “calculator” in prose (internal QA page — low priority)
- `material-db` module ID vs route `materials/database` — registry aliases work; naming inconsistent
- Profiles/beams/columns still use dense legacy field styling inside `CalculatorInputPanel` (functional; CalculatorUnitField migration partial)
- Frames/trusses now have `RolledSectionPicker`; truss span/height inputs still use legacy `UnitSelector` pattern

---

## Sample module audit (15 modules)

| Module | Layout | Inputs widget | Results shell | Metric formatting | Auto-design |
|--------|--------|---------------|---------------|-------------------|-------------|
| beams | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | Dashboard plots | Solver-backed ✓ |
| columns | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | Dashboard | Solver-backed ✓ |
| combined-loading | legacy L/C/R | CalculatorUnitField | CalculatorResultsShell | **Fixed** metric cards | Registry ✓ |
| gears | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | **Fixed** metric cards | Solver-backed ✓ |
| bearings | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | **Fixed** metric cards | Solver-backed ✓ |
| v-belts | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | formatDisplayNumber ✓ | Dedicated solver ✓ |
| shafts | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | Custom dl | Solver-backed ✓ |
| timing-belts | legacy L/C/R | CalculatorUnitField | CalculatorResultsShell | Metric cards ✓ | Registry ✓ |
| bolts | legacy L/C/R | Mixed | CalculatorResultsShell | BoltPattern metric cards | Registry ✓ |
| trusses | `inputs`/`results` | CalculatorUnitField | CalculatorResultsShell | Frame-style | Scaffold |
| vacuum-engineering | AdvancedSystemCalculator | CalculatorUnitField | CalculatorResultsShell | formatEngineeringValue ✓ | Advanced registry |
| cost-estimator | legacy + filler center | Partial | CalculatorResultsShell | Custom | Scaffold |
| fatigue | legacy L/C/R | CalculatorUnitField | CalculatorResultsShell | Metric cards ✓ | Registry ✓ |
| unit-converter | legacy L/C/R | CalculatorUnitField | CalculatorResultsShell | formatDisplayNumber ✓ | N/A |
| welds | legacy L/C/R | CalculatorUnitField | CalculatorResultsShell | Custom panels | Specialized evaluator |
| profiles | legacy L/C/R | CalculatorUnitField | CalculatorResultsShell | Custom | Section design ✓ |

---

## Auto-design / Validate / Compare trace

```
CalculatorLayout (moduleId)
  → DesignWorkflowProvider context
  → DesignModeToggle + DesignTargetFields (unless inline module)
  → ModuleDesignAdvisor (results column footer)
  → CalculatorCalculateButton label via useDesignCalculateLabel
Page calculate():
  → if mode === "design": runModuleDesignMode(moduleId, userInputs)
  → applyDesignFields / useRegisterApplyDesignCandidate
  → runCheck() / solver engine
```

**Verified behavior (manual code trace):** beams, columns, gears, v-belts, bearings — mode changes button label; design targets visible in Auto-design and Compare; Apply candidate updates form fields.

---

## Clutter & launch UI

| Item | Status under `NEXT_PUBLIC_FREE_LAUNCH=true` |
|------|---------------------------------------------|
| Pricing / Account nav | Hidden ✓ |
| PlanBadge | Hidden ✓ |
| DesignCodeSelector Pro upsell | Hidden (`showProUpsell` false) ✓ |
| Dev tier toggles | Only when `canSwitchTier` (dev/validation) — not shown in free launch prod ✓ |
| ValidationModeBanner | Shows friendly early-access banner ✓ |
| ModuleDesignAdvisor verbosity | Trimmed ✓ |
| Coming soon modules | None in catalog (`comingSoon` unused) ✓ |

See `docs/Launch-Plan.md` for env contract.

---

## Smoke test checklist (manual QA)

Before announcing launch, spot-check in browser with `NEXT_PUBLIC_FREE_LAUNCH=true`:

- [ ] Home loads; hero shows module count; no Pricing in nav
- [ ] `/products` icon rail + overlay catalog — open beams, gears, v-belts, columns
- [ ] Toggle Auto-design — design target fields appear (except inline modules: beams, columns, v-belts, compression-springs)
- [ ] Auto-design → Calculate on gears — module/face width updates; results show metric cards with units
- [ ] Compare mode on beams — Apply candidate loads section designation
- [ ] Design standard selector — US/EU/ISO all selectable; units reset on change
- [ ] Export PDF + CSV on beams and gears results
- [ ] `/documentation/modules/gears` — equations render (KaTeX)
- [ ] `/status` — verification 13/13 reflected after `npm run test:verification`
- [ ] `/pricing` redirects to `/products`
- [ ] Advanced system: `/products/advanced-systems/vacuum-engineering` — calculate + export
- [ ] Mobile: navbar menu, inputs column scroll, results readable

---

## Commands reference

```bash
npm run validate:layout
npm run build
npm run test:verification
npm run lint
```

---

*Next recommended sprint: migrate timing-belts + roller-chains + bolts to `inputs`/`results`; batch-convert top-traffic `*Results.tsx` to `CalculatorMetricCard`; add v-belt and shaft benchmark cases.*
