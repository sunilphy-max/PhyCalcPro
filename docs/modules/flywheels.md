### Flywheel Design (`flywheels`)

**Purpose**

Size flywheels for energy storage and speed regulation by computing required moment of inertia, rim stress, and energy capacity for a specified speed fluctuation or power pulse. Used in presses, engines, and cyclic machinery.

**Physics & theory**

A flywheel stores kinetic energy \( E = \frac{1}{2} I \omega^2 \). For a rim-dominated disk, \( I \approx m r^2 \) where \( m \) is rim mass and \( r \) is mean radius. Energy change between max and min speed during a cycle is \( \Delta E = \frac{1}{2} I (\omega_{\max}^2 - \omega_{\min}^2) \).

Coefficient of speed fluctuation \( C_s = (\omega_{\max} - \omega_{\min})/\omega \) links inertia to cyclic energy input/output. Rim stress from centrifugal loading approximates hoop tension \( \sigma = \rho r^2 \omega^2 \) for thin rings; solid disk models use radial and tangential stress distributions.

**Governing equations**

\[
E = \frac{1}{2} I \omega^2, \quad \Delta E = \frac{1}{2} I (\omega_{\max}^2 - \omega_{\min}^2)
\]

\[
C_s = \frac{\omega_{\max} - \omega_{\min}}{\omega_{\mathrm{mean}}}
\]

\[
\sigma_{\mathrm{rim}} = \rho r^2 \omega^2
\]

**Numerical method**

Closed-form energy–inertia relations. Required \( I \) computed from specified \( \Delta E \) and speed limits. Geometry (rim thickness, width, hub bore) iterated to achieve target inertia while checking rim stress utilization against material allowable.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Energy fluctuation \( \Delta E \) | Per-cycle energy imbalance |
| Speed range | Mean, max, min rpm |
| Material density, allowable stress | Rim material |
| Geometry | Outer radius, rim width/thickness |

**Outputs**

- Required moment of inertia, rim mass, stored energy, rim stress, speed fluctuation coefficient, stress utilization.

**Design codes & checks**

- **Indicative:** Rim stress utilization, energy storage capacity


**Assumptions & limitations**

- Axisymmetric rotation; no blade or spoke dynamic stress analysis.
- Thin-rim approximation for hoop stress; hub and spoke contributions simplified.
- No burst containment or safety guard requirements.
- Constant angular deceleration during energy release not enforced.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 15.
2. Spotts, M. F., & Shoup, T. E. *Design of Machine Elements*, 8th ed.
3. Marks' Standard Handbook for Mechanical Engineers, 12th ed.
4. Peterson, R. E. *Stress Concentration Factors* (rotor burst context).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
