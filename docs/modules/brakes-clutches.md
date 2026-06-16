### Brakes & Clutches (`brakes-clutches`)

**Purpose**

Calculate friction torque capacity, energy dissipated per stop or engagement, and thermal screening for disk and drum brakes and clutches. Supports single-plate and multi-plate configurations.

**Physics & theory**

Friction devices transmit torque through normal force \( F_n \) and coefficient of friction \( \mu \): \( T = n \mu F_n r_{\mathrm{eff}} \), where \( n \) is number of friction surfaces and \( r_{\mathrm{eff}} \) is effective radius (mean radius for uniform pressure assumption).

Energy per engagement is \( E = T \Delta\theta \) for angular displacement \( \Delta\theta \), or \( E = \frac{1}{2} I \omega^2 \) for full stop from speed \( \omega \). Repeated engagements heat friction surfaces; average power dissipation \( P = E \cdot f_{\mathrm{cycle}} \) must not exceed material and coolant limits.

Machine design modules apply classical strength-of-materials and gear/bearing rating methods validated against textbook benchmarks where available. Material allowables should be adjusted for temperature, surface finish, and reliability requirements before comparing utilization ratios to unity.

Operating conditions — speed, duty cycle, lubrication, and load spectrum — strongly influence real-world capacity beyond the indicative screening calculations performed here. Results should be confirmed with manufacturer catalogs or detailed standards calculations for production releases.

**Governing equations**

\[
T = n \mu F_n r_{\mathrm{eff}}
\]

\[
E_{\mathrm{stop}} = \frac{1}{2} I \omega^2 = \frac{1}{2} I \left(\frac{2\pi n}{60}\right)^2
\]

\[
P_{\mathrm{avg}} = E \cdot f_{\mathrm{cycles}}
\]

**Numerical method**

Closed-form friction torque and energy relations. Safety factor applied to required vs available torque. Thermal screening compares energy per cycle to allowable surface temperature rise (simplified lumped model).

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Friction surfaces \( n \), \( \mu \) | Configuration and material pair |
| Outer/inner radius | Geometry |
| Actuation force \( F_n \) | Clamp force |
| Inertia, speed | For energy calculation |
| Cycle rate | Engagements per minute |

**Outputs**

- Friction torque capacity, torque utilization, energy per stop, average dissipated power, thermal warning flags.

**Design codes & checks**

- **Indicative:** Friction torque capacity, energy per stop screening

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

- Uniform pressure or uniform wear assumption — user selects model.
- Dry or wet friction \( \mu \) from tables; no dynamic \( \mu \) vs speed/temperature.
- No detailed transient thermal FEA of friction surfaces.
- Vibration, chatter, and fade not modeled.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 16.
2. SAE J2681. *Brake Effectiveness — Vehicle Analysis*.
3. Newcomb, T. P., & Spurr, R. T. *A Technical History of the Motor Car*. (Brake fundamentals)
4. ISO 7649:1988. *Brakes — Friction materials — Classification*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
