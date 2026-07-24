---
seoTitle: "Timing Belt Drive Calculator – Synchronous Belt Sizing & Tooth Selection"
seoDescription: "Size synchronous timing belt drives online: pitch length, tooth count, belt speed, power capacity, and shaft loads for HTD, GT, and trapezoidal profiles."
guideHeadline: "Engineering guide to timing belt drive design and synchronous belt selection"
keywords:
  - timing belt calculator
  - synchronous belt sizing
  - HTD belt design
  - tooth count selection
  - belt pitch length
  - timing pulley diameter
  - power transmission belt
---

### Timing Belt Drive (`timing-belts`)

## How engineers size synchronous belt drives

Timing belts use toothed engagement between belt and pulley to transmit power without slip. Unlike V-belts, the positive mesh guarantees exact speed ratios, making timing belts the standard choice for positioning systems, packaging machines, and compact high-ratio drives. Sizing a timing belt means selecting a pitch family, choosing pulley tooth counts, computing pitch length, and verifying that the belt's rated power exceeds the service-adjusted demand.

## Belt types and pitch families

| Profile | Pitch (mm) | Typical use |
|---------|-----------|-------------|
| MXL / XL | 2.03 / 5.08 | Light instruments, office equipment |
| L / H | 9.53 / 12.70 | General industrial drives |
| HTD 3M–14M | 3–14 | Medium to heavy power transmission |
| GT2 / GT3 / GT5 | 2–5 | High-accuracy CNC, robotics |
| Poly Chain GT Carbon | 8–14 | High-torque compact drives |

Trapezoidal profiles (XL, L, H) are traditional; curvilinear profiles (HTD, GT) improve tooth load distribution and reduce ratcheting risk.

## Engineering workflow

1. Determine required power, speed, and ratio.
2. Apply a service factor for driver type (motor, engine) and shock.
3. Select pitch family from manufacturer power-rating charts.
4. Choose driver and driven tooth counts to achieve the desired ratio.
5. Calculate pitch length from center distance and pulley diameters.
6. Round pitch length to the nearest whole-tooth increment.
7. Verify wrap angle on the small pulley (minimum 60 deg for 6 teeth in mesh).
8. Check belt speed against manufacturer limits (typically 40–80 m/s).
9. Confirm shaft radial loads for bearing selection.

## Key quantities and formulas

Pitch diameter from tooth count:

\[
D = \frac{p \, N}{\pi}
\]

Belt pitch length for a two-pulley open drive:

\[
L_p = 2C + \frac{\pi (D_1 + D_2)}{2} + \frac{(D_2 - D_1)^2}{4C}
\]

Belt linear speed and transmitted power:

\[
v = \frac{\pi D n}{60\,000}, \quad P = \frac{F_t \, v}{1000}
\]

Speed ratio (exact, no slip):

\[
i = \frac{N_2}{N_1}
\]

## Worked example

A 5M HTD belt drives a packaging roller at 3:1 reduction. Driver pulley has 20 teeth, driven has 60 teeth, center distance is 250 mm.

- Pitch diameters: \( D_1 = 5 \times 20 / \pi = 31.83 \) mm, \( D_2 = 5 \times 60 / \pi = 95.49 \) mm.
- Pitch length: \( L_p = 2(250) + \pi(31.83 + 95.49)/2 + (95.49 - 31.83)^2 / (4 \times 250) = 704.2 \) mm, rounded to 710 mm (142 teeth).
- Belt speed at 1750 rpm: \( v = \pi \times 31.83 \times 1750 / 60\,000 = 2.92 \) m/s — well within limits.

## Common mistakes and checks

- **Ignoring service factors:** a 1.0 kW motor can demand 1.6 kW design power under heavy shock.
- **Too few teeth in mesh:** wrap angle below 60 deg risks tooth jump under peak torque.
- **Not rounding to whole pitches:** fractional tooth lengths create misalignment.
- **Exceeding belt speed limits:** above manufacturer limit, centrifugal tension dominates.
- **Neglecting shaft loads:** belt tension produces radial bearing loads that must enter bearing selection.

