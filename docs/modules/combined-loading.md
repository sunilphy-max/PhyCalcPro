---
seoTitle: "Combined Loading Calculator — Von Mises Stress & Safety Factor | PhyCalcPro"
seoDescription: "Evaluate combined axial, bending, torsion, and shear stresses using von Mises criterion. Compute equivalent stress, safety factor, and design status for multiaxial machine element screening."
guideHeadline: "Combined Loading: Multiaxial Stress Analysis Engineering Guide"
keywords: ["combined loading", "von Mises stress", "multiaxial stress", "safety factor", "combined stress", "axial bending torsion", "distortion energy", "machine element stress", "stress calculator"]
---

### Combined Loading Guide (`combined-loading`)

## How engineers analyze combined loading

Real engineering components rarely experience a single type of loading. A shaft carries both torque and bending; a bracket sustains axial tension plus moment from eccentricity; a machine frame member sees compression, shear, and torsion simultaneously. Combined loading analysis determines the equivalent stress state from all contributions and compares it against the material yield criterion.

The von Mises (distortion energy) criterion is the standard approach for ductile materials under multiaxial stress. It states that yielding begins when the distortion energy equals that at uniaxial yield: \( \sigma_{\mathrm{vm}} = \sqrt{\sigma^2 + 3\tau^2} \) for plane stress with one normal and one shear component. This single equivalent stress allows engineers to compare a complex multiaxial state against simple tensile test data.

The PhyCalcPro combined-loading module evaluates all stress components for a rectangular cross-section — axial, bending, torsion, and direct shear — combines them via von Mises, and returns a safety factor and design status. This provides rapid screening without requiring full 3D FEA for common prismatic machine elements.

## Loading types and superposition

| Load Type | Stress Produced | Formula |
|---|---|---|
| Axial force \( F \) | Uniform normal stress | \( \sigma_a = F/A \) |
| Bending moment \( M \) | Linear normal stress | \( \sigma_b = Mc/I \) |
| Torque \( T \) | Shear stress | \( \tau_t = Tc/J \) |
| Transverse shear \( V \) | Average shear stress | \( \tau_v = V/A \) |

Normal stresses superpose algebraically: \( \sigma = \sigma_a + \sigma_b \). Shear stresses from torsion and transverse shear superpose at the critical point. The von Mises criterion then combines normal and shear.

## Engineering workflow

1. Identify all external loads on the component: forces, moments, and torques.
2. Select the critical cross-section (typically where moment is maximum or section is smallest).
3. Define rectangular section dimensions: width \( w \) and height \( h \).
4. Compute section properties: \( A = wh \), \( I = wh^3/12 \), \( J \approx wh^3/3 \) (rectangular approximation).
5. Calculate individual stress components from each load.
6. Superpose normal stresses (axial + bending) and shear stresses (torsion + direct shear).
7. Apply the von Mises criterion to get equivalent stress.
8. Compute safety factor: \( SF = \sigma_y / \sigma_{\mathrm{vm}} \).
9. Assess design status: safe (SF >= 2), warning (1.25-2), or critical (< 1.25).

## Key quantities and formulas

Stress components:

\[
\sigma_a = \frac{F}{A}, \quad \sigma_b = \frac{Mc}{I}, \quad \tau_t = \frac{Tc}{J}
\]

Von Mises equivalent stress (plane stress):

\[
\sigma_{\mathrm{vm}} = \sqrt{(\sigma_a + \sigma_b)^2 + 3(\tau_t + \tau_v)^2}
\]

Safety factor:

\[
SF = \frac{\sigma_y}{\sigma_{\mathrm{vm}}}
\]

Section properties for rectangular cross-section:

\[
A = wh, \quad I_{xx} = \frac{wh^3}{12}, \quad c = \frac{h}{2}, \quad J \approx \frac{wh^3}{3}
\]

## Worked example

**Problem:** A rectangular steel bar (50 mm wide x 80 mm tall, \( \sigma_y = 350 \) MPa) carries simultaneously: axial tension 120 kN, bending moment 8 kN-m, and torque 3 kN-m.

**Step 1 — Section properties:**

\[
A = 0.05 \times 0.08 = 4.0 \times 10^{-3} \text{ m}^2
\]
\[
I = \frac{0.05 \times 0.08^3}{12} = 2.133 \times 10^{-6} \text{ m}^4, \quad c = 0.04 \text{ m}
\]
\[
J = \frac{0.05 \times 0.08^3}{3} = 8.533 \times 10^{-6} \text{ m}^4
\]

**Step 2 — Stress components:**

\[
\sigma_a = \frac{120 \times 10^3}{4.0 \times 10^{-3}} = 30 \text{ MPa}
\]
\[
\sigma_b = \frac{8 \times 10^3 \times 0.04}{2.133 \times 10^{-6}} = 150 \text{ MPa}
\]
\[
\tau_t = \frac{3 \times 10^3 \times 0.04}{8.533 \times 10^{-6}} = 14.1 \text{ MPa}
\]

**Step 3 — Von Mises stress:**

