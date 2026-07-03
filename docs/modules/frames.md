### Frame Analysis (`frames`)

**Purpose**

Perform two-dimensional elastic frame analysis for rigid-jointed structures composed of prismatic members. The module assembles global stiffness matrices, applies nodal loads and support constraints, and returns member end forces, joint reactions, and stress utilizations for machine and industrial frame screening.

**Physics & theory**

A plane frame member carries axial force, shear, and bending moment. Each member contributes a 6×6 (or condensed) stiffness matrix in local coordinates relating end forces to end displacements. Coordinate transformation maps local stiffness to global axes before assembly into the structure stiffness matrix \( \mathbf{K} \).

Equilibrium requires \( \mathbf{K}\mathbf{u} = \mathbf{F} \), where \( \mathbf{u} \) collects nodal translations and rotations and \( \mathbf{F} \) collects applied loads and fixed-end equivalents. Member stresses are recovered from axial stress \( \sigma = N/A \) and bending stress \( \sigma = Mc/I \), combined for utilization screening.

The solver assumes small displacements and linear elastic material behavior. P–Δ effects, plastic hinges, and semi-rigid connection stiffness are not modeled unless explicitly added in future releases.

Support conditions are applied at nodes: fixed (restrained translation and rotation), pinned (translation restrained, rotation free), or roller (one translation free). Member end releases and semi-rigid connections are not modeled — all joints are treated as rigid unless a member is flagged as pinned.

Nodal loads and member distributed loads superpose linearly. The solver rejects structures with insufficient restraints or zero-stiffness members.

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
