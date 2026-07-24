---
seoTitle: "Worm Gear Calculator – Efficiency, Contact Stress & Self-Locking Check"
seoDescription: "Screen worm and worm-wheel drives for efficiency, sliding velocity, contact stress, thermal load, and self-locking condition per DIN 3996 and ISO/TR 14521."
guideHeadline: "Engineering guide to worm gear drive design and thermal screening"
keywords:
  - worm gear calculator
  - worm drive efficiency
  - self-locking gear
  - worm gear contact stress
  - DIN 3996 worm
  - sliding velocity
  - worm gear thermal
---

### Worm Gear Drive (`worm-gears`)

## How engineers design worm gear drives

Worm drives deliver high speed reductions (up to 100:1 single stage) in compact packages by meshing a helical worm with a throated wheel at 90 deg shaft angle. Their unique sliding contact means efficiency, heat generation, and self-locking behaviour dominate the design. Engineers select lead angle and materials to balance efficiency against the self-locking property needed for hoists and conveyors.

## Types and configurations

| Type | Description |
|------|-------------|
| Single-enveloping | Cylindrical worm, throated wheel — most common |
| Double-enveloping (globoidal) | Both worm and wheel throated — higher capacity, expensive |
| Multi-start worm | 2–6 starts for higher efficiency at lower ratios |
| Self-locking worm | Lead angle below friction angle prevents back-driving |

## Engineering workflow

1. Determine required ratio, input power, and input speed.
2. Select number of worm starts and wheel teeth for the target ratio.
3. Choose axial module and face width.
4. Compute lead angle and efficiency from friction coefficient.
5. Check self-locking condition if back-driving prevention is needed.
6. Evaluate sliding velocity and select appropriate lubrication.
7. Screen contact stress against wheel material allowable (bronze, cast iron).
8. Estimate heat generation \( Q = P(1-\eta) \) and verify thermal dissipation.

## Key quantities and formulas

Efficiency (worm driving):

\[
\eta = \frac{\tan\lambda}{\tan(\lambda + \phi)}
\]

Sliding velocity and worm pitch diameter:

\[
v_s = \frac{v_1}{\cos\lambda}, \quad d_w = \frac{m \, N_w}{\cos\lambda}
\]

Contact stress screening:

\[
\sigma_c = Z_E \sqrt{\frac{F_n}{b \, \rho_{\text{eq}}}} \leq \sigma_{HP}
\]

Heat loss:

\[
Q = P(1 - \eta)
\]

## Worked example

A single-start worm with 40-tooth wheel, axial module 5 mm, face width 50 mm, transmitting 3 kW at 1500 rpm worm speed. Friction coefficient 0.05.

- Lead angle: \( \lambda = \arctan(1 \times 5 / (\pi \times d_w)) \). For \( d_w \approx 50 \) mm, \( \lambda \approx 1.82° \).
- Efficiency: \( \eta = \tan(1.82°)/\tan(1.82° + 2.86°) = 0.39 \) — only 39%, typical for single-start worms.
- Self-locking: \( \lambda < \phi \) (1.82 deg < 2.86 deg) — the drive is self-locking.
- Heat loss: \( Q = 3 \times (1 - 0.39) = 1.83 \) kW — requires oil bath and fan cooling.

## Common mistakes and checks

- **Assuming self-locking is absolute:** dynamic friction may differ from static — vibration can release a "self-locked" worm.
- **Ignoring thermal limits:** low efficiency means most input power becomes heat; oil temperature must stay below 90 C.
- **Selecting single-start for high-speed applications:** efficiency below 50% wastes energy; use 2–4 starts when ratio permits.
- **Using hardened steel wheels:** bronze or cast iron wheels are required for proper run-in; steel-on-steel worm pairs seize.

## FAQ

### When is a worm gear self-locking?

When the lead angle \( \lambda \) is less than the friction angle \( \phi = \arctan(\mu) \). Self-locking prevents the load from back-driving the motor.

### How can I improve worm drive efficiency?

Increase the number of starts (raises lead angle), use polished worm surfaces, and select synthetic lubricants with lower friction coefficients.

### What materials pair well for worm drives?

Hardened steel worm with phosphor bronze wheel is the industry standard. Cast iron wheels are used in low-speed, low-load applications.

### Why is sliding velocity important?

Sliding velocity determines lubrication regime and wear rate. Above 10 m/s, full hydrodynamic lubrication is feasible; below 0.5 m/s, boundary lubrication dominates with higher wear.

### Can worm gears handle shock loads?

Poorly — the high sliding contact makes worm teeth vulnerable to scuffing under sudden torque spikes. Use a coupling or torque limiter upstream.

## Use the PhyCalcPro calculator

Open the [Worm Gears calculator](/products/machine/worm-gears) to enter worm starts, wheel teeth, module, face width, speed, and friction coefficient. The tool returns gear ratio, efficiency, self-locking flag, sliding velocity, contact stress utilization, and heat loss.

---

**Purpose**

Screen worm and worm-wheel drives for efficiency, sliding velocity, contact stress, and thermal load. Worm drives provide high speed reduction in compact envelopes but generate significant sliding and heat.

**Physics & theory**

A worm is a helical gear with one or few teeth (threads); the worm wheel mates at 90 deg shaft angle. Lead angle \( \lambda \) and friction angle \( \phi \) determine efficiency. Self-locking occurs when \( \lambda < \phi \), preventing back-driving. Sliding velocity along tooth flanks is high, limiting efficiency and promoting wear. Heat generation \( Q = P(1-\eta) \) must be dissipated to avoid oil breakdown.

**Governing equations**

\[
\eta = \frac{\tan\lambda}{\tan(\lambda + \phi)}
\]

\[
v_s = \frac{v_1}{\cos\lambda}, \quad d_w = \frac{m \, N_w}{\cos\lambda}
\]

\[
\sigma_c = Z_E \sqrt{\frac{F_n}{b \, \rho_{\text{eq}}}} \leq \sigma_{HP}
\]

**Numerical method**

Closed-form geometry and efficiency calculations. Friction coefficient from material pair and lubrication. Contact stress screened against allowable; thermal power loss computed for oil bath sizing guidance.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Worm threads, wheel teeth | Tooth counts |
| `module`, `faceWidth` | Axial module and face width |
| `power`, `speed` | Worm speed and power |
| Friction coefficient | From material/lubrication |
| Material allowables | Contact stress limit |

**Outputs**

- Gear ratio, efficiency, self-locking flag, sliding velocity, contact stress utilization, heat loss (kW).

**Design codes & checks**

- **Indicative:** Efficiency, contact stress utilization
- **DIN:** DIN 3996 worm gear load capacity (reference)
- **ISO:** ISO/TR 14521 worm gear rating (reference)

**Assumptions & limitations**

- Cylindrical worm with throated wheel; no double-enveloping geometry.
- Steady-state thermal balance not fully solved — heat loss is screening only.
- Wear and pitting life not computed to ISO/TR 14521 full method.
- Manufacturing tolerance effects on contact pattern omitted.

**References**

1. ISO/TR 14521:2020. *Gears — Calculation of load capacity of worm gears*.
2. DIN 3996:2016. *Tragfähigkeitsberechnung von Zylinderschneckengetrieben*.
3. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
4. Dudley, D. W. *Handbook of Practical Gear Design*, 2nd ed.
