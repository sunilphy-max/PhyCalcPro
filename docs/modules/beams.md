---
seoTitle: "Beam Analysis Calculator — Shear, Moment, Deflection & Stress | PhyCalcPro"
seoDescription: "Analyze simply supported, cantilever, and fixed beams under point loads, UDL, and moments. Get shear force, bending moment, deflection, and stress diagrams with AISC 360 and Eurocode 3 checks."
guideHeadline: "Beam Analysis: Shear, Moment & Deflection Engineering Guide"
keywords: ["beam analysis", "shear force diagram", "bending moment diagram", "beam deflection", "Euler-Bernoulli beam", "beam stress calculator", "AISC 360 beam", "simply supported beam", "cantilever beam"]
---

### Beam Analysis Guide (`beams`)

## How engineers analyze beams

Beams are the most fundamental structural element in engineering, carrying transverse loads across a span and transferring them to supports through shear and bending. Every building floor, bridge deck, crane runway, and machine frame relies on beam behavior. Engineers analyze beams to determine internal forces (shear and moment), deformations (slope and deflection), and stresses (bending and shear) — ensuring no limit state is exceeded under the design loading.

The classical approach uses Euler-Bernoulli beam theory, which relates transverse deflection to applied loading through a fourth-order differential equation. For simple geometries and loads, closed-form solutions give immediate answers: a simply supported beam with a central point load has maximum moment \( M = PL/4 \) and peak deflection \( \delta = PL^3/(48EI) \). Real structures, however, have multiple loads, mixed supports, and variable sections that demand numerical methods.

Modern practice employs finite-element discretization of the beam with Hermite cubic shape functions, enforcing displacement and slope continuity at nodes. This handles arbitrary combinations of point loads, distributed loads, and applied moments with any support configuration. The PhyCalcPro beams module implements exactly this workflow: mesh the span, assemble stiffness matrices, solve for nodal displacements, then post-process for diagrams and peak values.

Design verification then compares computed stresses and deflections against code limits. In steel design, AISC 360 Chapter F governs flexural capacity, Chapter G governs shear, and serviceability deflection limits are typically L/240 to L/360. Eurocode 3 (EN 1993-1-1 Section 6.2) uses partial safety factors on resistance. The module provides screening checks against both standards.

## Beam types and when to use each

| Support Type | Boundary Conditions | Typical Use |
|---|---|---|
| Simply Supported | Pin + roller (translation restrained, rotation free) | Floor beams, bridge girders, simple machine frames |
| Cantilever | Fixed end + free tip | Balconies, signposts, overhanging crane arms |
| Fixed-Fixed | Both ends fully restrained | Continuous spans, rigid welded frames |
| Propped Cantilever | Fixed + roller | Indeterminate beams requiring compatibility |
| Continuous | Multiple interior supports | Multi-span bridge girders, building frames |

Cross-section types typically analyzed:
- **I/H sections (IPE, HEB, W-shapes)** — most efficient for bending; wide flanges resist moment, thin web carries shear.
- **Channel sections (UPN, C-shapes)** — used where one-sided connections are needed; asymmetric bending requires shear center consideration.
- **Rectangular hollow sections (RHS)** — good torsional resistance; used in machine frames and architectural applications.
- **Solid rectangular bars** — simple fabrication; common in machinery and custom equipment.
- **Circular hollow sections (CHS)** — equal strength in all bending directions; used for crane booms and space frames.

Loading types handled by the module:

- **Point loads** — concentrated forces at specified positions (equipment mounts, wheel loads)
- **Uniformly distributed loads (UDL)** — self-weight, floor live load, snow
- **Applied moments** — eccentric connections, torque reactions

## Design code deflection and stress limits

Beam adequacy is governed by two independent limit states:
- **Strength (ULS):** Bending stress must remain below the factored resistance — \( \sigma \leq \phi M_n / S \) (AISC) or \( M_{Ed} \leq M_{c,Rd} \) (Eurocode).
- **Serviceability (SLS):** Deflection under unfactored loads must not exceed application-specific limits to prevent damage to finishes, vibration issues, or aesthetic concerns.

Both must be satisfied simultaneously. A beam may pass strength checks but fail on deflection (common for long spans with light loads), or vice versa.

## Engineering workflow

