---
seoTitle: "V-Belt Drive Calculator – Belt Length, Wrap Angle & Power Capacity Analysis"
seoDescription: "Size classical V-belt drives with belt length, wrap angle, tight/slack tension, power capacity screening, and service factor selection using PhyCalcPro."
guideHeadline: "V-Belt Drive Design — Length, Tension & Power Capacity Guide"
keywords: ["V-belt calculator", "belt drive design", "belt length", "wrap angle", "belt tension", "power transmission", "belt selection", "service factor"]
---

### V-Belt Drive Design Guide (`v-belts`)

## How engineers select V-belt drives

V-belt drives are the workhorse of low-to-medium power transmission. They are inexpensive, tolerant of misalignment, and provide shock absorption through belt compliance. The design process involves matching the belt cross-section and pulley diameters to the required power while ensuring adequate wrap angle on the smaller pulley and manageable belt tension.

The fundamental physics is Euler's capstan equation: the ratio of tight-side to slack-side tension depends exponentially on the friction coefficient and wrap angle. A V-belt gains friction advantage over a flat belt because the V-groove wedges the belt against both flanks, effectively multiplying the friction coefficient.

## Types and configurations

| Belt cross-section | Top width (mm) | Power range | Typical application |
|---|---|---|---|
| A (AX) | 13 | 0.5–7.5 kW | Light machinery, fans |
| B (BX) | 17 | 2–15 kW | Machine tools, pumps |
| C (CX) | 22 | 7.5–75 kW | Compressors, conveyors |
| D | 32 | 30–200 kW | Heavy industrial drives |
| E | 38 | 50–375 kW | Mining, large fans |

Narrow-section belts (3V, 5V, 8V) provide higher power density for the same center distance. PhyCalcPro uses a generalized belt capacity model scaled by belt class factor.

## Engineering workflow

1. **Determine power and speed** — Motor power, driver rpm, and driven rpm establish the speed ratio and required belt capacity.
2. **Apply service factor** — Multiply transmitted power by the service factor (1.0–1.6 depending on driver type, driven load, and daily hours) to get the design power.
3. **Select belt cross-section** — Use manufacturer horsepower charts or ISO 4184 tables to choose a section that can carry the design power at the driver speed.
4. **Size pulleys** — Driver and driven pitch diameters set the speed ratio \( i = D_2/D_1 \). Minimum pulley diameter is limited by belt bending fatigue.
5. **Compute belt length and center distance** — The standard open-drive formula gives the pitch length from pulley diameters and center distance.
6. **Check wrap angle** — Minimum wrap on the smaller pulley should be at least 120 degrees; below that, capacity derates significantly.
7. **Estimate tensions** — Euler's equation gives tight-side and slack-side tensions; pretension is the average.

## Key quantities and formulas

**Belt pitch length (open drive)**

\[
L = 2C + \frac{\pi(D_1 + D_2)}{2} + \frac{(D_2 - D_1)^2}{4C}
\]

**Euler's belt equation and transmitted power**

\[
\frac{F_1}{F_2} = e^{\mu\,\theta}, \quad P = \frac{(F_1 - F_2)\,v}{1000}
\]

where \( F_1 \) is tight-side tension, \( F_2 \) is slack-side tension, \( \mu \) is the effective friction coefficient, and \( \theta \) is the wrap angle in radians.

**Speed ratio and wrap angle**

\[
i = \frac{D_2}{D_1}, \quad \theta_1 = \pi - 2\arcsin\!\left(\frac{D_2 - D_1}{2C}\right)
\]

**Belt speed**

\[
v = \frac{\pi\,D_1\,n_1}{60\,000} \quad \text{(m/s, with } D_1 \text{ in mm)}
\]

## Worked example

**Problem:** A 7.5 kW motor at 1750 rpm drives a centrifugal pump at 875 rpm through a B-section V-belt. Center distance 500 mm.

