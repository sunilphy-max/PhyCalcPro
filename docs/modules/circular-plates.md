---
seoTitle: "Circular Plate Calculator — Axisymmetric Deflection & Bending Stress | PhyCalcPro"
seoDescription: "Analyze solid circular plates under uniform pressure with clamped or simply supported edges. Compute center deflection, radial bending stress, and compare FDM results against Roark benchmarks."
guideHeadline: "Circular Plates: Axisymmetric Plate Bending Engineering Guide"
keywords: ["circular plate", "axisymmetric plate", "plate deflection", "clamped plate", "Roark plate formulas", "circular plate bending", "pressure vessel flat head", "plate stress calculator", "ASME UG-34"]
---

### Circular Plates Guide (`circular-plates`)

## How engineers analyze circular plates

Circular plates appear throughout engineering: pressure vessel flat heads, flange blind covers, manhole closures, piston crowns, diaphragm sensors, and optical mirror substrates. Their axisymmetric geometry under uniform pressure produces radially symmetric deflection and stress fields, enabling elegant one-dimensional solutions that are both fast and highly accurate.

The governing equation for an axisymmetric circular plate under uniform pressure reduces from the full biharmonic to an ordinary differential equation in the radial coordinate \( r \). Roark's classical tabulated coefficients provide immediate deflection and stress answers for standard boundary conditions — clamped or simply supported outer edges. These closed-form solutions serve as verification benchmarks for numerical methods.

The PhyCalcPro circular-plates module implements a dual approach: Roark closed-form coefficients for instant benchmark values, plus an axisymmetric finite-difference solver on a radial grid for mesh-controlled accuracy and visualization of the deflection profile. The FDM-vs-Roark error percentage is reported to confirm numerical convergence.

## Boundary conditions and behavior

| Edge Condition | Constraints at \( r = a \) | Center Deflection | Max Stress Location |
|---|---|---|---|
| Clamped | \( w = 0 \), \( dw/dr = 0 \) | Small (~5x less) | Edge (radial moment) |
| Simply Supported | \( w = 0 \), \( M_r = 0 \) | Large | Center (radial moment) |

Key behavioral differences:
- **Clamped plates** develop fixed-edge moments that reduce center deflection but create high stress at the boundary.
- **Simply supported plates** allow free rotation at the edge, resulting in larger center deflection but more uniform stress distribution.
- Switching from clamped to simply supported can increase deflection by a factor of 4-5 for a given pressure.

## Engineering workflow

1. Define plate geometry: outer radius \( a \) and uniform thickness \( t \).
2. Specify material: elastic modulus \( E \) and Poisson's ratio \( \nu \).
3. Select edge boundary condition: clamped or simply supported.
4. Apply uniform transverse pressure \( p \) (positive = towards plate from one side).
5. Choose radial mesh segments (4-64; higher for convergence study).
6. Run the dual solver (Roark + FDM).
7. Compare FDM result against Roark benchmark; confirm error < 5%.
8. Check maximum deflection against allowable (e.g., L/300 of diameter).
9. Check maximum bending stress against material allowable or code limit.

## Key quantities and formulas

Axisymmetric plate governing equation:

\[
D \left( \frac{d^4 w}{dr^4} + \frac{2}{r}\frac{d^3 w}{dr^3} - \frac{1}{r^2}\frac{d^2 w}{dr^2} + \frac{1}{r^3}\frac{dw}{dr} \right) = p
\]

Flexural rigidity:

\[
D = \frac{E t^3}{12(1-\nu^2)}
\]

Clamped circular plate center deflection (Roark):

\[
w_{\max} = \frac{p a^4}{64 D} = \frac{3 p a^4 (1-\nu^2)}{16 E t^3}
\]

Simply supported center deflection:

\[
w_{\max} = \frac{(5+\nu) p a^4}{64(1+\nu) D}
\]

Maximum bending stress:

\[
\sigma_{\max} = \frac{\beta \cdot p \cdot a^2}{t^2}
\]

where \( \beta \approx 0.75 \) (clamped edge) or \( \beta \approx 1.24 \) (SS, center) for \( \nu = 0.3 \).

## Worked example

**Problem:** A clamped circular steel plate of radius 200 mm and thickness 12 mm carries 0.5 MPa uniform pressure. \( E = 200 \) GPa, \( \nu = 0.3 \). Determine maximum deflection and stress.

**Step 1 — Flexural rigidity:**

\[
D = \frac{200 \times 10^9 \times 0.012^3}{12(1-0.09)} = \frac{200 \times 10^9 \times 1.728 \times 10^{-6}}{10.92} = 31648 \text{ N-m}
\]

**Step 2 — Center deflection (clamped):**

\[
w_{\max} = \frac{p a^4}{64 D} = \frac{0.5 \times 10^6 \times 0.2^4}{64 \times 31648} = \frac{0.5 \times 10^6 \times 1.6 \times 10^{-3}}{2.026 \times 10^6} = 0.395 \text{ mm}
\]

**Step 3 — Maximum bending stress (at clamped edge):**

\[
\sigma_{\max} = \frac{0.75 \times 0.5 \times 200^2}{12^2} = \frac{15000}{144} = 104.2 \text{ MPa}
\]

