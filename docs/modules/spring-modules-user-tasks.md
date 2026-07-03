# Spring modules — your completion checklist

This list covers work that **cannot be fully automated** in PhyCalcPro or that needs your sign-off as the engineer of record. The solver, UI, wire catalog, fatigue screening, and CI benchmarks are in place for all three sub-modules.

**See also:** [validation-master-checklist.md](../validation-master-checklist.md) (all 62 modules) · [VerificationGuide.md](../VerificationGuide.md) (CI commands)

---

## All spring types (compression, extension, torsion)

| # | Task | Why it matters |
|---|------|----------------|
| 1 | **Cross-check one worked example per module against MITCalc or a textbook** | Validates rate, stress, SF, and (if enabled) fatigue against an independent tool. Use the verification cases in `src/data/verification/*-springs-*.json` as starting points. |
| 2 | **Re-baseline saved projects after torsion rate formula change** | Torsion rate is now `k = Ed⁴/(64·D·n)` (Shigley Eq. 10-37). Older saved projects may show different rates. |
| 3 | **Confirm EN 13906 fatigue screening vs official worksheets** | The app uses a simplified τk0 / σk0 + Goodman + life-factor model. Critical designs must be checked against EN 13906-1/2/3 nomographs and your quality system. |
| 4 | **Select wire stock from your supplier catalog** | Auto-design sweeps EN 10270 / ASTM diameters with Shigley Rm fits. Substitute your mill’s tabulated Rm and G if they differ. |
| 5 | **Enter operating frequency where surge matters** | Compression and extension modules compute surge margin when operating Hz is set (target 10×). High-speed applications need this filled in. |
| 6 | **Run `npm run test:verification` before release** | Five spring cases are in CI: compression (static + fatigue), extension, torsion. Update `expected` values if you change the engine. |

---

## Compression springs

| # | Task | Notes |
|---|------|-------|
| 7 | Verify **buckling end condition** matches installation (guided vs hinged vs fixed-free). | Wrong ν gives wrong slenderness limit. |
| 8 | Confirm **solid height clearance** at max load including end grind allowance. | Module uses `n·d + 2d` solid height. |
| 9 | Enable **fatigue screening** when load cycles between Fmin and Fmax; set minimum deflection. | Toggle “EN 13906 fatigue screening” in inputs. |
| 10 | Add **EU worksheet cases** to `src/data/verification/` if you need EN 13906-1 sign-off in CI. | Template: `{moduleId}-EU-{slug}.json`. |

---

## Extension springs

| # | Task | Notes |
|---|------|-------|
| 11 | Validate **initial tension Fi** against coiler capability. | Module flags Fi > manufacturable limit; it does not auto-size Fi. |
| 12 | Confirm **hook type** (machine / cross-over / extended) matches drawing. | Hook often governs; empirical K factors are not a substitute for detail design. |
| 13 | **Hook FEA or supplier data** for safety-critical hooks. | Empirical hook stress factors are screening only. |
| 14 | Set **minimum extension** for fatigue when load cycles between two extension positions. | Body fatigue uses τ from Fi + kx at min and max extension. |
| 15 | Review **extended length** and **coil bind length** against assembly envelope. | Shown in results metrics. |

---

## Torsion springs

| # | Task | Notes |
|---|------|-------|
| 16 | Verify **leg length and leg plane** match your geometry. | Leg bending stress is a simplified cantilever estimate. |
| 17 | Check **coil–leg junction** stress for critical applications. | Not modeled in detail; EN 13906-3 junction factors not fully embedded. |
| 18 | Enable **fatigue screening** with minimum wind angle when load cycles. | Uses bending stress amplitude with EN 13906-3 simplified σk0. |
| 19 | Confirm **inner vs outer coil stress** if using rectangular wire or special winding. | Module uses mean-diameter screening with curvature factor Kb. |

---

## Design mode & catalog

| # | Task | Notes |
|---|------|-------|
| 20 | Tune **design targets** (rate, max force, max OD / leg length) for your product line. | Auto-design ranks catalog wire × coil (× leg for torsion) by utilization. |
| 21 | Extend **`src/data/catalogs/springWireCatalog.ts`** with your preferred stock list. | Add designations, tabulated Rm, or restrict grades per your supply chain. |
| 22 | Link **fatigue module handoff** for full Goodman/Marin analysis when alternating stress is non-zero mean. | Handoff is published from each spring page after calculate. |

---

## Documentation & release

| # | Task | Notes |
|---|------|-------|
| 23 | Update internal **calculation procedure** to reference PhyCalcPro + EN 13906 parts used. | `docs/modules/compression-springs.md`, `extension-springs.md`, `torsion-springs.md`. |
| 24 | Record **assumption log** (wire grade, life class, end condition, hook type) on each project report. | Export CSV/PDF from results shell includes key metrics. |
| 25 | Optional: add **customer-specific verification JSON** files for recurring spring families. | Keeps regression coverage for your standard products. |

---

## Quick reference — what the app implements

| Feature | Compression | Extension | Torsion |
|---------|-------------|-----------|---------|
| Static stress (EN 13906 τ/σ zul) | ✓ | ✓ body + hook | ✓ coil bending |
| Wire catalog picker | ✓ | ✓ | ✓ |
| Auto-design sweep | ✓ | ✓ | ✓ |
| Buckling screen | ✓ | — | — |
| Surge margin | ✓ | ✓ | — |
| Initial tension | — | ✓ | — |
| Hook stress factors | — | ✓ | — |
| EN 13906 fatigue screening | ✓ | ✓ body | ✓ coil |
| CI verification benchmark | ✓ | ✓ | ✓ |
| Fatigue module handoff | ✓ | ✓ | ✓ |

---

*Generated after spring module upgrade session. Re-run verification after any engine change.*
