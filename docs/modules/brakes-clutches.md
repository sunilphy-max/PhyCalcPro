---
seoTitle: "Brake & Clutch Calculator – Friction Torque, Energy & Thermal Screening"
seoDescription: "Calculate friction torque capacity, energy per stop, and thermal screening for disk and drum brakes and clutches in single-plate and multi-plate configurations."
guideHeadline: "Engineering guide to brake and clutch design and thermal analysis"
keywords:
  - brake calculator
  - clutch torque capacity
  - friction torque design
  - brake thermal analysis
  - disk brake sizing
  - multi-plate clutch
  - energy per stop
---

### Brakes & Clutches (`brakes-clutches`)

## How engineers size brakes and clutches

Brakes and clutches are friction devices that transmit or absorb torque. A clutch connects a driven load to a motor; a brake decelerates or holds a rotating mass. Both require sufficient friction torque to control the load and enough thermal mass to absorb repeated energy cycles without overheating. The fundamental design loop computes required torque, checks friction capacity, and screens thermal load.

## Types and configurations

| Type | Configuration | Application |
|------|--------------|-------------|
| Single-plate dry clutch | One friction surface pair | Automotive manual transmission |
| Multi-plate wet clutch | Oil-cooled stack | Motorcycle, automatic transmission |
| Caliper disk brake | Pad on rotor | Vehicles, industrial machinery |
| Drum brake | Shoes inside drum | Rear axle, hoists |
| Band brake | Flexible band on drum | Winches, simple machinery |
| Cone clutch | Conical friction surface | Marine, heavy equipment |

## Engineering workflow

1. Determine required torque from load inertia and deceleration rate (brakes) or motor power (clutches).
2. Select configuration (disk, drum, multi-plate) and pressure assumption (uniform pressure or uniform wear).
3. Choose inner and outer radii and number of friction surfaces.
4. Compute effective friction radius and required actuation force.
5. Verify torque capacity exceeds demand with safety margin.
6. Calculate energy per engagement/stop from inertia and speed.
7. Screen thermal capacity: average power dissipation vs cooling ability.
8. Check lining temperature rise against material limits.

## Key quantities and formulas

Friction torque capacity:

\[
T = n \, \mu \, F_n \, r_{\text{eff}}
\]

Energy per full stop:

\[
E_{\text{stop}} = \frac{1}{2} I \omega^2
\]

Average dissipated power:

\[
P_{\text{avg}} = E \times f_{\text{cycles}}
\]

Effective radius (uniform wear assumption):

\[
r_{\text{eff}} = \frac{r_o + r_i}{2}
\]

## Worked example

A multi-plate clutch with 4 friction surfaces, outer radius 120 mm, inner radius 80 mm, friction coefficient 0.35, actuation force 2000 N must transmit 5 kW at 1500 rpm.

- Effective radius (uniform wear): \( r_{\text{eff}} = (0.120 + 0.080)/2 = 0.100 \) m.
- Torque capacity: \( T = 4 \times 0.35 \times 2000 \times 0.100 = 280 \) N-m.
- Required torque: \( T_{\text{req}} = P/\omega = 5000/(2\pi \times 1500/60) = 31.8 \) N-m.
- Safety factor: \( 280/31.8 = 8.8 \) — substantial margin for shock and wear.

## Common mistakes and checks

- **Confusing uniform pressure with uniform wear:** new linings distribute pressure uniformly; worn linings wear to uniform wear distribution. The uniform wear model gives lower (conservative) torque.
- **Ignoring thermal limits:** torque capacity is adequate but repeated stops overheat linings, causing fade.
- **Underestimating engagement inertia:** the clutch must accelerate the entire driven system's reflected inertia.
- **Not counting friction surfaces correctly:** a single plate between two surfaces has \( n = 2 \); multi-plate stacks with \( k \) plates have \( n = 2k \) or \( n = 2(k-1) \) depending on configuration.

## FAQ

### What is the difference between uniform pressure and uniform wear models?

Uniform pressure assumes constant pressure across the face — valid for new linings. Uniform wear assumes the inner radius wears fastest, redistributing pressure — valid after break-in and more conservative.

### How many stops can a brake handle before overheating?

Divide the thermal capacity (mass times specific heat times allowable temperature rise) by the energy per stop. Continuous duty requires steady-state cooling capacity exceeding average power dissipation.

### Why do wet clutches have lower friction coefficients?

Oil lubricates the surfaces, reducing \( \mu \) to 0.05–0.15 vs 0.25–0.45 for dry. Wet clutches compensate with more plates and higher actuation force, gaining smooth engagement and better heat dissipation.

### When should I use a drum brake instead of a disk brake?

Drum brakes offer self-energizing (the leading shoe amplifies braking force), making them suited for parking brakes and applications where hydraulic pressure is limited.

### How does fade affect brake performance?

At elevated temperatures, friction coefficient drops (fade). Design must ensure the lining material maintains adequate \( \mu \) at peak operating temperature.

## Use the PhyCalcPro calculator

Open the [Brakes & Clutches calculator](/products/machine/brakes-clutches) to enter friction surfaces, radii, actuation force, inertia, speed, and cycle rate. The tool returns friction torque capacity, torque utilization, energy per stop, average power, and thermal warning flags.

---

**Purpose**

Calculate friction torque capacity, energy dissipated per stop or engagement, and thermal screening for disk and drum brakes and clutches.

**Physics & theory**

Friction devices transmit torque through normal force \( F_n \) and coefficient of friction \( \mu \). Energy per engagement is \( E = \frac{1}{2} I \omega^2 \) for a full stop. Repeated engagements heat friction surfaces; average power dissipation must not exceed material and coolant limits.

**Governing equations**

\[
T = n \, \mu \, F_n \, r_{\text{eff}}
\]

\[
E_{\text{stop}} = \frac{1}{2} I \omega^2
\]

\[
P_{\text{avg}} = E \times f_{\text{cycles}}
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
3. Newcomb, T. P., & Spurr, R. T. *A Technical History of the Motor Car* (brake fundamentals).
4. ISO 7649:1988. *Brakes — Friction materials — Classification*.
