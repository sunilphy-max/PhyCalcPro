### Truss Analysis (`trusses`)

**Purpose**

Determine axial forces in two-dimensional pin-jointed truss members under nodal loading. The module identifies tension and compression members, flags zero-force links, and reports axial stress utilization against allowable values for preliminary truss sizing.

**Physics & theory**

Truss members are assumed two-force elements carrying only axial force \( N \) along the member axis. At each pin joint, equilibrium \( \sum F_x = 0 \) and \( \sum F_y = 0 \) must hold. Because moments cannot be transferred at pins, the structure stiffness matrix involves only translational DOFs (two per node in 2D).

Axial stress is \( \sigma = N/A \). Tension members are limited by yield or net-section rupture in detailed design; compression members require buckling checks handled separately in the Column Buckling module. The solver uses the direct stiffness method with bar elements of stiffness \( EA/L \).

Indeterminate trusses are solved by the same matrix approach; degree of indeterminacy must be matched by sufficient supports and member connectivity.

External supports restrain selected nodal translations; internal joints are ideal pins with no moment capacity. Loads apply only at nodes as concentrated forces — member self-weight and distributed loads must be converted to equivalent nodal forces by the user.

The solver validates connectivity, positive member areas, and sufficient boundary restraints before assembling the stiffness matrix.

**Governing equations**

\[
\frac{EA}{L} \begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix} \{\mathbf{u}\} = \{\mathbf{F}\}
\]

\[
\sigma = \frac{N}{A}, \quad U = \frac{|\sigma|}{\sigma_{\mathrm{allow}}}
\]

**Numerical method**

Bar-element FEM: each member contributes axial stiffness in global coordinates after direction-cosine transformation. The assembled system is solved for nodal displacements; member forces \( N = (EA/L)(u_j - u_i) \) are recovered. Zero-area or disconnected members produce singular systems and are rejected at validation.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Nodes | \( x, y \) coordinates, support conditions |
| Members | End nodes, cross-sectional area \( A \), elastic modulus \( E \) |
| Loads | Nodal force components |
| Allowable stress | For utilization screening |

**Outputs**

- Member axial force (signed tension/compression), axial stress, utilization ratio, reaction forces at supports, deformed shape (optional visualization).

**Design codes & checks**

- **Indicative:** Member axial utilization
- **US:** AISC 360 tension/compression member context (screening only)
- **EU:** EN 1993-1-1 member rules (screening)


**Assumptions & limitations**

- Pin joints, members connected at centroidal axes.
- No joint eccentricity, secondary bending, or buckling in this module.
- 2D planar truss; no 3D spatial truss.
- Linear elastic; no cable slack or compression-only release logic unless configured.

**References**

1. Hibbeler, R. C. *Structural Analysis*, 10th ed. Pearson.
2. AISC. *Steel Construction Manual*, 16th ed.
3. EN 1993-1-1:2005. *Eurocode 3 — Tension and compression members*.
4. ISO 10721:1997. *Steel structures — Static analysis and design*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
