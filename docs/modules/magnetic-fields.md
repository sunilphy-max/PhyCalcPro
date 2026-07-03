### Magnetic Fields & Coils (`magnetic-fields`)

**Purpose**

Estimate solenoid magnetic field, inductance, stored magnetic energy, Lorentz force on conductors, and resistive coil heating. Supports electromagnet and actuator screening before detailed FEA or magnetic circuit design.

**Physics & theory**

A long solenoid with \( N \) turns carrying current \( I \) over length \( L \) produces uniform field \( B = \mu_0 N I / L \) in the interior (SI units, \( \mu_0 = 4\pi \times 10^{-7} \) H/m). Inductance \( L_{\mathrm{ind}} = \mu_0 N^2 A / L \) for cross-sectional area \( A \).

Stored magnetic energy \( E = \frac{1}{2} L_{\mathrm{ind}} I^2 \). Lorentz force on straight conductor length \( \ell \) perpendicular to field: \( F = B I \ell \). Resistive heating \( P = I^2 R \) from coil resistance \( R \) must be removed to limit temperature rise.

Advanced systems calculators use lumped-parameter screening models suitable for concept trade studies. Each calculator returns explicit assumptions and warnings arrays documenting model limits. Constants such as ( sigma ) (Stefan–Boltzmann), ( mu_0 ), and ( R ) (gas constant) use SI definitions from the solver source.

Results are not certified for regulatory submission without independent verification against detailed analysis or test data.

**Governing equations**

\[
B = \frac{\mu_0 N I}{L}
\]

\[
L_{\mathrm{ind}} = \frac{\mu_0 N^2 A}{L}, \quad E = \frac{1}{2} L_{\mathrm{ind}} I^2
\]

\[
F = B I \ell, \quad P_{\mathrm{coil}} = I^2 R
\]

**Numerical method**

Closed-form long-solenoid and inductance formulas (`advanced-systems/calculators`). Lorentz force assumes conductor perpendicular to \( B \). No saturation, fringing, or eddy current losses.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `turns`, `current` | \( N \), \( I \) |
| `coilLength`, `coilArea` | Geometry |
| `activeWireLength` | Conductor in field |
| `resistance` | Coil resistance (Ω) |

**Outputs**

- Magnetic field (T), inductance (H), stored energy (J)
- Lorentz force (N), resistive heating (W).

**Design codes & checks**

- **Indicative:** Solenoid field, stored energy, coil heating screening
- **IEC:** Electrical equipment practice (context)


**Assumptions & limitations**

- Long-solenoid approximation; fringe fields ignored.
- Linear magnetic circuit; no ferromagnetic saturation or hysteresis.
- DC or quasi-steady; no switching transients or skin effect.
- Structural support for Lorentz loads not analyzed.

**References**

1. Griffiths, D. J. *Introduction to Electrodynamics*, 4th ed. Pearson.
2. Feynman, R. P., et al. *The Feynman Lectures on Physics*, Vol. II.
3. Montgomery, D. C., & Turner, L. R. *Principles of Superconducting Magnet Design*. Wiley.
4. IEC 60076 series — transformer and reactor design context.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
