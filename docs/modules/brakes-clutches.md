### Brakes & Clutches (`brakes-clutches`)

**Purpose**

Calculate friction torque capacity, energy dissipated per stop or engagement, and thermal screening for disk and drum brakes and clutches. Supports single-plate and multi-plate configurations.

**Physics & theory**

Friction devices transmit torque through normal force \( F_n \) and coefficient of friction \( \mu \): \( T = n \mu F_n r_{\mathrm{eff}} \), where \( n \) is number of friction surfaces and \( r_{\mathrm{eff}} \) is effective radius (mean radius for uniform pressure assumption).

Energy per engagement is \( E = T \Delta\theta \) for angular displacement \( \Delta\theta \), or \( E = \frac{1}{2} I \omega^2 \) for full stop from speed \( \omega \). Repeated engagements heat friction surfaces; average power dissipation \( P = E \cdot f_{\mathrm{cycle}} \) must not exceed material and coolant limits.

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