\[
\sigma_{\mathrm{vm}} = \sqrt{(30 + 150)^2 + 3 \times 14.1^2} = \sqrt{32400 + 596} = \sqrt{32996} = 181.6 \text{ MPa}
\]

**Step 4 — Safety factor:**

\[
SF = \frac{350}{181.6} = 1.93
\]

Design status: **warning** (1.25 < SF < 2.0). Adequate for static loading but marginal for cyclic applications.

## Common mistakes and checks

- **Forgetting to add axial and bending normal stresses:** These act on the same face and must be algebraically summed before applying von Mises.
- **Using Tresca instead of von Mises without noting the difference:** Tresca (maximum shear stress) is more conservative by up to 15%. PhyCalcPro uses von Mises.
- **Applying to brittle materials:** Von Mises is valid for ductile materials. For cast iron, ceramics, or concrete, use Mohr-Coulomb or Rankine criteria instead.
- **Ignoring stress concentration factors:** The module computes nominal stress. At notches, holes, or fillets, multiply by the stress concentration factor \( K_t \) from charts.
- **Using the wrong J for non-circular sections:** The torsion constant for rectangular sections is approximate; for thin-walled or open sections, torsional behavior differs significantly.
- **Neglecting fatigue for cyclic loads:** Static safety factor alone does not ensure fatigue life. Use modified Goodman or S-N curve approaches for repeated loading.

## FAQ

### Why use von Mises instead of maximum principal stress?

Von Mises (distortion energy) correlates better with experimental yield data for ductile metals. Maximum principal stress (Rankine) is appropriate for brittle materials. For steel and aluminum, von Mises is the standard.

### Can I use this for circular cross-sections?

The module uses rectangular section formulas for \( J \). For circular shafts, the standard \( J = \pi d^4/32 \) applies — you would need to input equivalent rectangular dimensions or use the result conceptually.

### What safety factor should I target?

Depends on application: SF = 2-3 for general machinery (static), SF = 3-4 for human safety, SF = 1.5-2 for well-defined loads with quality material data. Codes like AISC prescribe specific factors.

### Does this handle fatigue (alternating loads)?

No — the module computes static equivalent stress only. For fatigue, separate the mean and alternating stress components and apply a fatigue criterion (modified Goodman, Soderberg, or S-N curves).

### When does combined loading analysis replace FEA?

For simple prismatic sections under known loads at a single critical section, this closed-form approach is exact. FEA is needed for complex geometries, stress concentrations, contact, or thermal gradients.

### What is the design status threshold logic?

- **Safe:** SF >= 2.0 — adequate margin for most static applications
- **Warning:** 1.25 <= SF < 2.0 — acceptable only with well-defined loads
- **Critical:** SF < 1.25 — redesign required

## Use the PhyCalcPro calculator

[Open the Combined Loading calculator](/products/structural/combined-loading)

**Purpose**

Evaluate combined axial, bending, torsion, and shear stresses in a rectangular cross-section. Computes von Mises equivalent stress, safety factor, and design status for quick screening of machine elements and structural members under multiaxial loading.

**Physics & theory**

Normal stresses from axial and bending superpose: \( \sigma = \sigma_a + \sigma_b \). Shear from torsion adds \( \tau_t = Tc/J \). For ductile materials, the von Mises criterion combines all components: \( \sigma_{\mathrm{vm}} = \sqrt{\sigma^2 + 3\tau^2} \). Safety factor is yield strength divided by equivalent stress.

**Governing equations**

\[
\sigma_{\mathrm{vm}} = \sqrt{(\sigma_a + \sigma_b)^2 + 3\tau_t^2}, \quad SF = \frac{\sigma_y}{\sigma_{\mathrm{vm}}}
\]

**Numerical method**

Closed-form evaluation: section properties are computed from width and height. Individual stress components are calculated algebraically; von Mises stress and safety factor follow directly. Design status flags: safe, warning, or critical based on SF thresholds.

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
- Individual stress components (\( \sigma_a \), \( \sigma_b \), \( \tau_t \), \( \tau_v \))
- Von Mises equivalent stress
- Safety factor
- Design status (safe/warning/critical)

**Design codes & checks**

- **Indicative:** Von Mises combined stress criterion
- **US:** AISC 360-22 Chapter H (combined forces screening)
- **EU:** EN 1993-1-1 Clause 6.2.1 equivalent stress
- **ISO:** ISO 10828 equivalent stress methods

**Assumptions & limitations**

- Solid rectangular section only; not I-beams, tubes, or arbitrary profiles.
- Elastic linear superposition; no buckling or local instability.
- Torsion uses rectangular approximation; thin-wall or circular sections need dedicated checks.
- Shear stress from transverse force is averaged (not parabolic distribution).
- No stress concentration factors applied; user must account for notches externally.

**Verification**

- CI: `combined-loading-indicative-01.json`
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed. McGraw-Hill.
2. Gere, J. M., & Goodno, B. J. *Mechanics of Materials*, 9th ed. Cengage.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter H.
4. EN 1993-1-1:2005. *Eurocode 3 — Clause 6.2*.
5. Dowling, N. E. *Mechanical Behavior of Materials*, 4th ed. Pearson.
