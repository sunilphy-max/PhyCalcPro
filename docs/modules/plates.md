---
seoTitle: "Plate Bending Calculator — Rectangular Plate Deflection & Stress | PhyCalcPro"
seoDescription: "Analyze thin rectangular plates under uniform pressure with simply supported, clamped, or free edges. Compute maximum deflection, bending moments, and stresses using Kirchhoff plate FEM."
guideHeadline: "Plate Bending: Rectangular Plate Analysis Engineering Guide"
keywords: ["plate bending", "rectangular plate", "Kirchhoff plate theory", "plate deflection", "plate stress", "biharmonic equation", "plate FEM", "pressure vessel flat plate", "ASME plate"]
---

### Plate Bending Guide (`plates`)

## How engineers analyze flat plates

Flat plates are two-dimensional structural elements that resist transverse loading through bending — appearing as machinery housings, pressure vessel covers, floor panels, electronic enclosures, and structural decks. Unlike beams that bend in one plane, plates develop bending moments in two orthogonal directions simultaneously, creating a biaxial stress state that requires careful analysis.

Kirchhoff-Love plate theory extends Euler-Bernoulli beam bending to two dimensions. The governing biharmonic equation \( D\nabla^4 w = p \) relates plate deflection \( w(x,y) \) to transverse pressure \( p \) through the flexural rigidity \( D = Et^3/[12(1-\nu^2)] \). Edge boundary conditions — simply supported, clamped, or free — profoundly influence both the deflection magnitude and the distribution of bending moments.

For rectangular plates with all edges simply supported, the Navier double Fourier series provides an exact analytical solution. Mixed boundary conditions (e.g., two edges clamped, two free) require numerical methods. The PhyCalcPro plates module uses finite-element plate elements on a structured rectangular mesh to handle arbitrary edge condition combinations.

## Edge conditions and their effects

| Edge Condition | Description | Effect on Center Deflection |
|---|---|---|
| All Simply Supported (SSSS) | Translation restrained, rotation free | Baseline deflection |
| All Clamped (CCCC) | Translation and rotation restrained | ~5x less than SSSS |
| Two Clamped + Two SS | Mixed | Intermediate |
| One Free Edge | No restraint on one side | Significantly larger deflection |
| All Free (on elastic foundation) | Springs only | Requires foundation stiffness |

## Engineering workflow

1. Define plate geometry: length \( a \), width \( b \), thickness \( t \).
2. Specify material: elastic modulus \( E \) and Poisson's ratio \( \nu \).
3. Set edge boundary conditions independently for all four edges.
4. Apply transverse loading: uniform pressure or concentrated point loads.
5. Choose mesh density (more segments = more accuracy near stress concentrations).
6. Run the plate FEM solver.
7. Review deflection contour: confirm maximum is within the allowable limit.
8. Check bending stresses: compare peak \( \sigma_x \) and \( \sigma_y \) against material allowable.
9. For pressure vessel applications, verify against ASME BPVC or EN 13445 flat plate rules.

## Key quantities and formulas

\[
D \nabla^4 w = p, \quad D = \frac{E t^3}{12(1-\nu^2)}
\]

Bending moments per unit width:

\[
M_x = -D\left(\frac{\partial^2 w}{\partial x^2} + \nu \frac{\partial^2 w}{\partial y^2}\right)
\]

\[
M_y = -D\left(\frac{\partial^2 w}{\partial y^2} + \nu \frac{\partial^2 w}{\partial x^2}\right)
\]

Surface bending stress:

\[
\sigma_x = \frac{6 M_x}{t^2}, \quad \sigma_y = \frac{6 M_y}{t^2}
\]

Navier solution for SSSS plate under uniform pressure \( p \):

\[
w_{\max} = \frac{\alpha p a^4}{D}
\]

where \( \alpha \) depends on aspect ratio \( a/b \) (e.g., \( \alpha \approx 0.00406 \) for a square plate).

## Worked example

**Problem:** A square steel plate 500 mm x 500 mm, thickness 10 mm, all edges clamped, subjected to 0.1 MPa uniform pressure. \( E = 200 \) GPa, \( \nu = 0.3 \). Find maximum deflection and stress.

**Step 1 — Flexural rigidity:**

\[
D = \frac{200 \times 10^3 \times 10^3}{12(1-0.3^2)} = \frac{200 \times 10^6}{10.92} = 18315 \text{ N-m}
\]

**Step 2 — Maximum deflection (clamped square plate, Roark coefficient \( \alpha = 0.00126 \)):**

\[
w_{\max} = \frac{0.00126 \times 0.1 \times 500^4}{18315 \times 10^6} = \frac{0.00126 \times 0.1 \times 6.25 \times 10^{10}}{18315 \times 10^6} = 0.043 \text{ mm}
\]

**Step 3 — Maximum bending stress (center, Roark coefficient \( \beta = 0.0513 \)):**

