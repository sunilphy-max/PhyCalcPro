# Product roadmap — remaining gaps

Tracking items from the expansion roadmap (CAD output excluded by design).

## Completed (this session)

| Area | Item |
|------|------|
| Welds | Eccentric weld group moment + combined throat stress; UI + AWS/EN checks |
| Bolts | Bolt-pattern load sharing mode (elastic) on bolts page |
| Gears | Micropitting indicative safety factor (ISO 6336-22 screening) |
| Pipes | ASME B31.3–style sustained / occasional / peak stress categories |
| Vibrations | Damping ratio ζ + damped natural frequency + resonance note |
| Circular plates | Radial mesh segments + axisymmetric FDM vs Roark validation |
| Multi-pulley | 2–8 pulley editable list, wrap, belt length, radial loads |
| Rolled sections | ~120 AISC W/S/C/L + DIN IPE/UPN/L catalog with family filter |
| Formula reference | 27 formulas, categories, search/filter |
| Benchmarks | compression-springs, timing-belts, bevel-gears, keys-splines, circular-plates |
| Code checks | Specialized templates for compression springs, v-belts, timing belts, keys-splines |
| UI depth | Shafts Kt, fatigue methods, tolerance 2D/MC, fits ISO lookup (prior session) |

## True remaining (optional / out of scope)

| Item | Notes |
|------|--------|
| CAD export | Intentionally excluded |
| Full ISO 6336 / AGMA rating worksheets | Indicative screening only; not full standard worksheets |
| Bolt pattern FEA / VDI 2230 full joint | Elastic pattern sharing only |
| Circular plate annular / variable thickness | Solid disk only; use dedicated FEA externally |
| Homogenization (columns/gears/bearings → `inputs`/`results`) | Already on CalculatorLayout; low benefit |
| Rolled sections | Expand beyond starter tables; add EN/UK designation aliases |
| Multi-pulley | Closed-loop path layout (current: open chain) |
| Micropitting | US AGMA implementation marked planned |
| Benchmark coverage | Remaining modules without JSON fixtures |

## CAD

- Intentionally excluded (no 2D/3D export, no gear tooth CAD).