Well below typical steel allowable. The plate design is adequate.

**Step 4 — FDM verification:** With 16 radial segments, FDM gives \( w = 0.393 \) mm (error = 0.5% vs Roark).

## Common mistakes and checks

- **Using simply supported coefficients for a welded plate:** A plate welded around its circumference is closer to clamped than simply supported. Using SS coefficients overestimates deflection conservatively but underestimates edge stress.
- **Exceeding thin-plate limits:** If \( t/a > 1/10 \), thick-plate (Mindlin) effects become significant. The module assumes thin Kirchhoff theory.
- **Large deflection regime:** When \( w_{\max} > 0.5t \), membrane stretching stiffens the plate. Linear theory overestimates deflection in this regime.
- **Ignoring thermal loads:** Circular plates in hot environments (exhaust covers, boiler heads) develop thermal stresses not captured by pressure-only analysis.
- **Low mesh density:** Fewer than 8 radial segments can produce >5% error vs Roark. Always verify convergence.

## FAQ

### What is the FDM-Roark error percentage?

It measures how closely the finite-difference numerical solution matches Roark's exact closed-form result. Error below 2% confirms the mesh is adequately refined. Higher errors prompt increasing `meshSegments`.

### Can I analyze annular plates (with a central hole)?

The current module solves solid circular plates. Annular plates have different boundary conditions at the inner radius and require modified Roark coefficients. This is a planned enhancement.

### How do I model a bolted flange cover?

A bolted cover with a gasket is partially constrained — between clamped and simply supported. Analyze both extremes and use the more conservative result. The bolt circle radius defines the effective plate radius.

### When should I use ASME UG-34 instead of this module?

ASME UG-34 provides mandatory rules for pressure vessel flat heads with specific attachment details and stress intensification factors. Use UG-34 for code-stamped vessels; use this module for preliminary sizing and non-code applications.

### What Poisson's ratio should I use?

Steel: 0.3; aluminum: 0.33; copper: 0.34; glass: 0.22; concrete: 0.15-0.20. The value significantly affects the simply supported solution but has less impact on the clamped case.

### How does plate thickness affect deflection?

Deflection scales as \( 1/t^3 \) (through the rigidity \( D \)). Doubling thickness reduces deflection by a factor of 8 — making thickness the most powerful design lever for plate stiffness.

## Use the PhyCalcPro calculator

[Open the Circular Plates calculator](/products/structural/circular-plates)

**Purpose**

Compute deflection and bending stress in solid circular plates under uniform transverse pressure with clamped or simply supported outer edges. Combines Roark closed-form benchmarks with an axisymmetric finite-difference solver for mesh-controlled accuracy.

**Physics & theory**

Axisymmetric circular plates under uniform pressure exhibit radially symmetric deflection \( w(r) \). Flexural rigidity \( D = Et^3/[12(1-\nu^2)] \) scales resistance. Roark's coefficients give quick screening; the FDM solver provides convergence-verified numerical results. Clamped plates deflect ~5x less than simply supported.

**Governing equations**

\[
D \left( \frac{d^4 w}{dr^4} + \frac{2}{r}\frac{d^3 w}{dr^3} - \frac{1}{r^2}\frac{d^2 w}{dr^2} + \frac{1}{r^3}\frac{dw}{dr} \right) = p, \quad \sigma_{\max} = \frac{\beta p a^2}{t^2}
\]

**Numerical method**

Dual approach: (1) Roark closed-form coefficients for benchmark comparison; (2) axisymmetric Kirchhoff FDM on a radial line with configurable segments (4-64). Jacobi-style iteration enforces boundary conditions. FDM-vs-Roark error percentage is reported for convergence verification.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `radius` | Outer plate radius \( a \) |
| `thickness` | Plate thickness \( t \) |
| `modulus`, `poisson` | \( E \), \( \nu \) |
| `pressure` | Uniform transverse pressure \( p \) |
| `boundary` | `clamped` or `simply_supported` |
| `meshSegments` | Radial FDM segments (default 12) |

**Outputs**

- Maximum deflection and bending stress
- Flexural rigidity \( D \)
- Roark benchmark values
- FDM-Roark error percentage
- Radial deflection profile

**Design codes & checks**

- **Indicative:** Plate deflection and bending stress screening
- **US:** ASME BPVC UG-34 flat head context (screening)
- **EU:** EN 13445 flat ends (screening)

**Assumptions & limitations**

- Solid circular plate; annular plates use simplified extensions only.
- Thin Kirchhoff plate theory; no transverse shear deformation.
- Uniform pressure only; no point loads or thermal gradients.
- Linear elastic, small deflection (\( w < 0.5t \)).

**Verification**

- CI: `circular-plates-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed., Table 11.2.
2. Timoshenko, S., & Woinowsky-Krieger, S. *Theory of Plates and Shells*, 2nd ed. McGraw-Hill.
3. Ugural, A. C. *Stresses in Plates and Shells*, 4th ed. CRC Press.
4. ASME BPVC Section VIII, Division 1, UG-34.
5. EN 13445-3:2021. *Unfired pressure vessels — Part 3: Design*.