1. Define geometry: span length, cross-section properties (I, c, area), and material (E, yield strength).
2. Select support configuration: simply supported, cantilever, or fixed-fixed.
3. Apply loads: point forces at known positions, UDL over full or partial span, applied moments.
4. Choose design context: application preset (lifting beam, crane bridge, machine frame) sets default load factors and deflection limits.
5. Run the FEM solver with adequate mesh density (minimum 20 segments recommended for accurate peak values near point loads).
6. Review diagrams: inspect shear force, bending moment, deflection, and stress plots along the span.
7. Check peak values: compare maximum bending stress against allowable, maximum deflection against serviceability limits.
8. Verify equilibrium: confirm the static equilibrium residual is near zero.
9. Iterate if needed: adjust section size, add supports, or redistribute loads until all checks pass.

## Key quantities and formulas

\[
EI \frac{d^4 w}{dx^4} = q(x)
\]

\[
V(x) = \frac{dM}{dx}, \quad q(x) = \frac{dV}{dx}
\]

\[
\sigma_{\max} = \frac{M_{\max} \cdot c}{I}
\]

\[
\tau_{\max} = \frac{V_{\max} Q}{I b}
\]

For a simply supported beam with central point load \( P \):

\[
M_{\max} = \frac{PL}{4}, \quad \delta_{\max} = \frac{PL^3}{48EI}
\]

For a cantilever with tip load \( P \):

\[
M_{\max} = PL, \quad \delta_{\max} = \frac{PL^3}{3EI}
\]

For a UDL \( w \) on a simply supported span:

\[
M_{\max} = \frac{wL^2}{8}, \quad \delta_{\max} = \frac{5wL^4}{384EI}
\]

Deflection limit check:

\[
\delta_{\max} \leq \frac{L}{\text{deflectionLimitRatio}}
\]

## Worked example

**Problem:** A simply supported steel beam spans 6 m and carries a central point load of 50 kN. The section is an IPE 300 with \( I = 8356 \times 10^{-8} \) m\(^4\), \( c = 0.15 \) m, and \( E = 210 \) GPa. Check bending stress and deflection against L/300.

**Step 1 — Reactions:**

\[
R_A = R_B = \frac{P}{2} = \frac{50}{2} = 25 \text{ kN}
\]

**Step 2 — Maximum moment (mid-span):**

\[
M_{\max} = \frac{PL}{4} = \frac{50 \times 6}{4} = 75 \text{ kN-m}
\]

**Step 3 — Bending stress:**

\[
\sigma = \frac{M c}{I} = \frac{75 \times 10^3 \times 0.15}{8356 \times 10^{-8}} = 134.6 \text{ MPa}
\]

This is below S275 yield (275 MPa) — utilization = 134.6/275 = 0.49, acceptable.

**Step 4 — Deflection:**

\[
\delta = \frac{PL^3}{48EI} = \frac{50 \times 10^3 \times 6^3}{48 \times 210 \times 10^9 \times 8356 \times 10^{-8}} = 12.8 \text{ mm}
\]

Allowable: \( L/300 = 6000/300 = 20 \) mm. Actual 12.8 mm < 20 mm — pass.

## Common mistakes and checks

- **Insufficient mesh density:** Using fewer than 20 segments underestimates peak stress near concentrated loads; always verify convergence by doubling segments.
- **Wrong sign convention:** PhyCalcPro uses sagging-positive for moments; mixing conventions causes incorrect shear diagram interpretation.
- **Ignoring shear deformation:** Euler-Bernoulli theory neglects shear deformation; for deep beams (span/depth < 10), Timoshenko theory is more appropriate.
- **Overlooking lateral-torsional buckling:** High bending stress alone does not confirm adequacy; unbraced compression flanges require LTB checks per AISC F2 or EN 1993-1-1 Section 6.3.
- **Using the wrong I-value:** The second moment of area must be about the bending axis; using the wrong axis gives non-conservative results.
- **Neglecting self-weight:** For long spans with light applied loads, beam self-weight can dominate deflection.
- **Applying building-code deflection limits to machinery:** L/360 is for floor beams with plaster ceilings; crane runways and machine frames use different criteria.

## FAQ

### What mesh density should I use?

A minimum of 20 segments is recommended for typical beams. For beams with multiple closely-spaced point loads or steep moment gradients, use 40-80 segments. The solver reports warnings when mesh is too coarse.

### Can I analyze non-prismatic (tapered) beams?

The current solver assumes a prismatic (constant) cross-section along the span. For tapered beams, use the average or critical-section properties as an approximation, or subdivide into piecewise-prismatic segments.

### How does the module handle overhanging beams?

Overhangs are modeled as cantilever extensions beyond a support. Define a simply supported span with loads placed beyond one support to simulate an overhang.

### What is the static equilibrium residual?

