### Column Buckling (`columns`) — **beta**

**Purpose**

Evaluate elastic stability of slender compression members using finite-element buckling analysis and compare applied axial load to Euler critical load and code column curves. Supports fixed, pinned, and guided end conditions with optional initial imperfection for practical capacity estimates.

**Physics & theory**

When a straight column is compressed, lateral deflection grows once the axial load exceeds the critical value. Euler's formula for a pinned-pinned column gives \( P_{\mathrm{cr}} = \pi^2 EI/L_{\mathrm{eff}}^2 \), where \( L_{\mathrm{eff}} = K L \) depends on end restraint through the effective length factor \( K \).

Real columns fail below \( P_{\mathrm{cr}} \) due to residual stresses, initial curvature, and material yield interaction. Design codes replace pure Euler buckling with column curves relating normalized slenderness \( \lambda \) to buckling reduction factor \( \chi \). The FEM solver assembles a geometric stiffness matrix \( \mathbf{K}_g \) proportional to axial load and solves the eigenvalue problem \( (\mathbf{K} + \lambda \mathbf{K}_g)\mathbf{v} = 0 \) for buckling modes.

Boundary conditions define the kinematic constraints at supports. Fixed ends restrain both translation and rotation; pinned supports restrain translation only; roller supports allow horizontal movement. The choice of support model directly affects moment distribution — a fixed–fixed beam carries less mid-span moment than a simply supported beam under the same UDL but develops significant hogging moments at supports.

Load types include concentrated forces, uniformly distributed segments, and applied couples. Multiple loads superpose linearly in elastic analysis. The module validates positive geometry (length, stiffness, section properties) before invoking the solver and rejects empty load lists.

**Governing equations**

\[
P_{\mathrm{cr}} = \frac{\pi^2 EI}{L_{\mathrm{eff}}^2}
\]

\[
\lambda = \frac{L_{\mathrm{eff}}}{i}, \quad i = \sqrt{I/A}
\]

\[
\frac{P}{P_{\mathrm{cr}}} \leq \frac{1}{\mathrm{SF}}, \quad \chi \frac{A f_y}{\gamma_M} \geq N_{\mathrm{Ed}}
\]

**Numerical method**

Linear buckling FEM (`femSolver`): the column is meshed along its length. Elastic stiffness \( \mathbf{K} \) and geometric stiffness \( \mathbf{K}_g(P) \) are assembled for the selected end conditions. The lowest positive eigenvalue yields critical load and buckling mode shape. Post-processing compares \( P/P_{\mathrm{cr}} \) to AISC 360 §E3 and EN 1993-1-1 §6.3 curve checks.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `length` | Member length \( L \) |
| `E`, `I`, `A` | Material and section properties |
| `P` | Applied axial compressive load |
| End conditions | Effective length factor or fixity |
| `fy` | Yield strength for code curves |
| Design code | US (AISC), EU (EN), or Indicative |

**Outputs**

- Critical load \( P_{\mathrm{cr}} \), buckling mode shape, slenderness ratio, utilization per selected code
- Euler safety factor \( P_{\mathrm{cr}}/P \).

**Design codes & checks**

- **Indicative:** Euler buckling \( P_{\mathrm{cr}}/P \)
- **US:** AISC 360-22 Chapter E (flexural buckling)
- **EU:** EN 1993-1-1 §6.3 buckling curves
- **ISO:** ISO 10721 compression member context

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Elastic buckling eigenvalue; inelastic column curves applied post-hoc per code.
- Single-axis flexural buckling; no torsional or flexural-torsional modes unless section data extended.
- Uniform prismatic section along length.
- Validated against Euler closed-form for standard end conditions.

**References**

1. Timoshenko, S. P., & Gere, J. M. *Theory of Elastic Stability*, 2nd ed. McGraw-Hill.
2. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter E.
3. EN 1993-1-1:2005. *Eurocode 3 — Buckling of members*.
4. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
