### Flywheel Design (`flywheels`)

**Purpose**

Size flywheels for energy storage and speed regulation by computing required moment of inertia, rim stress, and energy capacity for a specified speed fluctuation or power pulse. Used in presses, engines, and cyclic machinery.

**Physics & theory**

A flywheel stores kinetic energy \( E = \frac{1}{2} I \omega^2 \). For a rim-dominated disk, \( I \approx m r^2 \) where \( m \) is rim mass and \( r \) is mean radius. Energy change between max and min speed during a cycle is \( \Delta E = \frac{1}{2} I (\omega_{\max}^2 - \omega_{\min}^2) \).

Coefficient of speed fluctuation \( C_s = (\omega_{\max} - \omega_{\min})/\omega \) links inertia to cyclic energy input/output. Rim stress from centrifugal loading approximates hoop tension \( \sigma = \rho r^2 \omega^2 \) for thin rings; solid disk models use radial and tangential stress distributions.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

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

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

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
