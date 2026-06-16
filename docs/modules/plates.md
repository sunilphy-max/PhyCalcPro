### Plate Bending (`plates`)

**Purpose**

Analyze bending of thin rectangular plates under uniform pressure or point loads with various edge boundary conditions. Computes maximum deflection, bending moments, and membrane/bending stresses for flat plate components in machinery housings, panels, and structural decks.

**Physics & theory**

Kirchhoff–Love plate theory extends beam bending to two dimensions. For a thin plate of thickness \( t \), flexural rigidity is \( D = Et^3/[12(1-\nu^2)] \). The biharmonic equation \( D \nabla^4 w = p \) governs out-of-plane deflection \( w(x,y) \) under transverse pressure \( p \).

Bending moments relate to curvature: \( M_x = -D(\partial^2 w/\partial x^2 + \nu \partial^2 w/\partial y^2) \). Maximum stress at the surface is \( \sigma = 6M/t^2 \) for pure bending. Edge conditions — simply supported (SS), clamped (C), or free — strongly influence peak deflection and stress concentration at corners.

For rectangular plates, Navier or Levy series solutions exist for simply supported edges; the solver uses a finite-element discretization on a rectangular mesh for general boundary mixes.

Boundary conditions define the kinematic constraints at supports. Fixed ends restrain both translation and rotation; pinned supports restrain translation only; roller supports allow horizontal movement. The choice of support model directly affects moment distribution — a fixed–fixed beam carries less mid-span moment than a simply supported beam under the same UDL but develops significant hogging moments at supports.

Load types include concentrated forces, uniformly distributed segments, and applied couples. Multiple loads superpose linearly in elastic analysis. The module validates positive geometry (length, stiffness, section properties) before invoking the solver and rejects empty load lists.

**Governing equations**

\[
D \nabla^4 w = p, \quad D = \frac{E t^3}{12(1-\nu^2)}
\]

\[
\sigma_x = \frac{6 M_x}{t^2}, \quad \sigma_y = \frac{6 M_y}{t^2}
\]

\[
w_{\max} \leq w_{\mathrm{allow}}
\]

**Numerical method**

2D plate FEM on a structured rectangular mesh (`femSolver`). Mindlin–Reissner or Kirchhoff plate elements assemble stiffness from \( D \) and mesh geometry. Transverse loads are applied as consistent nodal forces. The linear system yields nodal deflections; moments and stresses are recovered by differentiation of shape functions.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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

- Deflection field \( w(x,y) \), maximum deflection, bending moments \( M_x
- M_y \), maximum bending stress, utilization vs allowable stress and deflection limits.

**Design codes & checks**

- **Indicative:** Plate bending stress and deflection screening
- **US:** ASME BPVC Section VIII, Div. 1 flat plate context (screening)
- **EU:** EN 13445 flat ends and plates (screening)

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

- Thin plate theory (\( t/L < 1/20 \) typically); thick-plate shear deformation not included.
- Linear elastic, small deflection.
- Flat plate only; no stiffeners or large membrane stretching.
- Fewer centralized validation benchmarks than beam/column modules.

**References**

1. Timoshenko, S., & Woinowsky-Krieger, S. *Theory of Plates and Shells*, 2nd ed. McGraw-Hill.
2. Roark, R. J., Young, W. C., & Budynas, R. G. *Formulas for Stress and Strain*, 8th ed.
3. Ugural, A. C. *Stresses in Plates and Shells*, 4th ed. CRC Press.
4. ASME BPVC Section VIII, Division 1 (flat plate design rules).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
