### Circular Plates (`circular-plates`)

**Purpose**

Compute deflection and bending stress in solid circular plates under uniform transverse pressure with simply supported or clamped outer edges. Combines Roark closed-form benchmarks with an axisymmetric finite-difference solver for mesh-controlled accuracy.

**Physics & theory**

Axisymmetric circular plates under uniform pressure \( p \) exhibit radially symmetric deflection \( w(r) \). Flexural rigidity is \( D = Et^3/[12(1-\nu^2)] \). For a clamped edge (\( w=0 \), \( dw/dr=0 \) at \( r=a \)), peak deflection at center scales as \( w_{\max} \propto pa^4/D \); for simply supported edges, boundary moments vanish and deflection is larger.

Roark's tabulated coefficients provide quick screening: clamped plate \( w_{\max} = \alpha pa^4/D \) with \( \alpha \approx 0.0138 \); simply supported \( \alpha \approx 0.171 \). Maximum bending stress at the surface follows \( \sigma \approx \beta pa^2/t^2 \) with \( \beta \approx 0.75 \) for uniform pressure.

The axisymmetric FDM solver discretizes the biharmonic operator on a radial grid, iterating until convergence between applied pressure and plate curvature.

Boundary conditions define the kinematic constraints at supports. Fixed ends restrain both translation and rotation; pinned supports restrain translation only; roller supports allow horizontal movement. The choice of support model directly affects moment distribution — a fixed–fixed beam carries less mid-span moment than a simply supported beam under the same UDL but develops significant hogging moments at supports.

Load types include concentrated forces, uniformly distributed segments, and applied couples. Multiple loads superpose linearly in elastic analysis. The module validates positive geometry (length, stiffness, section properties) before invoking the solver and rejects empty load lists.

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

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Design practice note**

Screening results from this module inform preliminary sizing and design reviews. Final designs subject to applicable regulations, customer specifications, and qualified engineering approval should use full code-compliant methods, manufacturer data, and test validation beyond the indicative checks shown in PhyCalcPro.

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
