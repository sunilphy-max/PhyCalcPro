### Frame Analysis (`frames`)

**Purpose**

Perform two-dimensional elastic frame analysis for rigid-jointed structures composed of prismatic members. The module assembles global stiffness matrices, applies nodal loads and support constraints, and returns member end forces, joint reactions, and stress utilizations for machine and industrial frame screening.

**Physics & theory**

A plane frame member carries axial force, shear, and bending moment. Each member contributes a 6×6 (or condensed) stiffness matrix in local coordinates relating end forces to end displacements. Coordinate transformation maps local stiffness to global axes before assembly into the structure stiffness matrix \( \mathbf{K} \).

Equilibrium requires \( \mathbf{K}\mathbf{u} = \mathbf{F} \), where \( \mathbf{u} \) collects nodal translations and rotations and \( \mathbf{F} \) collects applied loads and fixed-end equivalents. Member stresses are recovered from axial stress \( \sigma = N/A \) and bending stress \( \sigma = Mc/I \), combined for utilization screening.

The solver assumes small displacements and linear elastic material behavior. P–Δ effects, plastic hinges, and semi-rigid connection stiffness are not modeled unless explicitly added in future releases.

Boundary conditions define the kinematic constraints at supports. Fixed ends restrain both translation and rotation; pinned supports restrain translation only; roller supports allow horizontal movement. The choice of support model directly affects moment distribution — a fixed–fixed beam carries less mid-span moment than a simply supported beam under the same UDL but develops significant hogging moments at supports.

Load types include concentrated forces, uniformly distributed segments, and applied couples. Multiple loads superpose linearly in elastic analysis. The module validates positive geometry (length, stiffness, section properties) before invoking the solver and rejects empty load lists.

**Governing equations**

\[
\begin{bmatrix} \mathbf{K} \end{bmatrix} \{\mathbf{u}\} = \{\mathbf{F}\}
\]

\[
\sigma_{\mathrm{member}} = \frac{N}{A} \pm \frac{M c}{I}
\]

\[
U = \frac{\sigma_{\mathrm{combined}}}{\sigma_{\mathrm{allow}}}
\]

**Numerical method**

Direct stiffness method: nodes and members define the mesh. Element stiffness matrices are transformed and assembled; boundary conditions eliminate constrained DOFs. The reduced linear system is solved via Gaussian elimination or equivalent sparse solver. Member end forces are back-calculated from nodal displacements.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Nodes | Coordinates and support/fixity flags |
| Members | Start/end nodes, \( E \), \( A \), \( I \), section depth |
| Loads | Nodal forces/moments, member distributed loads |
| Material | Yield or allowable stress for utilization |

**Outputs**

- Nodal displacements and rotations
- member axial force, shear, and end moments
- joint reactions
- member stress utilization
- equilibrium check residuals.

**Design codes & checks**

- **Indicative:** Member stress utilization, joint reaction equilibrium
- **US/EU/ISO:** Application-dependent; presets reference industrial equipment standards

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

- 2D plane frame only; no out-of-plane buckling or torsion.
- Prismatic members, linear elastic behavior.
- Rigid joints unless connection flexibility is added externally.
- Does not replace licensed structural design per building codes.

**References**

1. Hibbeler, R. C. *Structural Analysis*, 10th ed. Pearson.
2. McCormac, J. C., & Brown, R. H. *Structural Analysis*, 5th ed. Cengage.
3. EN 1993-1-1:2005. *Eurocode 3 — General rules*.
4. ISO 12100:2010. *Safety of machinery — General principles for design*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
