### Circular Plates (`circular-plates`)

**Purpose**

Compute deflection and bending stress in solid circular plates under uniform transverse pressure with simply supported or clamped outer edges. Combines Roark closed-form benchmarks with an axisymmetric finite-difference solver for mesh-controlled accuracy.

**Physics & theory**

Axisymmetric circular plates under uniform pressure \( p \) exhibit radially symmetric deflection \( w(r) \). Flexural rigidity is \( D = Et^3/[12(1-\nu^2)] \). For a clamped edge (\( w=0 \), \( dw/dr=0 \) at \( r=a \)), peak deflection at center scales as \( w_{\max} \propto pa^4/D \); for simply supported edges, boundary moments vanish and deflection is larger.

Roark's tabulated coefficients provide quick screening: clamped plate \( w_{\max} = \alpha pa^4/D \) with \( \alpha \approx 0.0138 \); simply supported \( \alpha \approx 0.171 \). Maximum bending stress at the surface follows \( \sigma \approx \beta pa^2/t^2 \) with \( \beta \approx 0.75 \) for uniform pressure.

The axisymmetric FDM solver discretizes the biharmonic operator on a radial grid, iterating until convergence between applied pressure and plate curvature.

Outer-edge support is modeled as either clamped (\( w=0 \), \( dw/dr=0 \) at \( r=a \)) or simply supported (\( w=0 \), \( M_r=0 \) at \( r=a \)). Switching between these edge conditions changes center deflection by an order of magnitude and shifts the location of peak bending stress from center to edge.

The solver requires positive radius, thickness, and flexural rigidity; non-axisymmetric loading and annular plates are outside scope.

**Governing equations**

\[
D \left( \frac{d^4 w}{dr^4} + \frac{2}{r}\frac{d^3 w}{dr^3} - \frac{1}{r^2}\frac{d^2 w}{dr^2} + \frac{1}{r^3}\frac{dw}{dr} \right) = p
\]

\[
D = \frac{E t^3}{12(1-\nu^2)}
\]

\[
\sigma_{\max} = \frac{\beta p a^2}{t^2}
\]

**Numerical method**

Dual approach: (1) Roark closed-form coefficients for benchmark comparison; (2) axisymmetric Kirchhoff FDM on a radial line with `meshSegments` (4–64). Jacobi-style iteration (~800 steps) enforces boundary conditions. FEM deflection error vs Roark is reported as `femDeflectionErrorPercent`.

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

- Maximum deflection and stress, flexural rigidity \( D \)
- Roark benchmark values
- FEM–Roark error percentage, mesh segment count.

**Design codes & checks**

- **Indicative:** Plate deflection and bending stress screening
- **US:** ASME BPVC UG-34 flat head context (screening)
- **EU:** EN 13445 flat ends (screening)


**Assumptions & limitations**

- Solid circular plate; annular plates use simplified extensions only.
- Thin Kirchhoff plate theory; no transverse shear deformation.
- Uniform pressure; no point loads or thermal gradients.
- Linear elastic, small deflection.

**References**

1. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed., Case 11.
2. Timoshenko, S., & Woinowsky-Krieger, S. *Theory of Plates and Shells*, 2nd ed.
3. Ugural, A. C. *Stresses in Plates and Shells*, 4th ed.
4. ASME BPVC Section VIII, Division 1, UG-34.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
