---
seoTitle: "Flywheel Design Calculator – Inertia Sizing, Rim Stress & Energy Storage"
seoDescription: "Size flywheels for speed regulation and energy storage: compute required moment of inertia, rim hoop stress, stored energy, and coefficient of fluctuation."
guideHeadline: "Engineering guide to flywheel design for energy storage and speed regulation"
keywords:
  - flywheel calculator
  - flywheel inertia sizing
  - rim stress analysis
  - energy storage flywheel
  - speed fluctuation coefficient
  - flywheel mass calculation
  - rotational energy storage
---

### Flywheel Design (`flywheels`)

## How engineers size flywheels

Flywheels smooth speed fluctuations in cyclic machines — presses, engines, compressors — by storing and releasing kinetic energy during each cycle. The design objective is finding the minimum moment of inertia that keeps speed variation within acceptable limits, then verifying that centrifugal rim stress does not exceed the material's strength.

## Types and configurations

| Type | Construction | Application |
|------|-------------|-------------|
| Solid disk | Cast iron or steel | Low-speed presses, small engines |
| Rim-type | Spoked with heavy rim | Medium-speed machinery |
| Composite | Carbon fiber wound | High-speed energy storage |
| Dual-mass | Two inertias with spring | Automotive drivetrain smoothing |

## Engineering workflow

1. Determine the cyclic energy variation \( \Delta E \) from the torque-angle diagram.
2. Set the acceptable coefficient of speed fluctuation \( C_s \) (0.002 for generators, 0.2 for crushers).
3. Compute required moment of inertia from \( \Delta E \) and speed limits.
4. Select geometry (outer radius, rim thickness, width) to achieve the target inertia.
5. Check rim hoop stress from centrifugal loading at maximum speed.
6. Verify burst safety factor against material ultimate tensile strength.
7. Ensure the shaft and bearings can support the flywheel weight and gyroscopic loads.

## Key quantities and formulas

Stored kinetic energy:

\[
E = \frac{1}{2} I \omega^2
\]

Energy change over a cycle:

\[
\Delta E = \frac{1}{2} I (\omega_{\max}^2 - \omega_{\min}^2)
\]

Coefficient of speed fluctuation:

\[
C_s = \frac{\omega_{\max} - \omega_{\min}}{\omega_{\text{mean}}}
\]

Rim hoop stress:

\[
\sigma_{\text{rim}} = \rho \, r^2 \omega^2
\]

## Worked example

A punch press operates at 300 rpm mean speed with \( \Delta E = 5000 \) J and target \( C_s = 0.05 \). Material: cast iron (\( \rho = 7200 \) kg/m\(^3\), \( \sigma_{UTS} = 200 \) MPa).

- Mean angular velocity: \( \omega = 2\pi \times 300/60 = 31.42 \) rad/s.
- Required inertia: \( I = \Delta E / (C_s \omega^2) = 5000 / (0.05 \times 31.42^2) = 101.3 \) kg-m\(^2\).
- For a rim at \( r = 0.4 \) m: \( m = I/r^2 = 101.3/0.16 = 633 \) kg.
- Rim stress: \( \sigma = 7200 \times 0.4^2 \times 31.42^2 = 1.14 \) MPa — well below UTS.

## Common mistakes and checks

- **Using mean speed instead of speed range:** \( C_s \) is the ratio of speed variation to mean — confusing the two oversizes the flywheel.
- **Ignoring startup torque:** accelerating a heavy flywheel from rest requires significant motor starting torque.
- **Neglecting gyroscopic effects:** flywheels on vehicles or ships create precession moments during turns.
- **Thin-rim assumption on solid disks:** solid disks have different radial and tangential stress distributions — the thin-rim formula underestimates peak stress.

## FAQ

### What coefficient of fluctuation is typical for different machines?

Generators: 0.002–0.003. Machine tools: 0.02–0.03. Punch presses: 0.05–0.10. Crushers: 0.10–0.20.

### Can a flywheel replace a larger motor?

Yes — the flywheel stores energy between punches, allowing a smaller motor to deliver average power rather than peak power. This is the primary economic advantage.

### What limits flywheel speed?

Rim hoop stress from centrifugal force. At the burst speed, hoop stress equals material ultimate strength. Safety factors of 3–4 are standard.

### How does material density affect flywheel size?

Denser materials store more energy per volume. Cast iron and steel dominate; composite flywheels trade density for extreme speed capability.

### Should the flywheel be on the motor shaft or the driven shaft?

Place it on the slowest shaft where speed fluctuation is worst. For geared systems, reflect the inertia through the gear ratio.

## Use the PhyCalcPro calculator

Open the [Flywheel Design calculator](/products/machine/flywheels) to enter energy fluctuation, speed range, geometry, and material properties. The tool returns required inertia, rim mass, stored energy, rim stress, speed fluctuation coefficient, and stress utilization.

---

**Purpose**

Size flywheels for energy storage and speed regulation by computing required moment of inertia, rim stress, and energy capacity for a specified speed fluctuation or power pulse.

**Physics & theory**

A flywheel stores kinetic energy \( E = \frac{1}{2} I \omega^2 \). For a rim-dominated disk, \( I \approx m r^2 \). Energy change between max and min speed during a cycle is \( \Delta E = \frac{1}{2} I (\omega_{\max}^2 - \omega_{\min}^2) \). Rim stress from centrifugal loading approximates hoop tension \( \sigma = \rho r^2 \omega^2 \) for thin rings.

**Governing equations**

\[
E = \frac{1}{2} I \omega^2, \quad \Delta E = \frac{1}{2} I (\omega_{\max}^2 - \omega_{\min}^2)
\]

\[
C_s = \frac{\omega_{\max} - \omega_{\min}}{\omega_{\text{mean}}}
\]

\[
\sigma_{\text{rim}} = \rho \, r^2 \omega^2
\]

**Numerical method**

Closed-form energy-inertia relations. Required \( I \) computed from specified \( \Delta E \) and speed limits. Geometry iterated to achieve target inertia while checking rim stress utilization.

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