It is the numerical difference between total applied vertical load and the sum of computed reactions. A residual near machine precision (< 0.001% of applied load) confirms the solver produced a valid equilibrium solution.

### When should I use fixed-fixed vs simply supported?

Use fixed-fixed when both ends are rigidly welded to stiff columns or walls that prevent rotation. If connections allow any rotation (bolted end plates, bearing pads), simply supported is more appropriate and gives conservative (higher) mid-span moments.

### Does the module account for dynamic loads?

No — the solver performs static analysis only. For impact or vibration, apply a dynamic amplification factor (DAF) to static loads before input, per your governing standard (e.g., DAF = 1.25 for crane hoists per EN 13001).

### How do deflection limits vary by application?

| Application | Typical Limit |
|---|---|
| Floor beams (plaster ceiling) | L/360 |
| Floor beams (no brittle finishes) | L/240 |
| Crane runway beams | L/600 to L/1000 |
| Machine tool beds | L/1000+ |
| Roof purlins | L/180 to L/240 |

Always verify the governing standard for your specific application.

## Use the PhyCalcPro calculator

[Open the Beam Analysis calculator](/products/structural/beams)

**Purpose**

Analyze one-dimensional prismatic beams under point loads, uniformly distributed loads, and applied moments. Computes shear force, bending moment, slope, deflection, and bending stress along the span, then compares results against allowable stress and deflection limits with optional AISC 360 and EN 1993-1-1 screening checks.

**Physics & theory**

Euler-Bernoulli beam theory relates curvature to bending moment through \( \kappa = M/(EI) \). For small deflections, the governing ODE is \( EI\,d^4w/dx^4 = q(x) \), with boundary conditions set by support type. Shear force and moment are obtained by equilibrium; bending stress at distance \( c \) from the neutral axis follows \( \sigma = Mc/I \). Application presets (lifting beam, machine frame, crane bridge) adjust load factor, allowable stress ratio, and deflection limit.

**Governing equations**

\[
EI \frac{d^4 w}{dx^4} = q(x), \quad \sigma_{\max} = \frac{M_{\max} c}{I}, \quad \delta_{\mathrm{limit}} = \frac{L}{\mathrm{deflectionLimitRatio}}
\]

**Numerical method**

1D beam FEM: the span is meshed into configurable segments. Hermite shape function stiffness matrices are assembled for the selected support condition, loads are mapped to the global force vector, and the linear system is solved for nodal displacements and rotations. Post-processing yields shear, moment, slope, deflection, and stress along the span.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length` | Beam span \( L \) |
| `E`, `I`, `c` | Elastic modulus, second moment of area, extreme fiber distance |
| `support` | `simply_supported`, `cantilever`, or `fixed_fixed` |
| `loads` | Point, UDL, or moment load cases |
| `meshSegments` | FEM discretization count (default 20+) |
| Design code / application preset | Load factor, allowable stress, deflection ratio |

**Outputs**

- Shear \( V(x) \), moment \( M(x) \), slope, deflection \( w(x) \), stress \( \sigma(x) \) diagrams
- Peak values: `maxShear`, `maxMoment`, `maxDeflection`, `maxStress` with location
- Support reactions and moments
- Static equilibrium residual from `physicsChecks`
- Code checks: bending utilization, shear utilization, LTB utilization, deflection utilization

**Design codes & checks**

- **Indicative:** Roark / Euler-Bernoulli beam theory
- **US:** ASME BTH-1, B30.20 (lifting); AISC 360 Ch. F/G (stress and deflection)
- **EU:** EN 13001, FKM; EN 1993-1-1 Section 6.2
- **ISO:** ISO 8686, ISO 12100

**Assumptions & limitations**

- Linear elastic, prismatic cross-section; no large deflection or plasticity.
- 1D beam model — not a full building-code member design check.
- LTB uses simplified unbraced length = span unless overridden.
- Shear check uses rectangular-web estimate from \( I \) and \( c \).
- Application presets adjust targets but do not implement full standard clauses.

**Verification**

- CI: `beams-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed. McGraw-Hill.
2. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed. Cengage.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22).
4. EN 1993-1-1:2005. *Eurocode 3 — Design of steel structures — Part 1-1*.
5. Cook, R. D., et al. *Concepts and Applications of Finite Element Analysis*, 4th ed. Wiley.
6. Hibbeler, R. C. *Structural Analysis*, 10th ed. Pearson.
7. Timoshenko, S. P. *Strength of Materials*, Part I, 3rd ed. Van Nostrand.