1. Speed ratio: \( i = 1750/875 = 2.0 \). Choose \( D_1 = 125 \) mm, \( D_2 = 250 \) mm.
2. Belt speed: \( v = \pi \times 125 \times 1750 / 60\,000 = 11.45 \) m/s.
3. Belt length: \( L = 2 \times 500 + \pi(125+250)/2 + (250-125)^2/(4 \times 500) = 1000 + 589 + 7.8 = 1597 \) mm. Select standard length 1600 mm (B63).
4. Wrap angle on driver: \( \theta_1 = \pi - 2\arcsin(125/1000) = 180 - 14.4 = 165.6 \) degrees — adequate.
5. Service factor: 1.2 (motor to pump, 8–16 h/day). Design power: \( 7.5 \times 1.2 = 9.0 \) kW.
6. From B-section capacity at 1750 rpm: single belt rated at approximately 5.5 kW after wrap correction. Need 2 belts: \( 2 \times 5.5 = 11.0 \) kW capacity. Utilization: 82 % — acceptable.
7. Tight-side tension (\( \mu = 0.50 \), \( \theta = 2.89 \) rad): \( F_1/F_2 = e^{1.45} = 4.26 \). Net pull \( F_1 - F_2 = 9000/11.45 = 786 \) N. Slack tension \( F_2 = 241 \) N, tight \( F_1 = 1027 \) N.

## Common mistakes and checks

- **Insufficient wrap angle** — With large speed ratios the small pulley wrap can drop below 120 degrees, severely derating belt capacity. Use an idler or increase center distance.
- **Ignoring belt speed limits** — Most classical V-belts should not exceed 25–30 m/s; centrifugal tension grows with the square of speed and reduces effective pull.
- **Wrong number of belts** — Running a single belt above its rated capacity shortens life dramatically. Always size for the design power, not the nominal power.
- **Neglecting pulley alignment** — Misaligned pulleys cause uneven belt wear and premature failure. Angular misalignment should be less than 0.5 degrees.
- **Forgetting service factor** — An un-factored design may pass at rated power but fail under start-up, shock, or extended daily operation.

## FAQ

### How do I determine the service factor?
Service factors are tabulated by driver type (electric motor, IC engine) and driven machine (fan, pump, compressor, crusher). AGMA, Gates, and ISO 4184 all publish tables. Typical range is 1.0 (uniform load, motor) to 1.8 (heavy shock, engine).

### What is the minimum recommended wrap angle?
120 degrees on the smaller pulley is the practical minimum. Below this, belt slip becomes likely and capacity is derated by the wrap correction factor \( K_\theta \). For reliable drives, target at least 150 degrees.

### Can I use the calculator for synchronous (timing) belts?
No. Timing belts use tooth engagement rather than friction and have different capacity models. Use the dedicated Timing Belt module for synchronous drives.

### How does belt speed affect capacity?
Power capacity rises with belt speed up to about 20–25 m/s, then plateaus and eventually decreases as centrifugal tension consumes a larger fraction of the allowable belt tension. Optimal belt speed is typically 15–25 m/s.

### Should I tension V-belts to a specific value?
Belt manufacturers recommend setting pretension so that the belt deflects approximately 1.5 mm per 100 mm of free span under a specified force. This corresponds to the average of tight-side and slack-side tensions at rated load.

## Use the PhyCalcPro calculator

Size classical V-belt drives with length, wrap, and capacity screening in the [V-Belt Drive Calculator](/products/power-transmission/v-belts).

---

**Purpose**

Size classical V-belt drives by computing belt length, wrap angles, power capacity, speed ratio, and estimated pretension for a two-pulley layout. Screens belt selection against transmitted power with friction-based tight/slack side tension estimates.

**Physics & theory**

V-belt drives transmit torque through friction on pulley wrap arcs. The belt speed is \( v = \pi D n / 60 \) (m/s with \( D \) in m, \( n \) in rpm). Open belt length for center distance \( C \) and pulley diameters \( D_1, D_2 \) follows the standard layout formula accounting for straight spans and arc lengths.

Euler's belt equation relates tight side tension \( F_1 \) to slack side \( F_2 \): \( F_1/F_2 = e^{\mu\theta} \), where \( \mu \) is friction coefficient and \( \theta \) is wrap angle in radians on the driver pulley. The V-groove increases the effective friction by a factor \( 1/\sin(\beta/2) \), where \( \beta \) is the groove angle (typically 34–40 degrees), making V-belts far more compact than flat belts for a given power.

**Governing equations**

\[
L = 2C + \frac{\pi(D_1 + D_2)}{2} + \frac{(D_2 - D_1)^2}{4C}
\]

\[
\frac{F_1}{F_2} = e^{\mu\,\theta}, \quad P = \frac{(F_1 - F_2)\,v}{1000}
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
| `frictionCoeff` | Belt-pulley friction \( \mu \) |
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
2. ISO 4184:1992. *Classical V-belts and pulleys*.
3. Gates Corporation. *Drive Design Manual*.
4. Marks' Standard Handbook for Mechanical Engineers, 12th ed., McGraw-Hill.
5. Childs, P. R. N. *Mechanical Design Engineering Handbook*, 2nd ed., Ch. 14.
