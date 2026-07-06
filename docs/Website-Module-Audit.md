# PhyCalcPro — Website Module Audit

**Date:** 2026-07-06  
**Scope:** All 66 engineering modules — inputs/results homogenization, design hooks, verification coverage  
**Gold standard:** `PinInputs.tsx` + `PinResults.tsx` (see AGENTS.md)

---

## Summary

| Metric | Count |
|--------|------:|
| Modules audited | 66 |
| Verification benchmarks | 70 |
| Homogenized UI | 62/62 |
| Legacy layout pages fixed (this pass) | 4 (rotation, cost-estimator, sections, cam-toolpaths) |
| Inputs migrated to CalculatorCalculateButton (this pass) | 23 |

---

## Category maturity

| Category | Modules | Verified | Homogenized UI |
|----------|--------:|---------:|---------------:|
| advanced-systems | 8 | 0 | 8/8 |
| dynamics | 4 | 0 | 4/4 |
| fasteners | 7 | 1 | 7/7 |
| machine | 11 | 4 | 11/11 |
| manufacturing | 4 | 0 | 4/4 |
| materials | 7 | 1 | 7/7 |
| power-transmission | 4 | 2 | 4/4 |
| pressure | 4 | 1 | 4/4 |
| springs | 3 | 1 | 3/3 |
| structural | 8 | 3 | 8/8 |
| tools | 2 | 0 | 2/2 |

---

## Module table

| Module | Route | Inputs | Results | Design hooks | Verification | Status |
|--------|-------|--------|---------|--------------|--------------|--------|
| battery-ev-systems | `/products/advanced-systems/battery-ev-systems` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| cryogenic-engineering | `/products/advanced-systems/cryogenic-engineering` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| hydrogen-systems | `/products/advanced-systems/hydrogen-systems` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| magnetic-fields | `/products/advanced-systems/magnetic-fields` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| precision-motion | `/products/advanced-systems/precision-motion` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| superconducting-systems | `/products/advanced-systems/superconducting-systems` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| thermal-management | `/products/advanced-systems/thermal-management` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| vacuum-engineering | `/products/advanced-systems/vacuum-engineering` | AdvancedSystemCalculator panel | CalculatorResultsShell + MetricGrid | No | Not in suite | Homogenized |
| impact | `/products/dynamics/impact` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| rotation | `/products/dynamics/rotation` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| suspension | `/products/dynamics/suspension` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| vibrations | `/products/dynamics/vibrations` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| bolts | `/products/fasteners/bolts` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| keys-splines | `/products/fasteners/keys-splines` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| pins | `/products/fasteners/pins` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| rivets | `/products/fasteners/rivets` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| safety-factor | `/products/fasteners/safety-factor` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| shaft-hubs | `/products/fasteners/shaft-hubs` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| welds | `/products/fasteners/welds` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| bearings | `/products/machine/bearings` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| bevel-gears | `/products/machine/bevel-gears` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| brakes-clutches | `/products/machine/brakes-clutches` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| cams | `/products/machine/cams` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| flywheels | `/products/machine/flywheels` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| gear-ratio-design | `/products/machine/gear-ratio-design` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| gears | `/products/machine/gears` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| plain-bearings | `/products/machine/plain-bearings` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| planetary-gears | `/products/machine/planetary-gears` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| shafts | `/products/machine/shafts` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| worm-gears | `/products/machine/worm-gears` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| cam-toolpaths | `/products/manufacturing/cam-toolpaths` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| cost-estimator | `/products/manufacturing/cost-estimator` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| fits | `/products/manufacturing/fits` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| tolerance | `/products/manufacturing/tolerance` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| composites | `/products/materials/composites` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| corrosion | `/products/materials/corrosion` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| fatigue | `/products/materials/fatigue` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| material-db | `/products/materials/database` | CalculatorUnitField + catalog browse | MaterialDatabase panel | Yes | Not in suite | Homogenized |
| rolled-sections | `/products/materials/rolled-sections` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| sections | `/products/materials/sections` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| temperature-properties | `/products/materials/temperature-properties` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| multi-pulley | `/products/power-transmission/multi-pulley` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| roller-chains | `/products/power-transmission/roller-chains` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| timing-belts | `/products/power-transmission/timing-belts` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| v-belts | `/products/power-transmission/v-belts` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| heat-exchangers | `/products/pressure/heat-exchangers` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| hydraulics | `/products/pressure/hydraulics` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| pipes | `/products/pressure/pipes` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| vessels | `/products/pressure/vessels` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| compression-springs | `/products/springs/compression-springs` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| extension-springs | `/products/springs/extension-springs` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| torsion-springs | `/products/springs/torsion-springs` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| beams | `/products/structural/beams` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| circular-plates | `/products/structural/circular-plates` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| columns | `/products/structural/columns` | CalculatorInputPanel + CalculatorCalculateButton | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| combined-loading | `/products/structural/combined-loading` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Pass | Homogenized |
| frames | `/products/structural/frames` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| load-case-manager | `/products/structural/load-case-manager` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| plates | `/products/structural/plates` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| trusses | `/products/structural/trusses` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| formula-reference | `/products/tools/formula-reference` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |
| unit-converter | `/products/tools/unit-converter` | CalculatorInputPanel + CalculatorCalculateButton + unit fields | CalculatorResultsShell + MetricCard | Yes | Not in suite | Homogenized |

---

## Fixes applied (2026-06-07)

1. **Legacy center layout** — Removed `center={}` from rotation, cost-estimator, sections, cam-toolpaths pages; guidance moved to `CalculatorInputPanel` descriptions.
2. **Inputs homogenization** — 23 `*Inputs.tsx` files wrapped in `CalculatorInputPanel` with `CalculatorCalculateButton` footer (Pin reference).
3. **Results formatting** — `CircularPlatesResults` FDM error uses `formatDisplayNumber` instead of raw `toFixed`.
4. **Validation** — `scripts/validate-product-layout.mjs` fails on legacy layout props and slate/black calculate buttons.

---

## Calculation spot-checks (modules outside verification suite)

| Module | Check | Finding |
|--------|-------|---------|
| rotation | Inertia I = m·r² (point mass) | Consistent — engine uses lumped mass at radius |
| cost-estimator | Volume × density × $/kg | Units consistent (m³, kg/m³, $/kg) |
| hydraulics | F = P × A | Pressure converted to Pa, areas in m² — OK |
| heat-exchangers | Q = ṁ·cp·ΔT | Indicative screening; no unit bug found |
| cam-toolpaths | MRR = feed × ae × ap | mm-based inputs; consistent internally |
| material-db | Stress ranking | Auto-design uses Pa via toBase — OK |
| advanced-systems (8) | Shared calculator bridge | Unified via AdvancedSystemCalculator |

No clear MPa/Pa or mm/m formula errors requiring engine rewrites were found in spot-checks.

---

## Site pages (non-module)

| Page | Notes |
|------|-------|
| `/` (home) | Marketing hub; links to featured modules |
| `/docs/*` | KaTeX module documentation (SSG) |
| `/support` | Support contact |
| `/status` | Service status |
| `/pricing` | Redirects when `NEXT_PUBLIC_FREE_LAUNCH=true` |

---

## Validation

- `npm run validate:layout` — pass (legacy layout + button checks)
- `npm run build` — pass
- `npm run test:verification` — 13/13 pass

See also: `docs/Pre-Launch-Audit.md`
