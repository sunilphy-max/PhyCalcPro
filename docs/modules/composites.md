### Composite Materials (`composites`)

**Purpose**

Analyze laminated composite layups using classical lamination theory (CLT) for effective stiffness, ply stresses, and failure screening with common failure criteria. Supports symmetric and general stacking sequences.

**Physics & theory**

Each ply has orthotropic properties referenced to fiber direction: \( E_1, E_2, G_{12}, \nu_{12} \). Under plane stress, reduced stiffness \( \mathbf{Q} \) relates stress to strain in ply coordinates. Rotated plies transform \( \mathbf{Q} \) to global coordinates via angle \( \theta \).

Lamination theory sums ply contributions through thickness: extensional stiffness \( \mathbf{A} \), coupling \( \mathbf{B} \), and bending \( \mathbf{D} \). Midplane strains \( \boldsymbol{\epsilon}^0 \) and curvatures \( \boldsymbol{\kappa} \) from applied loads yield ply stresses in each layer. Failure criteria (max stress, Tsai–Hill, Tsai–Wu) screen ply-by-ply.

Material and section data underpin all stress and deflection calculations in PhyCalcPro. Consistent unit conversion to SI base quantities occurs at the solver boundary via the shared units layer. Temperature-dependent properties should be evaluated when operating temperature differs significantly from room temperature.

Cross-section properties assume homogeneous isotropic material unless the Composites module is used for laminated sections.

**Governing equations**

\[
\begin{Bmatrix} \mathbf{N} \\ \mathbf{M} \end{Bmatrix} = \begin{bmatrix} \mathbf{A} & \mathbf{B} \\ \mathbf{B} & \mathbf{D} \end{bmatrix} \begin{Bmatrix} \boldsymbol{\epsilon}^0 \\ \boldsymbol{\kappa} \end{Bmatrix}
\]

\[
\mathbf{A} = \sum_k \mathbf{Q}_k (z_{k+1} - z_k)
\]

\[
F_{\mathrm{Tsai-Hill}} = \frac{\sigma_1^2}{X^2} - \frac{\sigma_1 \sigma_2}{X^2} + \frac{\sigma_2^2}{Y^2} + \frac{\tau_{12}^2}{S^2} \leq 1
\]

**Numerical method**

CLT matrix assembly (`engine`): ply stack input builds \( \mathbf{ABD} \) matrices; load vector solved for midplane response; ply stresses and failure indices computed layer by layer.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Ply materials | \( E_1, E_2, G_{12}, \nu_{12} \), strengths |
| Layup sequence | Angles and thicknesses |
| Applied \( N_x, N_y, N_{xy}, M_x, M_y, M_{xy} \) | Loads per unit width |
| Failure criterion | Max stress, Tsai–Hill, Tsai–Wu |

**Outputs**

- Effective moduli, midplane strains/curvatures, ply stresses per layer, failure index, first-ply failure load factor.

**Design codes & checks**

- **Indicative:** Effective modulus and strength utilization
- **US:** MIL-HDBK-17-3F composite guidance (reference)
- **EU:** EN 1999-1-3 aluminium structures with bonded panels (context)

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- Linear elastic CLT; no progressive damage or delamination propagation.
- Plane stress, thin laminate; no transverse shear (no FSDT unless extended).
- No moisture/temperature residual strains unless user offsets added.
- Manufacturing defects and open-hole effects not included.

**References**

1. Jones, R. M. *Mechanics of Composite Materials*, 2nd ed. Taylor & Francis.
2. MIL-HDBK-17-3F. *Composite Materials Handbook, Volume 3*.
3. Herakovich, C. T. *Mechanics of Fibrous Composites*. Wiley.
4. ASTM D3039/D3039M. *Tensile Properties of Polymer Matrix Composites*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
