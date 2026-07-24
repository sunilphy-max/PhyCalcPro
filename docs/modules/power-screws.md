---
seoTitle: "Power Screw & Ball Screw Calculator – Torque, Efficiency & Buckling"
seoDescription: "Design power screws and ball screws: compute raising/lowering torque, efficiency, thread stress, and column buckling margin for Acme, square, and ball-screw types."
guideHeadline: "Engineering guide to power screw and ball screw design"
keywords:
  - power screw calculator
  - ball screw design
  - Acme thread torque
  - screw efficiency
  - lead screw buckling
  - screw jack design
  - thread stress analysis
---

### Power & Ball Screws (`power-screws`)

## How engineers design power screw drives

Power screws convert rotary torque into precise linear force — from screw jacks and presses to CNC axes and actuators. The design balances torque requirement, efficiency, self-locking capability, thread stress, and column stability. Ball screws replace sliding friction with rolling elements for higher efficiency but lose the self-locking property that makes Acme screws popular for jacks.

## Types and configurations

| Type | Thread form | Efficiency | Self-locking |
|------|-------------|-----------|--------------|
| Square thread | Ideal, rarely manufactured | 40–70% | Possible |
| Acme (trapezoidal) | Standard power thread | 30–60% | Common |
| Buttress | One-direction load | 40–65% | One direction |
| Ball screw | Rolling elements | 85–95% | No |

## Engineering workflow

1. Determine required axial force and linear speed.
2. Select screw type (power vs ball) based on efficiency and self-locking needs.
3. Choose major diameter, pitch, and number of starts.
4. Compute lead angle and friction-dependent raising/lowering torque.
5. Check thread shear and bearing stresses against allowables.
6. Evaluate column buckling for the unsupported screw length.
7. For ball screws, verify critical speed and life rating.

## Key quantities and formulas

Raising torque for a power screw:

\[
T_r = \frac{F \, d_m}{2}\left(\frac{\pi \mu d_m + L}{\pi d_m - \mu L}\right)
\]

Screw efficiency:

\[
\eta = \frac{F \, L}{2\pi \, T_r}
\]

Euler column buckling:

\[
P_{cr} = \frac{\pi^2 E I}{L_e^2}
\]

Lead angle:

\[
\lambda = \arctan\!\left(\frac{L}{\pi d_m}\right)
\]

## Worked example

An Acme screw jack lifts 50 kN. Major diameter 40 mm, pitch 6 mm, single start, friction coefficient 0.15.

- Mean diameter: \( d_m \approx 37 \) mm, lead \( L = 6 \) mm.
- Lead angle: \( \lambda = \arctan(6 / (\pi \times 37)) = 2.95° \).
- Raising torque: \( T_r = 50000 \times 0.037/2 \times (0.15 \times \pi \times 0.037 + 0.006)/(\pi \times 0.037 - 0.15 \times 0.006) = 175 \) N-m (approx).
- Efficiency: \( \eta = 50000 \times 0.006 / (2\pi \times 175) = 27\% \).
- Self-locking: \( \lambda (2.95°) < \phi (8.53°) \) — yes, self-locking.

## Common mistakes and checks

- **Ignoring collar friction:** the thrust collar can double the required torque if not lubricated.
- **Assuming ball screws are self-locking:** they are not — a brake is required to hold position under load.
- **Neglecting buckling on long strokes:** an extended screw in compression behaves as a slender column.
- **Using static friction for running torque:** kinetic friction is lower; use the correct value for continuous operation.
- **Exceeding critical speed on ball screws:** whip resonance destroys ball screw assemblies above the critical rpm.

## FAQ

### When should I choose a ball screw over an Acme screw?

When efficiency matters — ball screws achieve 85–95% vs 30–60% for Acme. Ball screws are preferred for servo drives, CNC machines, and any application requiring low heat generation.

### How do I check for self-locking?

A power screw is self-locking when the lead angle is less than the friction angle: \( \lambda < \arctan(\mu) \). Ball screws cannot self-lock.

### What determines the critical speed of a ball screw?

Critical speed depends on screw diameter, unsupported length, and end fixity. Longer screws and smaller diameters lower the critical speed.

### Can I use multiple starts to increase speed?

Yes — multiple starts increase lead (and linear speed per revolution) but raise the lead angle, reducing torque required and potentially losing self-locking.

### What is the difference between pitch and lead?

Pitch is the distance between adjacent threads; lead is the axial advance per revolution. For a single-start screw, lead equals pitch. For multi-start, lead = starts times pitch.

## Use the PhyCalcPro calculator

Open the [Power Screws calculator](/products/machine/power-screws) to enter screw type, geometry, axial force, and friction coefficient. The tool returns required torque, efficiency, thread stresses, column safety factor, and self-locking status.

---

**Purpose**

Design and check power screws and ball screws for torque, efficiency, thread stress, and buckling margin.

**Physics & theory**

A power screw converts torque to axial force through thread friction. Efficiency depends on lead angle and friction coefficient. Ball screws add rolling friction with higher efficiency. Column buckling and critical speed may limit unsupported length.

**Governing equations**

\[
T_r = \frac{F \, d_m}{2}\left(\frac{\pi \mu d_m + L}{\pi d_m - \mu L}\right), \quad \eta = \frac{F \, L}{2\pi \, T_r}
\]

\[
P_{cr} = \frac{\pi^2 E I}{L_e^2}
\]

**Numerical method**

Thread-aware screening via `solveScrewEngine` / `solveScrewFEM` with square, Acme, and ball-screw configurations.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `screwType` | Power screw or ball screw |
| `majorDiameter`, `pitch`, `lead`, `length` | Geometry |
| `axialForce`, `frictionCoefficient` | Load and friction |
| `threadType`, `starts` | Thread form (power screws) |

**Outputs**

- Required torque, efficiency, thread and column safety factors, power, recommendations.

**Design codes & checks**

- **Indicative:** Thread stress and buckling screening
- **US:** Shigley / machinery handbook references

**Assumptions & limitations**

- Uniform load, no nut compliance FEA. Ball screw speed limits are indicative.
- Collar friction may be separately specified or omitted.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 8.
2. MITCalc Power Screws and Ball Screws — independent benchmark context.
3. NSK Ltd. *Ball Screw Technical Reference*.
4. ISO 3408:2006. *Ball screws*.
