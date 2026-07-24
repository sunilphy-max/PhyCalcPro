---
seoTitle: "Suspension & Roll Calculator – Roll Angle, Load Transfer & Cornering"
seoDescription: "Screen vehicle roll response and lateral load transfer under cornering: compute roll angle, roll moment, and wheel load transfer for suspension geometry sizing."
guideHeadline: "Engineering guide to vehicle suspension roll and lateral load transfer"
keywords:
  - suspension calculator
  - vehicle roll angle
  - lateral load transfer
  - cornering analysis
  - roll stiffness
  - sprung mass dynamics
  - anti-roll bar design
---

### Suspension & Sway (`suspension`)

## How engineers analyze vehicle roll behavior

When a vehicle corners, lateral acceleration creates an inertial force on the sprung mass that produces a roll moment about the roll axis. The suspension's roll stiffness resists this moment, determining the roll angle. Excessive roll shifts load from inner to outer wheels, reducing overall grip. Engineers use roll and load transfer analysis to tune spring rates, anti-roll bars, and CG height for safe, predictable handling.

## Analysis types and configurations

| Parameter | Effect |
|-----------|--------|
| Roll stiffness \( k_\phi \) | Higher stiffness reduces roll angle |
| CG height | Higher CG increases roll moment |
| Track width | Wider track reduces load transfer |
| Anti-roll bar | Adds roll stiffness without changing ride |
| Mass distribution | Front/rear split affects balance |

## Engineering workflow

1. Define vehicle sprung mass, track width, and wheelbase.
2. Measure or estimate CG height above the roll axis.
3. Calculate total roll stiffness from front and rear spring rates plus anti-roll bars.
4. Set the cornering acceleration (typically 0.3–1.0 g for road vehicles).
5. Compute lateral inertial force and roll moment.
6. Calculate roll angle from moment and stiffness.
7. Compute lateral load transfer across the track.
8. Compare roll angle to stability thresholds (2 deg stable, 5 deg moderate).
9. Adjust springs or anti-roll bar to achieve target balance.

## Key quantities and formulas

Lateral force and roll moment:

\[
F_y = m_s \, a_y, \quad M_{\text{roll}} = F_y \, \frac{w}{2}
\]

Roll angle:

\[
\phi = \frac{M_{\text{roll}}}{k_\phi}
\]

Lateral load transfer:

\[
\Delta W = \frac{F_y \, h}{t}
\]

Natural roll frequency:

\[
f_{\text{roll}} = \frac{1}{2\pi}\sqrt{\frac{k_\phi}{I_{\text{roll}}}}
\]

## Worked example

A passenger car with sprung mass 1200 kg, track width 1.5 m, CG height 0.55 m, roll stiffness 60,000 N-m/rad, cornering at 0.5 g.

- Lateral force: \( F_y = 1200 \times 0.5 \times 9.81 = 5886 \) N.
- Roll moment: \( M = 5886 \times 1.5/2 = 4415 \) N-m.
- Roll angle: \( \phi = 4415/60000 = 0.0736 \) rad = 4.2 deg — moderate roll.
- Load transfer: \( \Delta W = 5886 \times 0.55/1.5 = 2158 \) N per side.
- Each outer wheel gains ~2158 N, each inner wheel loses ~2158 N.

## Common mistakes and checks

- **Forgetting tire vertical rate contribution:** tire compliance adds to suspension compliance, reducing effective roll stiffness.
- **Using total mass instead of sprung mass:** unsprung mass (wheels, axles) does not roll with the body.
- **Neglecting roll center height:** the CG height above the roll axis (not above ground) determines roll moment.
- **Ignoring transient effects:** during rapid lane changes, roll damping and roll inertia matter — this module solves steady-state only.

## FAQ

### What roll angle is acceptable for passenger cars?

Passenger cars typically allow 3–6 deg at maximum lateral acceleration. Sports cars target under 2 deg. SUVs may roll 5–8 deg.

### How does an anti-roll bar work?

An anti-roll bar is a torsion spring connecting left and right wheels. It adds roll stiffness without affecting single-wheel bump stiffness, reducing roll without harshening ride.

### What is lateral load transfer ratio (LTR)?

LTR = \( \Delta W / (W/2) \) where \( W \) is total axle weight. LTR = 1.0 means the inner wheel has lifted — rollover is imminent.

### Does this module account for suspension geometry (roll center migration)?

No — the roll center is treated as a fixed point. For detailed kinematics, use a multi-body dynamics tool.

### How does CG height affect rollover risk?

Higher CG increases both roll angle and load transfer. For a given track width, reducing CG height is the most effective way to improve rollover resistance.

## Use the PhyCalcPro calculator

Open the [Suspension & Sway calculator](/products/dynamics/suspension) to enter sprung mass, lateral acceleration, track width, CG height, and roll stiffness. The tool returns lateral force, roll moment, roll angle, load transfer, and design status.

---

**Purpose**

Screen vehicle roll response and lateral load transfer under cornering acceleration. Computes roll angle, roll moment, and wheel load transfer for sprung-mass suspension geometry screening.

**Physics & theory**

Lateral acceleration \( a_y \) on sprung mass \( m_s \) creates inertial force \( F_y = m_s a_y \) at the CG. This force times CG height produces roll moment. Roll angle \( \phi = M_{\text{roll}}/k_\phi \) depends on roll stiffness from springs, anti-roll bars, and tire vertical rates. Load transfer \( \Delta W = F_y h/t \) shifts load from inner to outer wheels.

**Governing equations**

\[
F_y = m_s \, a_y, \quad M_{\text{roll}} = F_y \, \frac{w}{2}
\]

\[
\phi = \frac{M_{\text{roll}}}{k_\phi}, \quad \Delta W = \frac{F_y \, h}{t}
\]

**Numerical method**

Closed-form roll and load transfer. Roll angle in degrees compared to stability thresholds.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `sprungMass` | Sprung mass \( m_s \) |
| `lateralAcceleration` | Cornering \( a_y \) (m/s\(^2\)) |
| `wheelbase`, `trackWidth` | Geometry |
| `cgHeight` | CG height \( h \) |
| `rollStiffness` | Total roll rate \( k_\phi \) (N-m/rad) |

**Outputs**

- Lateral force, roll moment, roll angle (degrees), load transfer, design status.

**Design codes & checks**

- **Indicative:** Roll angle and load transfer screening

**Assumptions & limitations**

- Steady-state cornering; no transient roll dynamics or damping.
- Rigid body sprung mass; no compliance frequency analysis.
- Does not compute understeer gradient or tire friction ellipse.
- Anti-roll bar tuning requires detailed suspension model beyond this screen.

**Verification**

- CI: `suspension-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Gillespie, T. D. *Fundamentals of Vehicle Dynamics*. SAE International.
2. Milliken, W. F., & Milliken, D. L. *Race Car Vehicle Dynamics*. SAE.
3. Reimpell, J., et al. *The Automotive Chassis*, 2nd ed. SAE.
4. ISO 4138:2012. *Passenger cars — Steady-state circular driving behaviour*.
