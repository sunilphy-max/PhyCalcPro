### Suspension & Sway (`suspension`)

**Purpose**

Screen vehicle roll response and lateral load transfer under cornering acceleration. Computes roll angle, roll moment, and wheel load transfer for sprung-mass suspension geometry screening.

**Physics & theory**

Lateral acceleration \( a_y \) on sprung mass \( m_s \) creates inertial force \( F_y = m_s a_y \) at the center of gravity (CG). This force times CG height \( h \) produces roll moment about the roll axis: \( M_{\mathrm{roll}} = F_y \cdot (t/2) \) referenced to track width \( t \) and wheelbase geometry in simplified models.

Roll angle \( \phi = M_{\mathrm{roll}}/k_{\phi} \) depends on roll stiffness \( k_{\phi} \) (spring, anti-roll bar, and tire vertical rates combined). Load transfer across track: \( \Delta W = F_y h / t \) increases outer wheel load and reduces inner — affects tire grip limits.

Dynamic analysis requires careful identification of mass, stiffness, and damping distribution. Natural frequencies depend on boundary conditions — a cantilever beam has fundamentally different modes than a simply supported beam of the same dimensions.

Damping limits resonant amplification; lightly damped structures (( zeta < 0.05 )) can see transmissibility peaks exceeding 10 near resonance. Separation margin between operating excitation and natural frequency should typically exceed 15–20% for rotating machinery.

**Governing equations**

\[
F_y = m_s a_y, \quad M_{\mathrm{roll}} = F_y \frac{w}{2}
\]

\[
\phi = \frac{M_{\mathrm{roll}}}{k_\phi}, \quad \Delta W = \frac{F_y h}{t}
\]

**Numerical method**

Closed-form roll and load transfer (`engine`). Roll angle in degrees compared to stability thresholds (≤ 2° stable, ≤ 5° moderate, > 5° high roll).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `sprungMass` | Sprung mass \( m_s \) |
| `lateralAcceleration` | Cornering \( a_y \) (m/s²) |
| `wheelbase`, `trackWidth` | Geometry |
| `cgHeight` | CG height \( h \) |
| `rollStiffness` | Total roll rate \( k_\phi \) (N·m/rad) |

**Outputs**

- Lateral force, roll moment, roll angle (degrees), load transfer, design status.

**Design codes & checks**

- **Indicative:** Roll angle and load transfer screening

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

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

- Steady-state cornering; no transient roll dynamics or damping.
- Rigid body sprung mass; no compliance frequency analysis.
- Does not compute understeer gradient or tire friction ellipse.
- Anti-roll bar tuning requires detailed suspension model beyond this screen.

**References**

1. Gillespie, T. D. *Fundamentals of Vehicle Dynamics*. SAE International.
2. Milliken, W. F., & Milliken, D. L. *Race Car Vehicle Dynamics*. SAE.
3. Reimpell, J., et al. *The Automotive Chassis*, 2nd ed. SAE.
4. ISO 4138:2012. *Passenger cars — Steady-state circular driving behaviour*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
