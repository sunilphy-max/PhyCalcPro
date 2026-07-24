---
seoTitle: "Magnetic Field & Coil Calculator: Solenoid Field, Inductance & Lorentz Force"
seoDescription: "How engineers estimate solenoid magnetic field, inductance, stored energy, Lorentz force, and resistive coil heating for electromagnet and actuator design."
guideHeadline: "How Engineers Design Electromagnetic Coils"
keywords: ["magnetic field", "solenoid", "inductance", "Lorentz force", "electromagnet", "coil design"]
---

### Magnetic Fields & Coils (`magnetic-fields`)

## How engineers design electromagnetic coils

Electromagnets and actuators convert electrical current into magnetic field and mechanical force. Engineers need to estimate field strength inside a solenoid, inductance for circuit design, stored energy for safety analysis, Lorentz force on conductors, and resistive heating for thermal management. These screening calculations precede detailed FEA or magnetic circuit modelling.

This guide covers the long-solenoid model, energy storage, force on current-carrying conductors, and thermal limits of resistive coils.

## Coil types and when to use this model

| Configuration | Model fit | Limitations |
|--------------|-----------|-------------|
| Long solenoid (\(L \gg D\)) | Good — uniform interior field | Fringe fields ignored |
| Short solenoid | Approximate — field non-uniform | Use Biot-Savart or FEA |
| Helmholtz pair | Qualitative — central uniformity | Not a single-solenoid model |
| Iron-core electromagnet | Approximate — multiply by \(\mu_r\) | Saturation not modelled |
| Air-core actuator | Good — force and inductance | No mechanical dynamics |
| Superconducting coil | Field and energy OK | Use Superconducting Systems for margins |

## Engineering workflow

1. **Define field requirement** — target \(B\) at the centre of the coil.
2. **Choose geometry** — coil length, cross-section area, number of turns.
3. **Compute required current** — from \(B = \mu_0 N I / L\).
4. **Check inductance** — for power supply and switching circuit design.
5. **Estimate stored energy** — for quench protection or discharge safety.
6. **Compute Lorentz force** — on conductors and any payload in the field.
7. **Check resistive heating** — \(P = I^2 R\); ensure cooling can remove the heat.

## Key quantities and formulas

Solenoid interior field:

\[
B = \frac{\mu_0\,N\,I}{L}
\]

Inductance (air-core solenoid):

\[
L_{\mathrm{ind}} = \frac{\mu_0\,N^2\,A}{L}
\]

Stored magnetic energy:

\[
E = \frac{1}{2}\,L_{\mathrm{ind}}\,I^2
\]

Lorentz force on a straight conductor:

\[
F = B\,I\,\ell
\]

Resistive heating:

\[
P = I^2\,R
\]

## Worked example

**Given:** Air-core solenoid — 500 turns, length 0.2 m, cross-section area 0.005 m², current 10 A, coil resistance 2.5 \(\Omega\). Active wire length in field: 0.3 m.

1. Field: \(B = 4\pi \times 10^{-7} \times 500 \times 10 / 0.2 = 31.4\) mT.
2. Inductance: \(L_{\mathrm{ind}} = 4\pi \times 10^{-7} \times 500^2 \times 0.005 / 0.2 = 7.85\) mH.
3. Stored energy: \(E = 0.5 \times 7.85 \times 10^{-3} \times 100 = 0.393\) J.
4. Lorentz force: \(F = 0.0314 \times 10 \times 0.3 = 0.094\) N.
5. Heating: \(P = 100 \times 2.5 = 250\) W — significant; forced-air or liquid cooling required.

**Interpretation:** The 250 W dissipation limits continuous operation without active cooling. For higher fields, consider more turns at lower current (increases inductance but reduces \(I^2 R\)) or switch to a superconducting coil.

## Common mistakes and checks