## FAQ

### What minimum tooth count avoids excessive wear?

Most manufacturers recommend at least 14–16 teeth on the small pulley for HTD profiles; fewer teeth increase tooth stress and chordal speed variation.

### Can timing belts replace roller chains?

Yes, for clean environments where lubrication is impractical. Timing belts are quieter and maintenance-free but have lower shock tolerance than chains.

### How does belt width affect power capacity?

Rated power scales roughly linearly with belt width. Wider belts share tooth load across more area, directly raising capacity.

### Do timing belts need tensioning?

Yes. Pretension prevents tooth skip under peak loads. Automatic tensioners or slotted motor bases maintain proper tension as belts wear.

### When should I choose curvilinear over trapezoidal profiles?

Curvilinear (HTD/GT) profiles distribute load more evenly across tooth flanks and resist ratcheting at lower wrap angles — preferred for all new designs above 1 kW.

## Use the PhyCalcPro calculator

Open the [Timing Belt Drive calculator](/products/power-transmission/timing-belts) to enter tooth counts, pitch, center distance, and operating speed. The tool returns pitch length, belt speed, power utilization, belt tension, and shaft load components — ready for bearing and frame design.

---

**Purpose**

Size synchronous (toothed) belt drives by computing pitch length, number of teeth, belt speed, transmitted power, and shaft loads. Positive engagement eliminates slip, making timing belts suitable for positioning and high-ratio compact drives.

**Physics & theory**

Timing belts mesh with pulley teeth at a defined pitch \( p \). Pitch diameter relates to tooth count: \( D = p N / \pi \). Belt length for two pulleys includes tooth engagement arcs plus tangent spans. Unlike friction belts, power capacity is limited by tooth shear, belt tensile strength, and pulley tooth bending — the module applies manufacturer-style screening factors. Speed ratio \( i = N_2/N_1 \) is exact (no slip). Radial load on shafts combines belt tension from power transmission and centrifugal effects at high speed.

**Governing equations**

\[
D = \frac{p N}{\pi}, \quad v = \frac{\pi D n}{60}
\]

\[
L_p = 2C + \frac{\pi(D_1 + D_2)}{2} + \frac{(D_2 - D_1)^2}{4C}
\]

\[
P = \frac{F_t v}{1000}, \quad i = \frac{N_2}{N_1}
\]

**Numerical method**

Closed-form geometry and power screening per timing belt check templates. Tooth count and pitch determine pulley diameters; belt length rounded to whole tooth pitches. Power utilization compared against rated power adjusted by service, width, and speed factors.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Pitch / tooth count | Belt pitch and pulley teeth |
| `centerDistance` | Shaft spacing |
| `speedDriver`, `power` | Operating speed and power |
| Belt width, material | Width factor and rating |
| Service factor | Application derating |

**Outputs**

- Pitch length, tooth count, pulley diameters, belt speed, power utilization, estimated belt tension, shaft load components.

**Design codes & checks**

- **Indicative:** Power capacity and tension screening
- **ISO:** ISO 5296 synchronous belt drives (reference pitch systems)

**Assumptions & limitations**

- Two-pulley layout; no idler pulleys or back-side wrap.
- Screening-level rating — not a substitute for manufacturer software (Gates, Conti).
- Neglects belt stiffness dynamics and resonance at high speed.
- Standard trapezoidal or curvilinear tooth profiles per selected pitch family.

**Verification**

- CI: `timing-belts-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 17.
2. ISO 5296:2012. *Synchronous belt drives — Pulleys*.
3. Gates Corporation. *Poly Chain GT Carbon Design Manual*.
4. Budynas, R. G., Nisbett, J. K. *Shigley's Mechanical Engineering Design*, 11th ed.
