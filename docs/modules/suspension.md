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