- Applying the **long-solenoid formula** to a coil where length is comparable to diameter — field is non-uniform.
- Ignoring **fringe fields** outside the coil — safety and EMC considerations.
- Forgetting **inductance** when switching current — \(V = L \, dI/dt\) causes voltage spikes.
- Underestimating **resistive heating** — copper resistivity rises with temperature, creating a thermal runaway risk.
- Assuming **linear magnetic response** with an iron core — saturation limits field above 1.5–2 T.
- Not accounting for **structural loads** from Lorentz forces on windings.

## FAQ

### How strong a field can a resistive solenoid achieve?

Practical air-core resistive solenoids reach 1–30 mT for bench-scale coils. Bitter electromagnets with intense cooling reach 30–45 T. Superconducting magnets are needed for sustained fields above a few tesla.

### What is the difference between B and H?

\(B\) is magnetic flux density (tesla); \(H\) is magnetic field intensity (A/m). In free space, \(B = \mu_0 H\). In magnetic materials, \(B = \mu_0 \mu_r H\) where \(\mu_r\) is the relative permeability.

### How does an iron core affect the calculation?

An iron core multiplies the air-core field by the relative permeability \(\mu_r\) (up to 5000 for soft iron). However, the core saturates above 1.5–2 T and the linear model breaks down.

### When should I move to FEA?

When the geometry is short or non-cylindrical, when an iron core is present (saturation, fringing), or when detailed force distributions on conductors are needed for structural design.

### How do I size the power supply?

Steady state: \(V = IR\). Transient ramp: \(V = IR + L\,dI/dt\). The power supply must deliver the higher of steady-state voltage or the ramp voltage at the desired current slew rate.

## Use the PhyCalcPro calculator

Open the [Magnetic fields calculator](/products/advanced-systems/magnetic-fields). Enter turns, current, coil geometry, wire length, and resistance. Review solenoid field, inductance, stored energy, Lorentz force, and resistive heating for electromagnet or actuator screening.

**Purpose**

Estimate solenoid magnetic field, inductance, stored magnetic energy, Lorentz force on conductors, and resistive coil heating. Supports electromagnet and actuator screening before detailed FEA or magnetic circuit design.

**Physics & theory**

A long solenoid with \(N\) turns carrying current \(I\) over length \(L\) produces uniform field \(B = \mu_0 NI/L\). Inductance \(L_{\mathrm{ind}} = \mu_0 N^2 A/L\). Stored energy \(E = \frac{1}{2}L_{\mathrm{ind}}I^2\). Lorentz force on a straight conductor perpendicular to the field: \(F = BIl\). Resistive heating \(P = I^2 R\).

**Governing equations**

\[
B = \frac{\mu_0\,N\,I}{L}
\]

\[
L_{\mathrm{ind}} = \frac{\mu_0\,N^2\,A}{L}, \quad E = \frac{1}{2}\,L_{\mathrm{ind}}\,I^2
\]

\[
F = B\,I\,\ell, \quad P = I^2\,R
\]

**Numerical method**

Closed-form long-solenoid and inductance formulas. Lorentz force assumes conductor perpendicular to \(B\). No saturation, fringing, or eddy current losses.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Turns, current | \(N\), \(I\) |
| Coil length, coil area | Geometry |
| Active wire length | Conductor in field |
| Resistance | Coil resistance (\(\Omega\)) |

**Outputs**

- Magnetic field (T), inductance (H), stored energy (J), Lorentz force (N), resistive heating (W).

**Design codes & checks**

- **Indicative:** Solenoid field, stored energy, coil heating screening
- **IEC:** Electrical equipment practice (context)

**Assumptions & limitations**

- Long-solenoid approximation; fringe fields ignored.
- Linear magnetic circuit; no ferromagnetic saturation or hysteresis.
- DC or quasi-steady; no switching transients or skin effect.
- Structural support for Lorentz loads not analysed.

**References**

1. Griffiths, D. J. *Introduction to Electrodynamics*, 4th ed. Pearson.
2. Feynman, R. P., et al. *The Feynman Lectures on Physics*, Vol. II.
3. Montgomery, D. C., & Turner, L. R. *Principles of Superconducting Magnet Design*. Wiley.
4. IEC 60076 series — transformer and reactor design context.
