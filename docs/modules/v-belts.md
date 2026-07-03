### V-Belt Drive (`v-belts`)

**Purpose**

Size classical V-belt drives by computing belt length, wrap angles, power capacity, speed ratio, and estimated pretension for a two-pulley layout. Screens belt selection against transmitted power with friction-based tight/slack side tension estimates.

**Physics & theory**

Flat and V-belt drives transmit torque through friction on pulley wrap arcs. The belt speed is \( v = \pi D n / 60 \) (m/s with \( D \) in m, \( n \) in rpm). Open belt length for center distance \( C \) and pulley diameters \( D_1, D_2 \) follows the standard layout formula accounting for straight spans and arc lengths.

Euler's belt equation relates tight side tension \( F_1 \) to slack side \( F_2 \): \( F_1/F_2 = e^{\mu\theta} \), where \( \mu \) is friction coefficient and \( \theta \) is wrap angle in radians on the driver pulley. Power capacity depends on allowable belt tension, speed, and wrap — the solver uses a simplified capacity model scaled by belt class factor and service factor.

Power transmission elements operate under cyclic tension, bending, and contact stresses. Service factors account for driver type (motor vs engine), daily operating hours, and shock loading. Belt slip occurs when required friction capacity exceeds available wrap; chain drives depend on proper lubrication and sprocket tooth count for rated life.

Center distance adjustment affects belt length and wrap angle simultaneously — the solver uses the standard open-drive length formula assuming coplanar shafts and parallel pulley grooves.

**Governing equations**

\[
L = 2C + \frac{\pi(D_1 + D_2)}{2} + \frac{(D_2 - D_1)^2}{4C}
\]

\[
\frac{F_1}{F_2} = e^{\mu \theta}, \quad P = \frac{(F_1 - F_2)\, v}{1000}
\]

\[
i = \frac{D_2}{D_1}, \quad n_2 = \frac{n_1}{i}
\]

**Numerical method**

Closed-form classical belt equations. Wrap angles computed from geometry via \( \theta = \pi - 2\arcsin[(D_2-D_1)/(2C)] \). Power capacity estimated from belt factor, belt speed, service factor, and exponential friction term. Pretension estimated as average of tight and slack tensions.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `diameterDriver`, `diameterDriven` | Pulley pitch diameters |
| `centerDistance` | Shaft center distance \( C \) |
| `speedDriver` | Driver speed (rpm) |
| `power` | Transmitted power (kW) |
| `frictionCoeff` | Belt–pulley friction \( \mu \) |
| `beltFactor`, `serviceFactor` | Belt class and application factors |

**Outputs**

- Belt length, wrap angles (driver/driven), belt speed, power capacity and utilization, speed ratio, driven speed, pretension estimate.

**Design codes & checks**

- **Indicative:** Power capacity utilization, minimum wrap angle
- **US:** Gates/McGraw belt design handbook methods (screening)
- **ISO:** ISO 4184 classical V-belt sections (reference)


**Assumptions & limitations**

- Two-pulley open drive; no idlers or quarter-turn layouts (see Multi-Pulley module).
- Steady-state, no belt creep dynamics or temperature derating beyond service factor.
- Flat friction model; V-belt wedge effect absorbed in `beltFactor`.
- Does not select specific belt cross-section from catalog tables automatically.

**Verification**

- CI: `v-belts-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 17.
2. Marks' Standard Handbook for Mechanical Engineers, 12th ed., McGraw-Hill.
3. ISO 4184:1992. *Classical V-belts and pulleys*.
4. Gates Corporation. *Drive Design Manual*.
5. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
