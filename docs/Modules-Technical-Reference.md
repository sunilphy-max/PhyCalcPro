# PhyCalcPro — Modules Technical Reference

Engineering software manual for the **62 active product modules** shipped under `/products/*`. This document describes purpose, governing methods, design-code support, UI maturity, and known gaps. It complements the homogenization contract in [Homogenization-Roadmap.md](./Homogenization-Roadmap.md).

**Audience:** engineers evaluating PhyCalcPro for design work, and developers extending modules.

**Disclaimer:** All modules produce **indicative** results unless explicitly marked **beta** with implemented code checks. Nothing here replaces licensed professional review or official code compliance certification.

**Equations (authoring):** Use LaTeX in `\( … \)` for inline math and `\[ … \]` for display blocks (or `$ … $` / `$$ … $$`). The site converts these to KaTeX. List items like `- Torque: \(T = …\)` render as labeled display equations.

---

## Table of contents

1. [Platform architecture](#1-platform-architecture)
2. [Module inventory](#2-module-inventory)
3. [Structural engineering](#3-structural-engineering)
4. [Machine design](#4-machine-design)
5. [Fasteners & connections](#5-fasteners--connections)
6. [Materials & sections](#6-materials--sections)
7. [Pressure systems](#7-pressure-systems)
8. [Dynamics & vibrations](#8-dynamics--vibrations)
9. [Manufacturing](#9-manufacturing)
10. [Advanced systems](#10-advanced-systems)
11. [Area properties (profiles)](#11-area-properties-profiles)
12. [Maturity & numerical methods](#12-maturity--numerical-methods)
13. [Gaps & roadmap](#13-gaps--roadmap)

---

## 1. Platform architecture

### 1.1 Navigation and layout

- **Single sidebar:** `src/app/products/layout.tsx` renders the category sidebar. Category layouts are passthrough wrappers — no nested sidebars.
- **Module chrome:** Each calculator page uses `CalculatorLayout` with a **two-column** workspace beside the sidebar:
  - **Inputs column** — parameters, mesh controls, calculate/save (`CalculatorInputPanel` where adopted).
  - **Results column** — plots, metric cards, engineering checks, export (`CalculatorResultsShell` / `ExportableReport`).
- **Legacy three-slot API:** Some pages still pass `left` / `center` / `right`; `CalculatorLayout` merges `left`+`center` into the inputs column and maps `right` → results. Migration to explicit `inputs` / `results` props is in progress.

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
- **Generic evaluator** (`evaluators/generic.ts`): all other catalogued modules — checks are declared but mapped from indicative outputs.

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

### 1.5 Export

`ExportableReport` with `moduleId` enables:

- PDF capture of results (plots tagged `data-export-plot`, diagrams `data-export-diagram`).
- Default CSV rows from solver output.
- Quality checklist from `moduleQualityDefaults`.
- Engineering checks panel when `calculationSpec` is present.

Charts use `EngineeringPlot` with separate `yLabel`, `unitLabel`, `xLabel`, `xUnit`.

### 1.6 Release tiers

`CalculatorLayout` shows catalog `validationStatus` and a computed release tier from benchmark stats (`ReleaseTierBadge`). Benchmark solvers exist for a subset (gears, columns, combined-loading, impact, fatigue, corrosion, suspension, rotation).

### 1.7 Design workflow layer

Every calculator page now receives a shared **Design / Check / Select** advisor through `CalculatorLayout`.
The workflow registry (`src/lib/design-workflows/moduleDesignWorkflows.ts`) provides:

- required design inputs to define before solving,
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
- **Calculate** on product pages branches on workflow mode: **Check** runs the forward solver; **Design** applies the best registry candidate then re-runs the check.
- Shared helpers: `sweepCatalogForUtilization`, `materialCatalogService`, `scripts/scaffold-design-mode.mjs`.

| Coverage type | Meaning |
|---------------|---------|
| **Solver-backed** | Design mode runs a real reverse/catalog solver and applies fields before check (beams, columns, gears, shafts, pipes, …). |
| **Catalog-backed** | Design mode ranks catalog entries (material-db, rolled-sections, bearings, tools reference). |
| **Check-only** | formula-reference, unit-converter — advisor registered; Design mode does not resize (by design). |

**Count:** 61 modules with real design paths · 2 check-only tools · 1 profiles page (section-from-required-I).

---

## 2. Module inventory

| Category | Count | Module IDs |
|----------|------:|------------|
| Structural | 8 | beams, frames, trusses, columns, plates, combined-loading, load-case-manager, circular-plates |
| Power transmission | 4 | v-belts, timing-belts, roller-chains, multi-pulley |
| Machine | 11 | shafts, gears, bearings, cams, flywheels, bevel-gears, worm-gears, planetary-gears, gear-ratio-design, plain-bearings, brakes-clutches |
| Springs | 3 | compression-springs, extension-springs, torsion-springs |
| Fasteners | 7 | bolts, welds, rivets, safety-factor, keys-splines, shaft-hubs, pins |
| Materials | 7 | database, sections, rolled-sections, composites, temperature-properties, fatigue, corrosion |
| Pressure | 4 | pipes, vessels, hydraulics, heat-exchangers |
| Dynamics | 4 | vibrations, rotation, impact, suspension |
| Manufacturing | 4 | tolerance, fits, cost-estimator, cam-toolpaths |
| Advanced systems | 8 | vacuum-engineering, cryogenic-engineering, magnetic-fields, superconducting-systems, thermal-management, battery-ev-systems, hydrogen-systems, precision-motion |
| Tools | 2 | formula-reference, unit-converter |
| **Total** | **62** | |

### Homogenization snapshot

| Aspect | Status |
|--------|--------|
| `CalculatorLayout` + `moduleId` | All 62 active pages |
| `useStandardCalculation` / `useCalculatorModule` | 62 / 62 |
| Unit profiles (`moduleProfiles.ts`) | All expansion modules + majority of legacy modules |
| Modern `inputs`/`results` or full `*Inputs`/`*Results` | All 19 expansion modules + v-belts; legacy slots on some mature modules |
| `CalculatorResultsShell` / metric cards | Universal on expansion modules; widespread elsewhere |
| Specialized code evaluators | 5 modules |
| Extracted from monolith (complete) | impact, corrosion, fatigue, combined-loading, suspension, load-case-manager, temperature-properties |

### Validation catalog status

| Status | Modules |
|--------|---------|
| **beta** | beams, columns, combined-loading, gears, welds |
| **draft** | cost-estimator, cam-toolpaths |
| **indicative** (default) | all others |

---

## 3. Structural engineering

### 3.1 Beam Analysis (`beams`) — **beta**

**Purpose:** 2D Euler–Bernoulli beam analysis — deflection, moment, shear, bending stress for common supports and arbitrary point/UDL/moment loads.

**Method:** **FEM** — 2-node Hermite beam elements; mesh-refinable (`meshSegments`). Not a full 3D or Timoshenko model.

**Key relations:**

- Element stiffness from \(EI/L^3\); curvature–moment: \(M = EI\,\kappa\)
- Bending stress: \(\sigma = M\,c/I\)
- Deflection from solved nodal rotations/displacements

**Inputs:** span \(L\), \(E\), \(I\), distance to extreme fiber \(c\), support type (simply supported, cantilever, fixed–fixed), load list, material preset, mesh density.

**Outputs:** \(V(x)\), \(M(x)\), \(w(x)\), \(\sigma(x)\); peaks; interactive load diagram; `calculationSpec` with flexure and deflection checks.

**Design codes:** AISC 360-22 (Ch. F flexure, serviceability), EN 1993-1-1 (Cl. 6.2.5). **Implemented:** bending stress, deflection. **Planned:** shear (Ch. G / Cl. 6.2.6), lateral–torsional buckling.

**UI:** Modern `inputs`/`results`; `useDesignCodeUnits`; local project save. Featured module.

**Gaps:** No shear check in solver spec; no LTB; legacy `useCalculationPipeline` instead of `useStandardCalculation`; high refactor risk (core FEM).

---

### 3.2 Frame Analysis (`frames`)

**Purpose:** 2D portal frame — column/beam frame with vertical load at mid-span.

**Method:** **FEM** — 2D frame elements (3 DOF/node: \(u, v, \theta\)); fixed-base left, pinned right typical pattern.

**Inputs:** bay width, column height, \(E\), section properties, applied load.

**Outputs:** nodal displacements, member axial/shear/moment, deformed shape diagram.

**Design codes:** Indicative member stress and joint equilibrium checks only (generic mapper).

**UI:** Modern `inputs`/`results`; unit profile for length, force, stress.

**Gaps:** Single topology (portal); no user-defined joints/members; generic code checks only; high refactor risk.

---

### 3.3 Truss Analysis (`trusses`)

**Purpose:** Warren truss axial force analysis under mid-span vertical load.

**Method:** **FEM** — pin-jointed bar elements; stiffness \(k = EA/L\).

**Inputs:** span, height, panel count, \(A\), \(E\), load magnitude.

**Outputs:** member axial forces (tension/compression), utilization-style summary.

**Design codes:** Indicative axial utilization.

**UI:** Modern `inputs`/`results`. **No unit profile** — manual unit state in page.

**Gaps:** Fixed Warren geometry; no unit profile; no specialized code evaluator.

---

### 3.4 Column Buckling (`columns`) — **beta**

**Purpose:** Elastic column buckling — critical load, effective length, mode shapes.

**Method:** **FEM eigenvalue** hybrid — assembles elastic \(K_E\) and geometric \(K_G\) stiffness; Euler fallback for fast critical load:

\[
P_{cr} = \frac{\pi^2 E I}{L_e^2}, \quad L_e = k L
\]

Effective-length factor \(k\) from end condition (pinned, fixed, fixed–pinned, etc.).

**Inputs:** \(L\), \(P\), \(I\), \(A\), \(E\), end condition.

**Outputs:** \(P_{cr}\), critical stress, slenderness, buckling mode shapes (1–3), deflected shape under load.

**Design codes:** **Implemented** for US (AISC 360-22 Ch. E), EU (EN 1993-1-1 buckling), ISO 10721 — buckling utilization and Euler critical check.

**UI:** Legacy `left`/`center`/`right` with `CalculatorGuidancePanel`; `useStandardCalculation` + region units.

**Gaps:** Linear elastic buckling only; no inelastic column curves; area unit conversion noted as incomplete in page code.

---

### 3.5 Plate Bending (`plates`)

**Purpose:** Thin rectangular plate under uniform lateral pressure — deflection and bending moments.

**Method:** **FEM** — Mindlin/Reissner-style plate discretization (3 DOF/node: \(w, \theta_x, \theta_y\)); Gauss integration.

**Key behavior:** Biharmonic plate equation in weak form; moments from curvature:

\[
M_x = -D(\partial^2 w/\partial x^2 + \nu\,\partial^2 w/\partial y^2), \quad D = \frac{E t^3}{12(1-\nu^2)}
\]

**Inputs:** \(L\), \(W\), thickness \(t\), \(E\), \(\nu\), pressure \(q\), mesh density, boundary type.

**Outputs:** deflection grid, \(M_x, M_y, M_{xy}\), peaks, contour-style plots.

**Design codes:** Indicative bending stress and deflection checks.

**UI:** Modern `inputs`/`results`.

**Gaps:** Single rectangular plate; limited boundary catalog; validation quality low in maturity matrix.

---

### 3.6 Combined Loading (`combined-loading`) — **beta**

**Purpose:** Solid rectangular section under simultaneous axial, bending, torsion, and shear — von Mises screening.

**Method:** **Closed-form**

\[
\sigma_{ax} = \frac{P}{A}, \quad \sigma_b = \frac{M c}{I}, \quad \tau_t = \frac{T c}{J}, \quad \tau_v = \frac{V}{A}
\]

\[
\sigma_{vm} = \sqrt{(\sigma_{ax}+\sigma_b)^2 + 3\tau_t^2}
\]

(Shear \(\tau_v\) computed but not folded into von Mises in current engine — limitation.)

**Design codes:** **Implemented** von Mises check — Indicative, AISC Ch. H, EN 1993-1-1 Cl. 6.2, ISO 10828.

**UI:** Legacy three-column; extracted monolith module; unit profile complete.

**Gaps:** Rectangular section only; shear not in von Mises combination; no warping/torsion refinement.

---

### 3.7 Load Case Manager (`load-case-manager`)

**Purpose:** Envelope multiple load cases (axial, moment, shear) and evaluate combined stress on a rectangular section.

**Method:** **Closed-form** envelope + von Mises-style combination (similar to combined-loading).

**Inputs:** case list, section width/height, yield strength.

**Outputs:** envelope forces, stress components, safety factor, design status.

**Design codes:** Indicative envelope utilization.

**UI:** Legacy layout; extracted monolith; unit profile present.

**Gaps:** Orchestration layer only — no links to external FEA; rectangular section; simplified combination formula.

---

## 4. Machine design

### 4.1 Shaft Design (`shafts`)

**Purpose:** Rotating shaft under combined torque, bending, and optional axial load — stress, deflection, critical speed.

**Method:** **FEM** — 1D shaft elements with torsion and bending DOF; post-processing for von Mises, critical speed estimate.

**Key outputs:** \(\tau_{max}\), \(\sigma_b\), \(\sigma_{vm}\), deflection curve, critical speed margin.

**Design codes:** Indicative combined stress, deflection, critical speed (AGMA 6001 / DIN 743 referenced in catalog, not fully implemented as code checks).

**UI:** Modern `inputs`/`results`; region unit sync; mesh control. Featured module.

**Gaps:** Uniform diameter shaft; fixed-end boundary; fatigue screening not integrated; high refactor risk.

---

### 4.2 Gear Design (`gears`) — **beta**

**Purpose:** Spur gear pair sizing — Lewis bending and simplified Hertzian contact.

**Method:** **Closed-form / empirical**

- Torque: \(T = \dfrac{60P}{2\pi n}\)
- Lewis bending: \(\sigma_b = \dfrac{F_t}{b\,m\,Y}\)
- Contact (simplified): Hertz-style \(\sigma_c \propto \sqrt{F_t E' (1/R_1 + 1/R_2)}\)

**Design codes:** Bending and contact **implemented** (Indicative, AGMA 2101, DIN 3990, ISO 6336-2/3). **Planned:** scuffing, bending/contact fatigue, micropitting.

**UI:** Legacy three-column; unit profile; benchmarked.

**Gaps:** No profile shift, helix angle, or gear mesh FEA; scuffing/fatigue checks catalogued as planned only.

---

### 4.3 Bearing Selection (`bearings`)

**Purpose:** Rolling-element bearing equivalent load and L10 life screening.

**Method:** **Closed-form** (ISO 281 style)

\[
P = X F_r + Y F_a, \quad L_{10} = \left(\frac{C}{P}\right)^3 \times 10^6 \text{ rev}
\]

**Inputs:** radial/axial load, speed, bearing type, material dynamic rating factor, required life, safety factor.

**Outputs:** equivalent load, required \(C\), expected life hours.

**Design codes:** ISO 281 referenced; indicative dynamic capacity and L10 checks.

**UI:** Legacy layout; unit profile.

**Gaps:** Catalog coefficients simplified (deep groove, angular contact only); no temperature or contamination factors.

---

### 4.4 Cam Design (`cams`)

**Purpose:** Cam follower kinematics — displacement, velocity, acceleration for standard motion laws.

**Method:** **Closed-form** kinematics (harmonic, cycloidal, polynomial rise segments).

**Inputs:** base radius, rise, rise angle, motion law, follower parameters.

**Outputs:** pressure angle, contact stress estimate, kinematic curves.

**Design codes:** Indicative pressure angle and contact stress.

**UI:** Legacy layout; unit profile.

**Gaps:** No material fatigue or lubrication film; single-dwell profile family.

---

### 4.5 Flywheel Design (`flywheels`)

**Purpose:** Energy storage and rim stress in a thin-ring flywheel approximation.

**Method:** **Closed-form**

\[
E_k = \tfrac{1}{2} I \omega^2, \quad \sigma_\theta \approx \rho \omega^2 r^2
\]

**Inputs:** outer diameter, thickness, face width, density, RPM, yield stress.

**Outputs:** mass, inertia, stored energy, hoop stress, safety factor.

**Design codes:** Indicative stress and energy checks.

**UI:** Legacy layout; unit profile.

**Gaps:** Thin-ring assumption; no arm/web stress concentration.

---

## 5. Fasteners & connections

### 5.1 Bolt Calculator (`bolts`)

**Purpose:** Bolted joint — preload, tensile, shear, bearing on threads.

**Method:** **FEM** wrapper (`solveScrewFEM`) with validation layer — simplified 1D/threaded fastener model, not full 3D contact FEA.

**Design codes:** AISC J3, EN 1993-1-8, VDI 2230 referenced; indicative tensile/shear/bearing checks.

**UI:** Legacy layout; unit profile. Featured module.

**Gaps:** VDI high-fidelity joint analysis not implemented; FEM label is simplified; moderate refactor risk despite good validators.

---

### 5.2 Weld Group Analysis (`welds`) — **beta**

**Purpose:** Fillet/butt weld throat stress under shear and axial load.

**Method:** **Closed-form**

- Throat area: \(A_t = a_t \times L \times n_w\)
- Resultant throat stress: \(\sigma_{eq} = \sqrt{\tau^2 + \sigma^2}\)

**Design codes:** **Implemented** throat shear and combined stress — AWS D1.1, EN 1993-1-8.

**UI:** Legacy layout; specialized weld evaluator.

**Gaps:** No eccentric load / moment on weld group; uniform stress distribution.

---

### 5.3 Rivet Analysis (`rivets`)

**Purpose:** Multi-rivet shear and bearing screening.

**Method:** **Closed-form** — load per rivet, bearing on plate, shear in shank.

**Design codes:** Indicative shear and bearing safety factors.

**UI:** Legacy layout; unit profile.

**Gaps:** No pitch/edge distance checks; no fatigue.

---

### 5.4 Safety Factor (`safety-factor`)

**Purpose:** General reserve factor calculator for circular solid section under combined loading.

**Method:** **Closed-form** von Mises on circular shaft section:

\[
\sigma_{vm} = \sqrt{\sigma_n^2 + 3(\tau_v^2 + \tau_t^2)}
\]

**Outputs:** yield and ultimate safety factors, governing limit.

**Design codes:** Indicative only.

**UI:** Legacy layout. **No unit profile.**

**Gaps:** Circular solid only; utility module — overlaps combined-loading/shafts.

---

## 6. Materials & sections

### 6.1 Material Database (`material-db`)

**Purpose:** Lookup table for common engineering materials (\(E\), \(\nu\), density, yield, etc.).

**Method:** **Reference data** — no solver.

**Design codes:** Property lookup check (indicative).

**UI:** Legacy three-column; database in results column; no calculate pipeline.

**Gaps:** No unit profile; not integrated as live input source for all modules; static dataset.

---

### 6.2 Section Properties (`sections`)

**Purpose:** Geometric properties for standard shapes — rectangle, circle, I-beam.

**Method:** **Closed-form** formulas (\(A\), \(I_{xx}\), \(I_{yy}\), centroid).

**UI:** Legacy layout; unit profile.

**Gaps:** Limited shape library vs. `profiles` FEM route; no built-up sections.

---

### 6.3 Composite Materials (`composites`)

**Purpose:** Rule-of-mixtures effective properties for unidirectional laminate.

**Method:** **Closed-form micromechanics**

\[
E_L = E_f V_f + E_m V_m, \quad \frac{1}{E_T} = \frac{V_f}{E_f} + \frac{V_m}{E_m}
\]

(similar for strength)

**Design codes:** Indicative modulus and strength utilization.

**UI:** Legacy layout; unit profile.

**Gaps:** No ply stacking, failure criteria (Tsai–Wu, Hashin), or plate bending; **advanced-numerics** maturity band with high refactor risk.

---

### 6.4 Temperature Properties (`temperature-properties`)

**Purpose:** Derate yield and modulus vs. operating temperature; thermal expansion.

**Method:** **Empirical linear derating** from 20 °C reference:

\[
f_y(T) = f_{y,0}(1 - k_y \Delta T), \quad f_E(T) = E_0(1 - k_E \Delta T)
\]

**UI:** Legacy layout; extracted monolith; unit profile.

**Gaps:** Generic coefficients — not material-specific tables (ASME, EN).

---

### 6.5 Fatigue Assessment (`fatigue`)

**Purpose:** High-cycle fatigue screening with modified Goodman and S–N estimate.

**Method:** **Empirical**

\[
\sigma_a \le S_e \left(1 - \frac{\sigma_m}{\sigma_u}\right), \quad N \propto \left(\frac{S_e}{\sigma_a}\right)^3
\]

**Design codes:** ISO 12107, ASME VIII-2 referenced; indicative Goodman and life checks.

**UI:** Legacy layout; extracted monolith; `CalculatorResultsShell` style results.

**Gaps:** Single-stage Goodman; no mean-stress corrections (Gerber, Morrow), notch factors, or multiaxial fatigue; **advanced-numerics**.

---

### 6.6 Corrosion Allowance (`corrosion`)

**Purpose:** Required wall thickness given corrosion rate and design life.

**Method:** **Closed-form**

\[
t_{req} = t_0 + \dot{c}\, t_{life}\,(1 + \text{margin})
\]

**UI:** Legacy layout; extracted monolith; unit profile.

**Gaps:** Uniform corrosion only; no localized/pitting models; no API/ASME vessel integration.

---

## 7. Pressure systems

### 7.1 Pipe Stress Analysis (`pipes`)

**Purpose:** Cylindrical pipe under internal pressure — hoop/longitudinal stress and deformation.

**Method:** **FEM** — thin cylindrical shell discretization; compares to thin-wall theory.

**Thin-wall reference:**

\[
\sigma_h = \frac{p r}{t}, \quad \sigma_l = \frac{p r}{2t}
\]

**Design codes:** ASME B31.3 referenced; indicative hoop/longitudinal utilization.

**UI:** Modern `inputs`/`results`; unit profile.

**Gaps:** No bends, supports, or thermal expansion; high refactor risk.

---

### 7.2 Pressure Vessels (`vessels`)

**Purpose:** Cylindrical vessel — thin/thick wall stress and required thickness.

**Method:** **FEM** shell model + classical thin-wall checks for required thickness (ASME UG-27 style screening).

**UI:** Modern `inputs`/`results`; unit profile.

**Design codes:** ASME VIII-1, EN 13445 referenced.

**Gaps:** No heads, nozzles, or fatigue; axisymmetric cylinder only.

---

### 7.3 Hydraulic Cylinders (`hydraulics`)

**Purpose:** Double-acting cylinder forces, fluid volume, rod stress.

**Method:** **Closed-form**

\[
F_{ext} = p A_{piston}, \quad F_{ret} = p (A_{piston} - A_{rod})
\]

**UI:** Legacy layout; unit profile.

**Gaps:** No seal friction, buckling on rod, or cushioning.

---

### 7.4 Heat Exchangers (`heat-exchangers`)

**Purpose:** Thermal duty, LMTD, NTU, effectiveness for parallel/counterflow.

**Method:** **Advanced numerics / correlations**

\[
\dot{Q} = \dot{m}_h c_{p,h}(T_{h,in} - T_{h,out}), \quad \text{LMTD} = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1/\Delta T_2)}
\]

\[
\varepsilon = f(\text{NTU}, C_r), \quad \text{NTU} = \frac{UA}{C_{min}}
\]

**UI:** Legacy layout; unit profile.

**Gaps:** No pressure drop or fouling; fixed flow arrangements; **draft**-adjacent maturity (indicative catalog).

---

## 8. Dynamics & vibrations

### 8.1 Vibration Analysis (`vibrations`)

**Purpose:** Natural frequencies and mode shapes of prismatic beams.

**Method:** **FEM** — Euler–Bernoulli beam eigenproblem; up to 240 segments.

\[
(K - \omega^2 M)\,\phi = 0
\]

**Design codes:** ISO 10816 referenced for severity context; indicative frequency and separation margin.

**UI:** Modern `inputs`/`results`; unit profile. Flagship **advanced-numerics** module.

**Gaps:** Beam only; no damping or forced response; high refactor risk.

---

### 8.2 Rotational Systems (`rotation`)

**Purpose:** Basic rotating mass — inertia, kinetic energy, centripetal force, torque from power.

**Method:** **Closed-form** rigid-body dynamics.

**UI:** Legacy layout; unit profile; benchmarked.

**Gaps:** No gyroscopic effects or transients.

---

### 8.3 Impact & Shock (`impact`)

**Purpose:** Transient impact — average force and dynamic stress from impulse.

**Method:** **Closed-form** rigid impact

\[
J = m\,\Delta v, \quad F_{avg} = \frac{J}{\Delta t}, \quad \sigma_d = \frac{F_{avg}}{A}
\]

**UI:** Legacy layout; extracted monolith; `useCalculatorModule`; unit profile.

**Gaps:** No stress wave propagation or elastic rebound; step-averaged force only.

---

### 8.4 Suspension & Sway (`suspension`)

**Purpose:** Vehicle roll under lateral acceleration — roll angle, load transfer.

**Method:** **Closed-form** static roll model

\[
 M_{roll} = F_y \frac{WB}{2}, \quad \phi = \frac{M_{roll}}{K_{roll}}, \quad \Delta W = F_y \frac{h_{cg}}{t_{track}}
\]

**UI:** Legacy layout; extracted monolith; unit profile.

**Gaps:** No spring–damper dynamics or ride frequency (despite catalog labels); quasi-static only.

---

## 9. Manufacturing

### 9.1 Tolerance Stackup (`tolerance`)

**Purpose:** 1D dimensional stack — worst-case and RSS.

**Method:** **Closed-form**

\[
\text{WC} = \sum t_i, \quad \text{RSS} = \sqrt{\sum t_i^2}
\]

**Design codes:** ISO 286, ASME Y14.5 referenced.

**UI:** Legacy layout; unit profile.

**Gaps:** Linear stacks only; no GD&T datums or Monte Carlo.

---

### 9.2 Fits & Clearances (`fits`)

**Purpose:** ISO-style hole/shaft tolerance band — clearance, interference, transition classification.

**Method:** **Closed-form** from user-entered deviation limits:

\[
C_{min} = D_{min}^{hole} - D_{max}^{shaft}, \quad C_{max} = D_{max}^{hole} - D_{min}^{shaft}
\]

**Design codes:** ISO 286-1 referenced.

**UI:** Legacy layout; `useCalculatorModule`; unit profile.

**Gaps:** Manual tolerance entry — no automatic ISO tolerance grade lookup by nominal size.

---

### 9.3 Cost Estimation (`cost-estimator`) — **draft**

**Purpose:** Rough manufacturing cost from material, machining, labor, overhead heuristics.

**Method:** **Empirical** weighted sum — not a quoting system.

**UI:** Legacy layout. **No unit profile.**

**Gaps:** Draft status; no CAD integration; region/currency not modeled.

---

### 9.4 CAM Toolpaths (`cam-toolpaths`) — **draft**

**Purpose:** Basic toolpath length and time estimates from geometry and feed rate.

**Method:** **Geometric** — simplified path length; no full CAM kernel.

**UI:** Legacy layout. **No unit profile.**

**Gaps:** Draft status; no collision or machine kinematics.

---

## 10. Advanced Systems

### 10.1 Vacuum Engineering (`vacuum-engineering`)

**Purpose:** First-pass vacuum chamber screening — ideal pump-down time, molecular-flow line conductance, vacuum force, and target gas throughput.

**Method:** **Closed-form / empirical** vacuum approximations.

**Key relations:**

\[
t = \frac{V}{S}\ln\left(\frac{P_0}{P_t}\right)
\]

\[
C_{air} \approx \frac{12.1 d^3}{L}\quad [\mathrm{L/s}], \quad d,L \text{ in cm}
\]

\[
F = \Delta P A, \quad Q = P_t S
\]

**Inputs:** chamber volume \(V\), effective pump speed \(S\), initial pressure \(P_0\), target pressure \(P_t\), line diameter/length, pressure differential, projected area.

**Outputs:** ideal pump-down time, molecular conductance, vacuum force, gas throughput; assumptions and high-pressure warnings.

**Design references:** ISO 21360 pump performance context, ASTM E595 outgassing context, AVS vacuum practice.

**Gaps:** No conductance network solver, no viscous-to-molecular transition, no outgassing history or leak-test model.

---

### 10.2 Cryogenic Engineering (`cryogenic-engineering`)

**Purpose:** Cryogenic heat-load screening — conductive/radiative heat leak, equivalent boil-off, cooldown energy, and ideal cooldown time.

**Method:** **Closed-form** lumped heat-transfer model.

**Key relations:**

\[
\dot Q_{cond} = \frac{k A \Delta T}{L}
\]

\[
\dot Q_{rad} = \epsilon \sigma A \left(T_h^4 - T_c^4\right)
\]

\[
\dot m_{boiloff} = \frac{\dot Q_{total}}{h_{fg}}, \quad E_{cool} = m c_p \Delta T
\]

**Inputs:** warm/cold temperatures, area, conduction length, effective conductivity, emissivity, cold mass, average heat capacity, cryogen latent heat, available cooling power.

**Outputs:** total heat leak, equivalent boil-off rate, cooldown energy, ideal cooldown time.

**Design references:** CGA cryogenic guidance, NASA cryogenic practice, ASTM material data.

**Gaps:** No MLI layer-by-layer model, transient gradients, material embrittlement, relief sizing, or detailed cooldown trajectory.

---

### 10.3 Magnetic Fields & Coils (`magnetic-fields`)

**Purpose:** Electromagnetic coil screening — solenoid field, inductance, stored energy, Lorentz force, and resistive heating.

**Method:** **Closed-form** long-solenoid and conductor approximations.

**Key relations:**

\[
B = \mu_0 \frac{N I}{L}
\]

\[
\mathcal{L} = \mu_0 \frac{N^2 A}{L}, \quad E = \frac{1}{2}\mathcal{L} I^2
\]

\[
F = B I \ell, \quad P_{heat}=I^2 R
\]

**Inputs:** turns, current, coil length/area, active conductor length, coil resistance.

**Outputs:** magnetic field, inductance, stored energy, Lorentz force, resistive heating.

**Design references:** IEC electrical equipment practice, magnet design handbooks, MMPDS where structural support applies.

**Gaps:** No fringe fields, saturation, finite-solenoid correction, cooling, insulation, or coupled electromagnetic-structural analysis.

---

### 10.4 Superconducting Systems (`superconducting-systems`)

**Purpose:** Superconducting magnet operating margin screening — current margin, temperature margin, stored energy, dump voltage, discharge time constant, and cooling margin.

**Method:** **Closed-form** scalar margin and \(L/R\) dump approximation.

**Key relations:**

\[
E = \frac{1}{2}\mathcal{L}I^2
\]

\[
\text{current margin} = \frac{I_c-I}{I_c}, \quad \Delta T = T_c - T_{op}
\]

\[
V_{dump}=IR_d, \quad \tau=\frac{\mathcal{L}}{R_d}
\]

**Inputs:** magnet inductance, operating/critical current, operating/critical temperature, dump resistance, heat load, cryocooler capacity.

**Outputs:** stored magnetic energy, current margin, temperature margin, dump voltage, discharge time constant, cooling margin.

**Design references:** IEC superconductivity terminology, cryogenic magnet practice.

**Gaps:** No conductor critical-surface model, quench propagation, insulation voltage stress, or cryogenic transient simulation.

---

### 10.5 Thermal Management (`thermal-management`)

**Purpose:** Electronics and hardware thermal screening — conduction, convection, radiation, thermal resistance, and coolant rise.

**Method:** **Closed-form** parallel heat-transfer capacity model.

**Key relations:**

\[
\dot Q_{cond} = \frac{k A \Delta T}{t}, \quad \dot Q_{conv}=hA\Delta T
\]

\[
\dot Q_{rad} = \epsilon\sigma A(T_h^4-T_\infty^4)
\]

\[
R_\theta = \frac{\Delta T}{\dot Q_{total}}, \quad \Delta T_{coolant}=\frac{\dot Q_{total}}{\dot m c_p}
\]

**Inputs:** temperature difference, area, conduction thickness, conductivity, convection coefficient, emissivity, hot/ambient temperatures, coolant mass flow, coolant heat capacity.

**Outputs:** total heat-transfer capacity, conduction/convection/radiation contribution, effective thermal resistance, coolant temperature rise.

**Design references:** JEDEC thermal practice, ASHRAE heat-transfer data, standard heat-transfer methods.

**Gaps:** No CFD, spreading resistance, contact resistance, two-phase flow, or detailed cold-plate pressure drop.

---

### 10.6 Battery & EV Systems (`battery-ev-systems`)

**Purpose:** Battery pack preliminary screening — nominal voltage/energy, ohmic heat, cooling mass flow, busbar area, and simple vent area.

**Method:** **Closed-form** electrical/thermal pack estimates.

**Key relations:**

\[
V_{pack} = N_s V_{cell}, \quad E_{pack}=V_{pack}N_p C_{cell}
\]

\[
\dot Q = N_s N_p R_{cell}\left(\frac{I}{N_p}\right)^2
\]

\[
\dot m_{coolant} = \frac{\dot Q}{c_p\Delta T}, \quad A_{busbar}=\frac{I}{J_{allow}}
\]

**Inputs:** series/parallel cells, cell voltage/capacity/resistance, pack current, busbar current density, coolant heat capacity and allowed rise, gas generation and target vent velocity.

**Outputs:** pack voltage, pack energy, ohmic heat generation, cooling mass flow, minimum busbar area, simple vent area.

**Design references:** UL 2580, SAE J2464, ISO 6469, IEC 62619.

**Gaps:** No BMS behavior, electrochemical cell maps, thermal runaway propagation, enclosure rupture model, or regulatory abuse-test compliance.

---

### 10.7 Hydrogen Systems (`hydrogen-systems`)

**Purpose:** Hydrogen storage and vent screening — ideal stored mass, energy content, thin-wall hoop stress, gas density, and leak/vent flow estimate.

**Method:** **Closed-form** ideal gas, thin-wall, and orifice-flow screening.

**Key relations:**

\[
m = \frac{P V M_{H_2}}{R T}
\]

\[
\sigma_\theta = \frac{P r}{t}
\]

\[
\dot m \approx C_d A \sqrt{2\rho\Delta P}
\]

**Inputs:** storage pressure/volume/temperature, vessel radius/thickness, discharge coefficient, orifice area, vent pressure differential.

**Outputs:** stored hydrogen mass, lower heating energy, hoop stress, ideal gas density, estimated leak mass flow, equivalent vent area.

**Design references:** ISO 19880, ASME B31.12, NFPA 2, SAE J2579.

**Gaps:** High-pressure hydrogen needs real-gas compressibility, material compatibility, embrittlement review, relief-device sizing, and code vessel checks.

---

### 10.8 Precision Motion & Vibration (`precision-motion`)

**Purpose:** Precision mechanism screening — flexure stiffness, natural frequency, thermal drift, frequency ratio, and isolation transmissibility.

**Method:** **Closed-form** cantilever flexure and single-degree-of-freedom vibration model.

**Key relations:**

\[
k = \frac{3EI}{L^3}, \quad f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}}
\]

\[
\Delta L = \alpha L \Delta T
\]

\[
T_r = \sqrt{\frac{1+(2\zeta r)^2}{(1-r^2)^2+(2\zeta r)^2}}, \quad r=\frac{f}{f_n}
\]

**Inputs:** elastic modulus, flexure second moment, flexure length, moving mass, thermal expansion coefficient, reference length, temperature change, excitation frequency, damping ratio.

**Outputs:** flexure stiffness, natural frequency, thermal drift, frequency ratio, transmissibility.

**Design references:** ISO 230 machine tool accuracy context, ISO 20816 vibration context, precision machine design references.

**Gaps:** No multi-axis flexure model, bearing/control-loop model, nonlinear travel limits, or full error budget.

---

## 11. Area properties (profiles)

### Profiles (`profiles`)

**Route:** `/products/profiles` — not listed in sidebar categories but catalogued in `moduleStandardCatalog`.

**Purpose:** Cross-section area properties for rectangle, circle, I-section, T-section, channel — including composite built-up shapes via mesh integration.

**Method:** **FEM** numerical integration over meshed section (`solveAreaPropertiesFEM`) with analytical fallbacks for simple shapes.

**Outputs:** \(A\), centroid, \(I_{xx}\), \(I_{yy}\), principal axes, torsion constant (where implemented).

**UI:** Legacy `center`/`right` only (no dedicated inputs column label); `useStandardCalculation`; unit profile.

**Gaps:** Overlaps `sections` closed-form module; maturity metadata unclassified in `moduleMaturity.ts`; layout not migrated to `inputs`/`results`.

---

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

### 13.1 Homogenization (UI / contract)

1. **Solver-backed design mode** — Convert workflow scaffold rows into real candidate generation for each module.
2. **Layout migration** — ~26 modules still use deprecated `left`/`center`/`right`. Target: `inputs` + `results` only, with `CalculatorInputPanel` and `CalculatorGuidancePanel` inside inputs where guidance is needed.
3. **Unit profiles** — Add profiles for trusses, material-db, safety-factor, cost-estimator, cam-toolpaths; migrate remaining pages to `CalculatorUnitField`.
4. **Results shell** — Standardize on `CalculatorResultsShell`, `CalculatorMetricGrid`, and `CalculatorMetricCard` with `formatEngineeringValue` (column buckling style per AGENTS.md).
5. **Hook consolidation** — Prefer `useStandardCalculation` over ad hoc `useDesignCodeUnits` + manual `attach*CalculationSpec` (beams is the outlier).
6. **Export** — Ensure all plots use `EngineeringPlot` with export attributes; wrap SVG diagrams with `data-export-diagram`.

### 13.2 MITCalc-style design depth

| Priority | Gap |
|----------|-----|
| High | Add solver-backed automatic sizing for shafts, beams, springs, bolts, gears, bearings, belts/chains, pressure vessels and welds. |
| High | Add standard/catalog tables: shaft diameters, bearing series, bolt sizes/grades, keyways, spring wires, belt/chain families, pipe schedules, material grades. |
| High | Persist design alternatives and compare candidate rows with actual computed safety, weight, cost and availability. |
| Medium | Link assemblies: gear ratio → gear strength → shaft → keys/splines → bearings → fatigue → report. |
| Medium | Add expert coefficient recommendations and invalid-geometry warnings per standard. |
| Medium | Add CAD/SVG/DXF export for geometry-producing modules. |

### 13.3 Design code depth

| Priority | Gap |
|----------|-----|
| Medium | Shafts: Kt UI wiring; DIN 743 / AGMA fatigue checks |
| Medium | Tolerance/fits: expose 2D stack, Monte Carlo, ISO 286 auto UI |
| Low | Welds: eccentric weld group combined stress refinement |
| Low | Bolts: bolt pattern load sharing |

**Recently addressed (2026 expansion):** Full UI for 19 expansion modules (springs, power transmission, gearing extensions, connections, circular-plates, rolled-sections, tools); fatigue Gerber/Morrow selector; tolerance 2D + Monte Carlo UI; fits ISO 286 lookup; shaft Kt input.

Only **columns, combined-loading, welds**, and partial **beams/gears** have non-generic implemented evaluators.

---

## 14. Expansion modules (2026)

### 14.1 Power transmission

| Module | Key relations |
|--------|----------------|
| **v-belts** | \(L = 2C + \frac{\pi(D_1+D_2)}{2} + \frac{(D_2-D_1)^2}{4C}\); pretension from tight/slack ratio with friction wrap |
| **timing-belts** | Pitch diameter \(d = p z / \pi\); belt length open-drive approximation |
| **roller-chains** | Power capacity vs. strand count; life \(\propto 1/\text{load}^3\) screening |
| **multi-pulley** | Wrap angles from center distance and diameters; segment length sum |

### 14.2 Gearing extensions

| Module | Key relations |
|--------|----------------|
| **bevel-gears** | Lewis bending + Hertzian contact (same family as spur) |
| **worm-gears** | Efficiency \(\eta = \tan\lambda/(\tan\lambda+\mu)\) |
| **planetary-gears** | \(z_r = z_s + 2 z_p\), ratio \(1 + z_r/z_s\) |
| **gear-ratio-design** | Integer search minimizing \(\|z_2/z_1 - i\|\) |

### 14.3 Springs

Helical compression: \(k = G d^4 / (8 D^3 n)\), Wahl factor \(K_s\), solid height \(\approx n d + 2d\).

Extension springs reuse compression core with initial tension estimate. Torsion springs: \(k = E d^4 / (116 D n)\), bending stress from torque.

### 14.4 Shaft connections

Keys/splines: shear \(\tau = T/(0.5 d A_s)\), bearing on key. Shaft hubs: Lamé-type contact pressure from interference. Pins: double shear + bearing on plate thickness.

### 14.5 Other new modules

- **brakes-clutches:** friction torque at mean radius, energy \(E = P \Delta t\)
- **plain-bearings:** Sommerfeld \(S = \mu U / W\), film thickness screening
- **circular-plates:** \(w \propto p a^4 / D\), \(D = E t^3 / (12(1-\nu^2))\)
- **rolled-sections:** catalog lookup (W/S/C starter set)
- **formula-reference / unit-converter:** shared formula hub and unit layer

### 14.6 Advanced systems

| Module | Key relations |
|--------|----------------|
| **vacuum-engineering** | \(t = (V/S)\ln(P_0/P_t)\); \(C \approx 12.1d^3/L\); \(F=\Delta P A\) |
| **cryogenic-engineering** | \(\dot Q = kA\Delta T/L + \epsilon\sigma A(T_h^4-T_c^4)\); boil-off \(\dot m=\dot Q/h_{fg}\) |
| **magnetic-fields** | \(B=\mu_0NI/L\); \(\mathcal{L}=\mu_0N^2A/L\); \(E=\frac{1}{2}\mathcal{L}I^2\) |
| **superconducting-systems** | current/temperature margins; \(V=IR_d\); \(\tau=\mathcal{L}/R_d\) |
| **thermal-management** | conduction, convection, radiation and coolant rise \( \Delta T = \dot Q/(\dot m c_p)\) |
| **battery-ev-systems** | \(V_{pack}=N_sV_{cell}\); \(\dot Q=N_sN_pR(I/N_p)^2\); busbar area \(I/J\) |
| **hydrogen-systems** | \(m=PVM/(RT)\); \(\sigma_\theta=Pr/t\); \(\dot m\approx C_dA\sqrt{2\rho\Delta P}\) |
| **precision-motion** | \(k=3EI/L^3\); \(f_n=(2\pi)^{-1}\sqrt{k/m}\); SDOF transmissibility |

---

## 15. Expansion module reference (`id`)

Each entry summarizes governing relations for the expansion modules added in 2026. Advanced Systems modules use the shared `AdvancedSystemCalculator` shell with inputs, assumptions, warnings, metrics, standards metadata, and `CalculatorResultsShell` export.

### Module (`compression-springs`)

Helical compression: spring rate \(k = G d^4 / (8 D^3 n)\), Wahl shear factor \(K_s = (4C-1)/(4C-4) + 0.615/C\) with \(C = D/d\), shear stress \(\tau = 8 F D K_s / (\pi d^3)\), solid height \(\approx n d + 2d\).

### Module (`extension-springs`)

Same rate and stress core as compression; adds initial tension estimate \(F_i \approx k \cdot 0.1 L_0\).

### Module (`torsion-springs`)

Rate \(k = E d^4 / (116 D n)\); torque \(T = k \theta\); bending stress \(\sigma = 32 T / (\pi d^3)\).

### Module (`timing-belts`)

Pitch diameter \(d = p z / \pi\); open-drive belt length; tangential force from transmitted power and driver speed.

### Module (`roller-chains`)

Sprocket pitch diameters; chain speed \(v = \pi d n / 60\); indicative life vs. load index.

### Module (`multi-pulley`)

Wrap angle \(\theta = \pi \mp 2 \arcsin(|D_2-D_1|/(2C))\) (open/crossed); belt length \(L = 2C + \frac{\pi(D_1+D_2)}{2} + \frac{(D_2-D_1)^2}{4C}\).

### Module (`bevel-gears`)

Lewis bending with geometry factor \(Y\); Hertzian contact stress screening; safety vs. yield.

### Module (`worm-gears`)

Ratio \(i = z_g / z_w\); efficiency \(\eta = \tan\lambda / (\tan\lambda + \mu)\); worm torque with efficiency loss.

### Module (`planetary-gears`)

Ring teeth \(z_r = z_s + 2 z_p\); ratio \(1 + z_r/z_s\); planet count from spacing.

### Module (`gear-ratio-design`)

Integer search minimizing \(|z_2/z_1 - i_\text{target}|\) subject to tooth limits.

### Module (`plain-bearings`)

Sommerfeld \(S = \mu \omega r / (W c)\); eccentricity and minimum film thickness screening.

### Module (`brakes-clutches`)

Friction torque at mean radius \(\bar r = \frac{2}{3}\frac{r_o^3-r_i^3}{r_o^2-r_i^2}\); energy per stop \(E = P \Delta t\).

### Module (`keys-splines`)

Key shear \(\tau = T/(0.5 d A_s)\); bearing \(\sigma = 2T/(d A_b)\); capacity from allowable stresses.

### Module (`shaft-hubs`)

Lamé-type contact pressure from interference \(\delta\); friction torque \(T = p \pi d L \mu d/2\).

### Module (`pins`)

Double-shear stress \(\tau = F/(n A)\); bearing on plate \(\sigma = F/(n d t)\).

### Module (`circular-plates`)

Roark coefficients: \(w_\max = \alpha p a^4 / D\), \(\sigma \propto \beta p a^2 / t^2\), flexural rigidity \(D = E t^3 / (12(1-\nu^2))\) for simply supported or clamped edge.

### Module (`rolled-sections`)

Catalog lookup — area, \(I_x\), \(I_y\), section moduli, mass per meter for W/S/C starter sections.

### Module (`formula-reference`)

Evaluates catalog formulas: kinetic energy \(E = \frac{1}{2}mv^2\), pump power \(P = Q \Delta p\), thermal expansion \(\Delta L = \alpha L \Delta T\), friction \(F = \mu N\).

### Module (`unit-converter`)

Converts via SI base layer: `toBase` / `fromBase` for length, force, stress dimensions.

### Module (`vacuum-engineering`)

Pump-down \(t=(V/S)\ln(P_0/P_t)\), molecular-flow conductance \(C \approx 12.1d^3/L\), vacuum force \(F=\Delta P A\), throughput \(Q=P_tS\).

### Module (`cryogenic-engineering`)

Conductive heat leak \(\dot Q_{cond}=kA\Delta T/L\), radiative heat leak \(\dot Q_{rad}=\epsilon\sigma A(T_h^4-T_c^4)\), boil-off and cooldown energy.

### Module (`magnetic-fields`)

Long-solenoid field \(B=\mu_0NI/L\), inductance \(\mathcal{L}=\mu_0N^2A/L\), stored energy \(E=\frac{1}{2}\mathcal{L}I^2\), Lorentz force \(F=BI\ell\).

### Module (`superconducting-systems`)

Stored energy, current margin \((I_c-I)/I_c\), temperature margin \(T_c-T_{op}\), dump voltage \(IR_d\), discharge time constant \(\mathcal{L}/R_d\).

### Module (`thermal-management`)

Parallel heat-transfer screening with conduction, convection, radiation, effective thermal resistance \(R_\theta=\Delta T/\dot Q\), and coolant rise \(\Delta T=\dot Q/(\dot m c_p)\).

### Module (`battery-ev-systems`)

Pack voltage/energy, ohmic heat generation \(\dot Q=N_sN_pR_{cell}(I/N_p)^2\), cooling flow, busbar area \(I/J_{allow}\), simple vent area.

### Module (`hydrogen-systems`)

Ideal stored hydrogen mass \(m=PVM_{H_2}/(RT)\), lower-heating energy, thin-wall hoop stress \(\sigma_\theta=Pr/t\), and orifice-flow leak screening.

### Module (`precision-motion`)

Cantilever flexure stiffness \(k=3EI/L^3\), natural frequency \(f_n=(2\pi)^{-1}\sqrt{k/m}\), thermal drift \(\Delta L=\alpha L\Delta T\), and SDOF transmissibility.

---

### 13.4 Physics & solver scope

- **No module** provides full 3D solid FEA, nonlinear material, or contact — all "FEM" labels are reduced-order (beam, shell, truss, 1D shaft).
- **Load combinations / partial factors** are user responsibility (stated in catalog assumptions).
- **Fatigue, composites, suspension** need deeper physics before raising validation tier.
- **Draft modules** (cost-estimator, cam-toolpaths) should not be used for production decisions without explicit review.

### 13.5 Testing & release

- Expand `benchmarkRunner` coverage beyond the current eight solvers.
- Wire release tier gates to CI so **beta** modules require passing benchmarks before promotion.
- `npm run validate:layout` enforces no duplicate sidebars / DashboardLayout on product pages — keep in pre-build.

### 13.6 Documentation maintenance

When adding a module:

1. Register in `src/data/modules.ts` and `moduleStandardCatalog.ts`.
2. Add `moduleMaturity` entry and `moduleProfiles` fields.
3. Follow the page contract in [Homogenization-Roadmap.md](./Homogenization-Roadmap.md).
4. Update this document's inventory table and category section.

---

*Generated from codebase review: `modules.ts`, `moduleCatalog.ts`, `moduleMaturity.ts`, `moduleProfiles.ts`, solver engines under `src/lib/**`, and product pages under `src/app/products/**`.*
