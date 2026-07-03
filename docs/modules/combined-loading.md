### Combined Loading (`combined-loading`) — **beta**

**Purpose**

Evaluate combined axial, bending, torsion, and shear stresses in a rectangular cross-section and compute von Mises equivalent stress and safety factor. Used for quick screening of machine elements and structural members under multiaxial loading without full 3D FEA.

**Physics & theory**

Real components rarely experience a single stress mode. Axial force \( F \) produces uniform normal stress \( \sigma_a = F/A \). Bending moment \( M \) creates linear normal stress \( \sigma_b = Mc/I \). Torque \( T \) generates torsional shear \( \tau_t = Tc/J \) for a rectangular section using the thin-wall approximation \( J \approx wh^3/3 \). Direct shear from transverse force adds \( \tau_v = V/A \).

Normal stresses from axial and bending load superpose: \( \sigma = \sigma_a + \sigma_b \). For ductile materials under combined normal and shear stress, the von Mises (distortion energy) criterion gives equivalent stress \( \sigma_{\mathrm{vm}} = \sqrt{\sigma^2 + 3\tau^2} \). Safety factor is \( SF = \sigma_y / \sigma_{\mathrm{vm}} \).

Stress components are evaluated at the section centroid for a prismatic rectangular cross-section. The module assumes elastic behavior and does not model local buckling, stress concentrations, or warping restraint — use dedicated beam or shell analysis when those effects govern.

Inputs must specify positive width, height, and material yield strength; zero-area sections are rejected at validation.

**Governing equations**

\[
\sigma_a = \frac{F}{A}, \quad \sigma_b = \frac{M c}{I}, \quad \tau_t = \frac{T c}{J}
\]

\[
\sigma_{\mathrm{vm}} = \sqrt{(\sigma_a + \sigma_b)^2 + 3\tau_t^2}
\]

\[
SF = \frac{\sigma_y}{\sigma_{\mathrm{vm}}}
\]

**Numerical method**

Closed-form evaluation: section properties \( A \), \( I_{xx} \), and \( J \) are computed from rectangular width and height. Individual stress components are calculated algebraically; von Mises stress and safety factor follow directly. Design status flags `safe`, `warning`, or `critical` based on threshold ratios (SF ≥ 2 safe, ≥ 1.25 warning).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `width`, `height` | Rectangular section dimensions |
| `axialForce` | Axial load \( F \) |
| `bendingMoment` | Bending moment \( M \) |
| `torque` | Torsional moment \( T \) |
| `shearForce` | Transverse shear \( V \) |
| `yieldStrength` | Material yield \( \sigma_y \) |

**Outputs**

- Section properties \( A \), \( I_{xx} \), \( J \)
- stress components
- von Mises stress
- safety factor
- design status.

**Design codes & checks**

- **Indicative:** Von Mises combined stress
- **US:** AISC 360-22 Chapter H (combined forces)
- **EU:** EN 1993-1-1 Clause 6.2.1 equivalent stress
- **ISO:** ISO 10828 equivalent stress methods


**Assumptions & limitations**

- Solid rectangular section; not I-beams, tubes, or arbitrary profiles.
- Elastic linear superposition; no buckling or local instability.
- Torsion uses rectangular approximation; thin-wall or circular sections need dedicated checks.
- Shear stress from transverse force is averaged over area (not parabolic distribution).

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed. McGraw-Hill.
2. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter H.
4. EN 1993-1-1:2005. *Eurocode 3 — Clause 6.2*.
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