\[
\sigma_{\max} = \frac{\beta \cdot p \cdot a^2}{t^2} = \frac{0.0513 \times 0.1 \times 500^2}{10^2} = 12.8 \text{ MPa}
\]

Well below typical steel allowable (150+ MPa). The 10 mm plate is adequate.

## Common mistakes and checks

- **Violating thin-plate assumptions:** Kirchhoff theory requires \( t/a < 1/20 \). For thick plates, transverse shear deformation becomes significant and Mindlin-Reissner theory is needed.
- **Confusing plate and membrane behavior:** Large deflections (> 0.5t) engage membrane stretching that dramatically stiffens the plate. The linear solver will overestimate deflections in this regime.
- **Ignoring Poisson coupling:** Unlike beams, plates develop transverse moments due to Poisson's ratio. A plate bent about x also develops \( M_y = \nu M_x \).
- **Underestimating corner effects:** Clamped plates develop stress concentrations at corners; ensure mesh is fine enough near boundaries.
- **Applying wrong boundary conditions:** A bolted plate edge behaves between simply supported and clamped depending on bolt spacing and flange stiffness.

## FAQ

### When is thin-plate theory valid?

When plate thickness is less than 1/20 of the shorter span dimension. Below this ratio, transverse shear deformation contributes less than 5% to deflection.

### How does aspect ratio affect plate behavior?

As a plate becomes long and narrow (\( a/b > 3 \)), it approaches cylindrical bending where the center strip behaves like a beam spanning the shorter direction. One-way plate strip theory then gives adequate results.

### Can I analyze plates with stiffeners?

Not directly — the module solves unstiffened flat plates. Model stiffened plates as equivalent orthotropic plates with modified rigidities, or analyze the plate panel between stiffeners separately.

### What is the difference between this module and the circular plates module?

This module handles rectangular plates with per-edge boundary conditions. The circular plates module is specialized for axisymmetric round plates with radial symmetry, using different governing equations and solution methods.

### How do I handle a plate with a central hole?

The current solver does not support plates with cutouts. For plates with holes, apply stress concentration factors from Roark's tables to the peak stress results, or use full 2D FEA software.

## Use the PhyCalcPro calculator

[Open the Plate Bending calculator](/products/structural/plates)

**Purpose**

Analyze bending of thin rectangular plates under uniform pressure or point loads with various edge boundary conditions. Computes maximum deflection, bending moments, and stresses for flat plate components in machinery housings, panels, and structural decks.

**Physics & theory**

Kirchhoff-Love plate theory extends beam bending to two dimensions. Flexural rigidity \( D = Et^3/[12(1-\nu^2)] \) and the biharmonic equation \( D\nabla^4 w = p \) govern out-of-plane deflection. Bending moments relate to curvature; maximum stress at the surface is \( \sigma = 6M/t^2 \). Edge conditions strongly influence peak deflection and stress.

**Governing equations**

\[
D \nabla^4 w = p, \quad \sigma_x = \frac{6 M_x}{t^2}, \quad \sigma_y = \frac{6 M_y}{t^2}
\]

**Numerical method**

2D plate FEM on a structured rectangular mesh. Kirchhoff or Mindlin-Reissner plate elements assemble stiffness from \( D \) and mesh geometry. Transverse loads are applied as consistent nodal forces. The linear system yields nodal deflections; moments and stresses are recovered by differentiation of shape functions.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length`, `width` | Plate plan dimensions |
| `thickness` | Plate thickness \( t \) |
| `E`, `nu` | Elastic modulus and Poisson's ratio |
| `pressure` | Uniform transverse load |
| Boundary conditions | Per-edge SS, clamped, or free |
| `meshSegments` | Discretization along each axis |

**Outputs**

- Deflection field \( w(x,y) \) and maximum deflection
- Bending moments \( M_x \), \( M_y \)
- Maximum bending stress
- Utilization vs allowable stress and deflection limits

**Design codes & checks**

- **Indicative:** Plate bending stress and deflection screening
- **US:** ASME BPVC Section VIII, Div. 1 flat plate rules (screening)
- **EU:** EN 13445 flat ends and plates (screening)

**Assumptions & limitations**

- Thin plate theory (\( t/L < 1/20 \) typically); thick-plate shear deformation not included.
- Linear elastic, small deflection (deflection < 0.5t).
- Flat plate only; no stiffeners or large membrane stretching.
- Rectangular geometry only; no irregular shapes or cutouts.

**Verification**

- CI: verification benchmarks in `src/data/verification/` where available
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Timoshenko, S., & Woinowsky-Krieger, S. *Theory of Plates and Shells*, 2nd ed. McGraw-Hill.
2. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed.
3. Ugural, A. C. *Stresses in Plates and Shells*, 4th ed. CRC Press.
4. ASME BPVC Section VIII, Division 1 (flat plate design rules).
5. EN 13445-3:2021. *Unfired pressure vessels — Part 3: Design*.
